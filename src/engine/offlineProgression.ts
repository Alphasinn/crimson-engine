import { usePlayerStore } from '../store/playerStore';
import { useCombatStore } from '../store/combatStore';
import { useSkillingStore } from '../store/skillingStore';
import { HARVESTING_NODES } from '../data/harvesting';
import { ALL_SKILLING_NODES } from '../data/skilling';
import type { SkillName } from './types';
import { 
    computeDerivedStats, calcStyleBonus, calcHitChance, 
    calcHeavyWeaknessMult, applyMitigation 
} from './formulas';

export interface OfflineProgressResult {
    timeAwayMs: number;
    cappedTimeMs: number;
    skillGains: { [key in SkillName]?: { xp: number; actions: number } };
    itemGains: { [itemId: string]: number };
    itemConsumed: { [itemId: string]: number };
    defeated: boolean;
    combatKills: number;
}

export function calculateOfflineProgress(): OfflineProgressResult | null {
    const pStore = usePlayerStore.getState();
    const cStore = useCombatStore.getState();
    const sStore = useSkillingStore.getState();
    
    const lastSession = pStore.lastSessionTimestamp;
    if (!lastSession) return null;
    
    const now = Date.now();
    const timeAway = now - lastSession;
    
    // Minimum 1 minute to trigger offline progress
    if (timeAway < 60000) return null;
    
    const baseCapMs = 12 * 60 * 60 * 1000; // 12 hours
    const extraCapMs = (pStore.offlineProgressTiers || 0) * 2 * 60 * 60 * 1000; // +2 hours per tier
    const maxCapMs = baseCapMs + extraCapMs;
    
    const cappedTime = Math.min(timeAway, maxCapMs);
    
    const result: OfflineProgressResult = {
        timeAwayMs: timeAway,
        cappedTimeMs: cappedTime,
        skillGains: {},
        itemGains: {},
        itemConsumed: {},
        defeated: false,
        combatKills: 0
    };
    
    // Skilling Branch
    if (sStore.isActive && sStore.activeNodeId && sStore.activeSkill) {
        const nodeId = sStore.activeNodeId;
        const skill = sStore.activeSkill;
        const node = ALL_SKILLING_NODES[nodeId] || HARVESTING_NODES[nodeId];
        
        if (node) {
            const timeMs = 'timeMs' in node ? node.timeMs : (skill === 'bloodletting' ? (node as any).baseHarvestTimeMs : (node as any).baseDistillTimeMs);
            const actionsPossible = Math.floor(cappedTime / timeMs);
            
            let actualActions = actionsPossible;
            
            // Check ingredients
            if ('ingredients' in node && node.ingredients) {
                let maxByIngredients = actionsPossible;
                node.ingredients.forEach(ing => {
                    const owned = pStore.getResourceQuantity(ing.id);
                    const possibleWithThis = Math.floor(owned / ing.quantity);
                    maxByIngredients = Math.min(maxByIngredients, possibleWithThis);
                });
                actualActions = Math.max(0, maxByIngredients);
            }
            
            if (actualActions > 0) {
                // Calculate gains
                const totalXp = actualActions * node.xp;
                result.skillGains[skill] = { xp: totalXp, actions: actualActions };
                
                // Calculate items
                if ('ingredients' in node && node.ingredients) {
                    node.ingredients.forEach(ing => {
                        const consumed = actualActions * ing.quantity;
                        result.itemConsumed[ing.id] = consumed;
                    });
                }
                
                if (node.output) {
                    const produced = actualActions * (node.output.quantity || 1);
                    result.itemGains[node.output.id] = produced;
                }
            }
        }
    }
    
    // Combat Branch
    if (cStore.isRunning && cStore.activeEnemy && cStore.selectedZone) {
        const enemy = cStore.activeEnemy;
        
        // Calculate Player Stats
        const derived = computeDerivedStats(pStore.skills, pStore.equipment, {
            permanentArmorBonus: pStore.permanentArmorBonus || 0,
            isFinesseActive: false, // Assume false for offline
            isLowHp: false,
            isFlickerActive: false
        });
        
        const playerStyle = derived.weaponStyle;
        const subStyle = derived.weaponSubStyle;
        
        // Calculate Player DPS
        const styleBonus = calcStyleBonus(playerStyle, enemy.weakness, enemy.resistance, subStyle);
        const enemyEvasion = enemy.stats.defense * 4;
        const playerHitChance = calcHitChance(derived.accuracyRating, enemyEvasion, styleBonus, 1, 1);
        
        const maxHit = playerStyle === 'melee' ? derived.meleeMaxHit : playerStyle === 'archery' ? derived.rangedMaxHit : derived.magicMaxHit;
        const isHeavy = derived.attackInterval > 2.2;
        const weaknessMaxMult = calcHeavyWeaknessMult(isHeavy, playerStyle, enemy.weakness, subStyle);
        const effectiveMaxHit = Math.floor(maxHit * weaknessMaxMult);
        
        const avgRawDamage = (effectiveMaxHit * (1 + (derived.minDamagePct || 0))) / 2;
        const preMitigation = Math.floor(avgRawDamage * (1.0 + styleBonus)); // Simplified MC
        
        const enemyFlatArmor = (enemy.stats as any).flatArmor || 0;
        const enemyDr = (enemy.stats as any).drPercent || 0;
        const avgPlayerDamage = applyMitigation(preMitigation, enemyFlatArmor, enemyDr, derived.armPen, subStyle, derived.attackInterval);
        
        const playerDps = (playerHitChance * avgPlayerDamage) / derived.attackInterval;
        
        // Calculate Monster DPS
        const monsterAccuracy = enemy.accuracy;
        const monsterHitChance = calcHitChance(monsterAccuracy, derived.evasionRating, 0, 1, 1);
        
        const avgMonsterRawDamage = enemy.maxHit / 2;
        const avgMonsterDamage = applyMitigation(avgMonsterRawDamage, derived.flatArmor, derived.damageReduction, 0, enemy.damageProfile, enemy.attackInterval);
        
        const monsterDps = (monsterHitChance * avgMonsterDamage) / enemy.attackInterval;
        
        // Simulation
        const playerTtk = enemy.stats.hp / playerDps;
        const killsPossible = Math.floor(cappedTime / (playerTtk * 1000)); // Convert to ms
        
        // Food check
        const food = pStore.food.find(f => f.type === 'food' && f.quantity > 0);
        
        if (food && food.healAmount) {
            const damagePerKill = monsterDps * playerTtk;
            const foodNeededPerKill = damagePerKill / food.healAmount;
            
            const totalFood = food.quantity;
            const killsWithFood = Math.floor(totalFood / foodNeededPerKill);
            
            const actualKills = Math.min(killsPossible, killsWithFood);
            
            result.combatKills = actualKills;
            
            // Consume food
            const foodConsumed = Math.ceil(actualKills * foodNeededPerKill);
            result.itemConsumed[food.id] = Math.min(totalFood, foodConsumed);
            
            // Defeat condition
            if (killsWithFood < killsPossible) {
                result.defeated = true;
            }
            
            // Rewards (XP and Loot)
            // Assume 100% chance for Blood Shards (average 5)
            result.itemGains['blood_shard'] = actualKills * 5;
            
            // XP
            // Combat awarding is complex, let's give a flat amount for now or calculate based on mode!
            const xpPerKill = 50; // Placeholder
            const trainingSkill = pStore.trainingMode === 'attack' ? 'fangMastery' : pStore.trainingMode === 'strength' ? 'predatorForce' : 'obsidianWard';
            result.skillGains[trainingSkill] = { xp: actualKills * xpPerKill, actions: actualKills };
        } else {
            // No food! If they take damage, they die!
            if (monsterDps > 0) {
                result.defeated = true;
                result.combatKills = 0;
            } else {
                result.combatKills = killsPossible;
            }
        }
    }
    
    return result;
}
