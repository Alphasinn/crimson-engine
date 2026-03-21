import { 
    computeDerivedStats, 
    calcHitChance, 
    rollDamage, 
    applyMitigation, 
    calcMeterFillPerTick, 
    applyWeaknessMod,
    calcHeavyWeaknessMult
} from './formulas';
import { WEAPON_MAP } from '../data/weapons';
import { ENEMY_MAP } from '../data/enemies';
import type { PlayerSkills, PlayerEquipment } from './types';

// =============================================================================
// BALANCE BASELINE v1.0 SIMULATION SUITE
// =============================================================================

function getSkills(level: number): PlayerSkills {
    return {
        fangMastery: { level, xp: 0 },
        predatorForce: { level, xp: 0 },
        obsidianWard: { level, xp: 0 },
        shadowArchery: { level, xp: 0 },
        bloodSorcery: { level, xp: 0 },
        vitae: { level: 10, xp: 0 }, // Baseline
    };
}

export function runFullBaselineSim() {
    console.log("=== BALANCE BASELINE v1.0 VALIDATION ===");
    
    const testSuites = [
        { tier: 'T1', level: 15, enemy: 'peasant_defender', elite: 'novice_vampire_hunter' },
        { tier: 'T2', level: 35, enemy: 'bloodstarved_wolf', elite: 'pack_alpha' },
        { tier: 'T3', level: 55, enemy: 'hunter_recruit', elite: 'hunter_captain' },
        { tier: 'T4', level: 75, enemy: 'restless_skeleton', elite: 'catacomb_warden' },
        { tier: 'T5', level: 95, enemy: 'clan_outcast', elite: 'clan_bloodlord' },
        { tier: 'T6', level: 120, enemy: 'night_sentinel', elite: 'crimson_patriarch' },
    ];

    testSuites.forEach(suite => {
        console.log(`\n--- TIER ${suite.tier} (Level ${suite.level}) ---`);
        const skills = getSkills(suite.level);
        
        const fastWeapon = suite.tier === 'T6' ? 'shadowfang' : 'silver_dagger'; 
        const heavyWeapon = suite.tier === 'T6' ? 'blade_eternal_hunger' : 'bloodlord_greatsword'; 
        
        const fastResult = simulateTier(skills, fastWeapon, suite.enemy);
        const heavyResult = simulateTier(skills, heavyWeapon, suite.enemy);
        const eliteResult = simulateTier(skills, heavyWeapon, suite.elite, true); 

        console.log(`Normal (${suite.enemy}): Fast=${fastResult.avgSeconds}s | Heavy=${heavyResult.avgSeconds}s`);
        console.log(`Elite (${suite.elite}): Heavy=${eliteResult.avgSeconds}s | Sustain: ${eliteResult.netSustain}`);
    });
}

function simulateTier(skills: PlayerSkills, weaponId: string, enemyId: string, matchWeakness = false) {
    const weapon = WEAPON_MAP.get(weaponId);
    
    const equipment: PlayerEquipment = {
        weapon,
        helmet: undefined,
        chest: undefined,
        cape: undefined
    };

    return simulate(skills, equipment, enemyId, 500, matchWeakness);
}

function simulate(skills: PlayerSkills, equipment: PlayerEquipment, enemyId: string, iterations: number, matchWeakness = false) {
    const enemy = ENEMY_MAP.get(enemyId)!;
    const pStats = computeDerivedStats(skills, equipment);

    let totalTicks = 0;
    let totalDamageDealt = 0;
    let totalDamageTaken = 0;
    let totalLifesteal = 0;

    for (let i = 0; i < iterations; i++) {
        let eHp = enemy.stats.hp;
        let pHp = pStats.maxHp;
        let pMeter = 0;
        let eMeter = 0;
        const tickMs = 100;

        while (eHp > 0 && pHp > 0) {
            totalTicks++;
            pMeter += calcMeterFillPerTick(pStats.attackInterval, tickMs);
            eMeter += calcMeterFillPerTick(enemy.attackInterval, tickMs);

            if (pMeter >= 1.0) {
                pMeter -= 1.0;
                const hitChance = calcHitChance(pStats.accuracyRating, enemy.stats.defense * 4);
                if (Math.random() < hitChance) {
                    const isHeavy = pStats.attackInterval > 2.2;
                    const wType = matchWeakness ? enemy.weakness : undefined;
                    const weaknessMaxMult = calcHeavyWeaknessMult(isHeavy, pStats.weaponStyle, wType || null, pStats.weaponSubStyle);
                    
                    const maxHit = pStats.meleeMaxHit;
                    const effectiveMaxHit = Math.floor(maxHit * weaknessMaxMult);
                    const rolled = rollDamage(effectiveMaxHit, pStats.minDamagePct);
                    
                    const enemyFlatArmor = enemy.stats.flatArmor ?? 0;
                    const enemyDr = enemy.stats.drPercent ?? 0;
                    const mitigated = applyMitigation(rolled, enemyFlatArmor, enemyDr, pStats.armPen);
                    
                    const styleMatch = matchWeakness && enemy.weakness ? enemy.weakness : pStats.weaponStyle;
                    const dmg = applyWeaknessMod(mitigated, styleMatch as any, enemy.weakness, enemy.resistance, pStats.weaponSubStyle);
                    
                    eHp -= dmg;
                    totalDamageDealt += dmg;
                    const ls = Math.floor(dmg * pStats.lifestealPercent);
                    pHp = Math.min(pStats.maxHp, pHp + ls);
                    totalLifesteal += ls;
                }
            }

            if (eMeter >= 1.0 && eHp > 0) {
                eMeter -= 1.0;
                const eAccuracy = enemy.stats.attack * 4;
                const hitChance = calcHitChance(eAccuracy, pStats.evasionRating);
                if (Math.random() < hitChance) {
                    const eRaw = Math.floor(Math.random() * (enemy.stats.strength / 2 + 1));
                    const dmg = applyMitigation(eRaw, 0, pStats.damageReduction);
                    pHp -= dmg;
                    totalDamageTaken += dmg;
                }
            }
            if (totalTicks > 100000) break; 
        }
    }

    return {
        avgSeconds: ((totalTicks * 0.1) / iterations).toFixed(1),
        dps: (totalDamageDealt / (totalTicks * 0.1)).toFixed(2),
        netSustain: ((totalLifesteal - totalDamageTaken) / (totalTicks * 0.1)).toFixed(2),
    };
}
