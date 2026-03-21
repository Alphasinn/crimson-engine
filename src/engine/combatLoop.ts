// =============================================================================
// CRIMSON ENGINE — Combat Loop Engine
// The tick-based combat engine. Zero React dependencies.
// Communicate with the UI via event callbacks.
// =============================================================================

import {
    TICK_MS,
} from './constants';
import {
    calcHitChance,
    rollDamage,
    applyMitigation,
    rollBlock,
    calcMeterFillPerTick,
    calcHitXpGains,
    computeDerivedStats,
    calcStyleBonus,
    calcHeavyWeaknessMult,
    applyMultiplicativeCompression,
} from './formulas';
import {
    MC_POWER_DEFAULT,
    MC_POWER_SLASH,
    SIPHON_HEAL_PCT,
    SIPHON_BASE_COST,
    SIPHON_COST_EXPONENT,
    SCENT_BUILD_INTERVAL,
    SCENT_INCREMENT,
    SCENT_ACCURACY_CAP,
    RED_MIST_THRESHOLD,
    RED_MIST_DMG_BONUS,
    RED_MIST_ICHOR_MOD,
} from './constants';
import { rollLootEntry } from './lootRoller';
import type {
    Enemy,
    Zone,
    PlayerSkills,
    PlayerEquipment,
    DerivedStats,
    TrainingMode,
    CombatEvent,
    CombatEventType,
    LootTableEntry,
    InventoryItem,
} from './types';

// =============================================================================
// Event Payload Types
// =============================================================================

export interface AttackResult {
    hit: boolean;
    blocked: boolean;
    damage: number;
}

export interface CombatCallbacks {
    onPlayerAttack: (result: AttackResult, enemy: Enemy) => void;
    onEnemyAttack: (result: AttackResult) => void;
    onEnemyDeath: (enemy: Enemy, xpGains: Partial<PlayerSkills>, loot: LootTableEntry | null) => void;
    onPlayerDeath: (isBraced: boolean, isRedMist: boolean) => void;
    onRespawn: (enemy: Enemy) => void;
    onTick: (playerMeter: number, enemyMeter: number, playerHp: number, enemyHp: number, tick: number, activeCombat: any) => void;
    onAutoEat: (healAmount: number) => void;
    onHitXp: (gains: Partial<PlayerSkills>) => void;
    onLog: (event: CombatEvent) => void;
    onLoot: (item: { itemId: string, itemName: string, quantity: number }, isRedMist: boolean) => void;
    onTrySiphon: (cost: number, callback: (success: boolean) => void) => void;
    // Distill Actions
    sanguineFinesse: () => void;
    vileReinforcement: () => void;
}

// =============================================================================
// CombatEngine Class
// =============================================================================

export class CombatEngine {
    private zone: Zone | null = null;
    private enemy: Enemy | null = null;
    private enemyIndex: number = 0;

    private playerHp: number = 0;
    private playerMaxHp: number = 0;
    private enemyHp: number = 0;

    private playerMeter: number = 0;
    private enemyMeter: number = 0;

    private currentTick: number = 0;
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isRunning: boolean = false;

    private skills: PlayerSkills = {} as PlayerSkills;
    private equipment: PlayerEquipment = {};
    private trainingMode: TrainingMode = 'attack';
    private derived: DerivedStats = {} as DerivedStats;
    private food: InventoryItem[] = [];
    private autoEatThreshold: number = 0.5;
    private autoEatEnabled: boolean = false;
    private callbacks: CombatCallbacks;

    // Phase 2A State
    private scentIntensity: number = 0.0;
    private lastDamageTick: number = 0;
    private siphonsThisHunt: number = 0;
    private redMistTicks: number = 0;
    private redMistIchorDrops: number = 0;
    private redMistDeaths: number = 0;
    private isRedMistActive: boolean = false;
    private isBraced: boolean = false; // Set via playerStore
    private finesseTicksRemaining: number = 0;
    private famineRestTicks: number = 0;
    private redMistOccurred: boolean = false;
    private permanentArmorBonus: number = 0;
    private bloodShards: number = 0; // Local copy for Famine Rest

    constructor(callbacks: CombatCallbacks) {
        this.callbacks = callbacks;
    }

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------

    start(
        zone: Zone,
        skills: PlayerSkills,
        equipment: PlayerEquipment,
        food: InventoryItem[],
        autoEatEnabled: boolean,
        autoEatThreshold: number,
        initialHp?: number,
        trainingMode: TrainingMode = 'attack',
        meta?: { isBraced: boolean, permanentArmorBonus: number, bloodShards: number, finesseTicksRemaining: number }
    ): void {
        if (this.isRunning) this.stop();
        this.zone = zone;
        this.skills = skills;
        this.equipment = equipment;
        this.trainingMode = trainingMode;
        this.food = food;
        this.autoEatEnabled = autoEatEnabled;
        this.autoEatThreshold = autoEatThreshold;
        this.isBraced = meta?.isBraced ?? false;
        this.permanentArmorBonus = meta?.permanentArmorBonus ?? 0;
        this.bloodShards = meta?.bloodShards ?? 0;
        this.finesseTicksRemaining = meta?.finesseTicksRemaining ?? 0;
        this.redMistOccurred = false;
        this.enemyIndex = 0;
        this.currentTick = 0;
        this.recomputeDerived();

        this.playerMaxHp = this.derived.maxHp;
        // Use initialHp if provided, otherwise default to max (first time start usually)
        this.playerHp = initialHp !== undefined ? Math.min(initialHp, this.playerMaxHp) : this.playerMaxHp;

        this.spawnNextEnemy();
        this.isRunning = true;
        this.intervalId = setInterval(() => this.tick(), TICK_MS);
    }

    stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    /** Update player skills/equipment/trainingMode mid-session */
    updatePlayerState(
        skills: PlayerSkills,
        equipment: PlayerEquipment,
        food: InventoryItem[],
        trainingMode: TrainingMode,
        autoEatEnabled: boolean,
        autoEatThreshold: number,
        meta?: { isBraced: boolean, permanentArmorBonus: number, bloodShards: number, finesseTicksRemaining: number }
    ): void {
        this.skills = skills;
        this.equipment = equipment;
        this.food = food;
        this.trainingMode = trainingMode;
        this.autoEatEnabled = autoEatEnabled;
        this.autoEatThreshold = autoEatThreshold;
        this.isBraced = meta?.isBraced ?? false;
        this.permanentArmorBonus = meta?.permanentArmorBonus ?? 0;
        this.bloodShards = meta?.bloodShards ?? 0;
        this.finesseTicksRemaining = meta?.finesseTicksRemaining ?? 0;
        this.recomputeDerived();
        this.playerHp = Math.min(this.playerHp, this.derived.maxHp);
        this.playerMaxHp = this.derived.maxHp;
    }

    /** Manually heal the player (e.g. from UI click) */
    heal(amount: number): number {
        const healed = Math.min(amount, this.playerMaxHp - this.playerHp);
        if (healed <= 0) return 0;
        this.playerHp += healed;
        this.log('auto_eat', `Healed (+${healed} HP).`, healed);
        return healed;
    }

    /** Update callbacks if dependencies change in the React hook */
    setCallbacks(callbacks: CombatCallbacks): void {
        this.callbacks = callbacks;
    }

    get running(): boolean { return this.isRunning; }
    get redMistSurvived(): boolean { return this.redMistOccurred && this.isRunning; }
    get tickCount(): number { return this.currentTick; }

    // ---------------------------------------------------------------------------
    // Internal Mechanics
    // ---------------------------------------------------------------------------

    private recomputeDerived(): void {
        const hpRatio = this.playerHp / (this.playerMaxHp || 10);
        this.derived = computeDerivedStats(this.skills, this.equipment, {
            permanentArmorBonus: this.permanentArmorBonus,
            isFinesseActive: this.finesseTicksRemaining > 0,
            isLowHp: hpRatio < 0.50
        });
    }

    private spawnNextEnemy(): void {
        if (!this.zone) return;
        // Element from pool could be fetched here, but currently enemy is resolved by the store
        // For now we accept it was set externally via setEnemyById
        // The store calls start() with already-resolved enemy objects
        // So we trust this.enemy is set correctly before start().
        // This method just resets meters for whichever enemy is loaded.
        this.enemyMeter = 0;
        this.playerMeter = 0;
        if (this.enemy) {
            this.enemyHp = this.enemy.stats.hp;
            this.log('respawn', `${this.enemy.name} appears.`);
            this.callbacks.onRespawn(this.enemy);
        }
    }

    /** Called by the store to set an actual enemy object */
    setEnemy(enemy: Enemy): void {
        this.enemy = enemy;
        this.enemyHp = enemy.stats.hp;
        this.enemyMeter = 0;
        this.playerMeter = 0;
    }

    private tick(): void {
        if (!this.enemy || !this.isRunning) return;
        this.currentTick++;

        // --- Phase 2A: Auto-Actions ---
        this.tryAutoEat();
        this.trySiphon();
        // --- Phase 2A: Red Mist Check ---
        const hpRatio = this.playerHp / this.playerMaxHp;
        const wasRedMist = this.isRedMistActive;
        this.isRedMistActive = hpRatio < RED_MIST_THRESHOLD;
        
        if (this.isRedMistActive) {
            this.redMistTicks++;
            this.redMistOccurred = true;
            if (!wasRedMist) this.log('xp_gain' as any, "The Red Mist descends... (+20% Dmg, +10% Ichor)");
        }

        const ticksSinceDamage = this.currentTick - this.lastDamageTick;
        if (ticksSinceDamage > 0 && ticksSinceDamage % SCENT_BUILD_INTERVAL === 0) {
            const scentPenaltyMultiplier = 1 + this.derived.scentSensitivity;
            this.scentIntensity = Math.min(SCENT_ACCURACY_CAP, this.scentIntensity + (SCENT_INCREMENT * scentPenaltyMultiplier));
        }

        // --- Phase 2A: Famine Rest ---
        if (hpRatio < 0.30 && this.bloodShards < 5) {
            this.famineRestTicks++;
            if (this.famineRestTicks >= 50) { // 5 seconds @ 100ms
                this.famineRestTicks = 0;
                this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 1);
                this.log('regenPerSec' as any, "Famine Rest (+1 HP).");
            }
        } else {
            this.famineRestTicks = 0;
        }

        // --- Phase 2A: Sanguine Finesse Duration ---
        if (this.finesseTicksRemaining > 0) {
            this.finesseTicksRemaining--;
            if (this.finesseTicksRemaining === 0) {
                this.log('xp_gain' as any, "Sanguine Finesse fades.");
                this.recomputeDerived();
            }
        }

        // --- Spectral Regeneration (v1.2) ---
        if (this.derived.regenPerSec > 0 && this.playerHp < this.playerMaxHp) {
            const regenAmount = this.derived.regenPerSec * (TICK_MS / 1000);
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + regenAmount);
        }

        // --- Fill attack meters ---
        const playerFill = calcMeterFillPerTick(this.derived.attackInterval, TICK_MS);
        const enemyFill = calcMeterFillPerTick(this.enemy.attackInterval, TICK_MS);

        this.playerMeter += playerFill;
        this.enemyMeter += enemyFill;

        // --- Player attacks when meter is full ---
        if (this.playerMeter >= 1.0) {
            this.playerMeter = 0;
            this.resolvePlayerAttack();
        }

        // --- Enemy attacks when meter is full ---
        if (this.enemyMeter >= 1.0 && this.isRunning) {
            this.enemyMeter = 0;
            this.resolveEnemyAttack();
        }

        // --- Phase 2A: Early exit if dead to prevent onTick overwriting recovery HP ---
        if (this.playerHp <= 0) return;

        // --- Auto-eat check ---
        if (this.autoEatEnabled && (this.playerHp / this.playerMaxHp < this.autoEatThreshold)) {
            this.tryAutoEat();
        }

        // --- Report state each tick ---
        this.callbacks.onTick(
            Math.min(this.playerMeter, 1),
            Math.min(this.enemyMeter, 1),
            this.playerHp,
            this.enemyHp,
            this.currentTick,
            {
                scentIntensity: this.scentIntensity,
                isRedMistActive: this.isRedMistActive,
                redMistTicks: this.redMistTicks,
                redMistIchorDrops: this.redMistIchorDrops,
                redMistDeaths: this.redMistDeaths,
                siphonsThisHunt: this.siphonsThisHunt,
                finesseTicksRemaining: this.finesseTicksRemaining,
                isBraced: this.isBraced
            }
        );

        // Notify UI of Phase 2A metrics if they changed meaningfully or periodically
        // (Implementation detail: usually handled by onTick if Payload is updated)
    }

    private resolvePlayerAttack(): void {
        if (!this.enemy) return;

        const styleBonus = calcStyleBonus(
            this.derived.weaponStyle,
            this.enemy.weakness,
            this.enemy.resistance,
            this.derived.weaponSubStyle
        );
        const { stats } = this.enemy;
        const enemyEvasion = stats.defense * 4;
        const hitChance = calcHitChance(
            this.derived.accuracyRating,
            enemyEvasion,
            styleBonus,
            1,
            1
        );

        const hit = Math.random() <= hitChance;
        let damage = 0;
        let blocked = false;

        if (hit) {
            const maxHit = this.derived.weaponStyle === 'melee'
                ? this.derived.meleeMaxHit
                : this.derived.weaponStyle === 'archery'
                    ? this.derived.rangedMaxHit
                    : this.derived.magicMaxHit;

            const isHeavy = this.derived.attackInterval > 2.2;

            const weaknessMaxMult = calcHeavyWeaknessMult(
                isHeavy,
                this.derived.weaponStyle,
                this.enemy.weakness,
                this.derived.weaponSubStyle
            );

            const effectiveMaxHit = Math.floor(maxHit * weaknessMaxMult);
            const raw = rollDamage(effectiveMaxHit, this.derived.minDamagePct);
            
            // v1.7: Apply Multiplicative Compression
            const styleBonus = calcStyleBonus(
                this.derived.weaponStyle,
                this.enemy.weakness,
                this.enemy.resistance,
                this.derived.weaponSubStyle
            );
            // In the live engine, we represent multipliers as (1 + styleBonus)
            // If there were other multipliers (buffs), we'd stack them here.
            const totalMult = 1.0 + styleBonus; 
            const mcPower = this.derived.weaponSubStyle === 'slash' ? MC_POWER_SLASH : MC_POWER_DEFAULT;
            const { finalMult } = applyMultiplicativeCompression(totalMult, mcPower);
            
            const preMitigation = Math.floor(raw * finalMult);
            
            // Phase 2A: Red Mist Bonus
            let finalDmg = preMitigation;
            if (this.isRedMistActive) {
                finalDmg = Math.floor(finalDmg * RED_MIST_DMG_BONUS);
            }

            // Apply Enemy Mitigation with Trinity Lock (Style + Interval)
            const enemyFlatArmor = (this.enemy.stats as any).flatArmor ?? 0;
            const enemyDr = (this.enemy.stats as any).drPercent ?? 0;
            const mitigated = applyMitigation(
                preMitigation, 
                enemyFlatArmor, 
                enemyDr, 
                this.derived.armPen,
                this.derived.weaponSubStyle,
                this.derived.attackInterval
            );

            const damageOutcome = Math.min(mitigated, this.enemyHp); 
            damage = damageOutcome;

            this.enemyHp -= damage;
            this.log('hit', `You hit ${this.enemy.name} for ${damage} damage.`, damage);

            // --- Per-hit XP (Idle Clans model) ---
            const xpGains = calcHitXpGains(damage, this.trainingMode);
            this.callbacks.onHitXp(xpGains);

            // Check for lifesteal
            if (this.derived.lifestealPercent > 0) {
                const healed = Math.floor(damage * this.derived.lifestealPercent);
                this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healed);
            }
        } else {
            this.log('miss', `You missed ${this.enemy.name}.`);
        }

        this.callbacks.onPlayerAttack({ hit, blocked, damage }, this.enemy);

        // --- Enemy death ---
        if (this.enemyHp <= 0) {
            this.handleEnemyDeath();
        }
    }

    private resolveEnemyAttack(): void {
        if (!this.enemy) return;
 
        const enemyAccuracy = this.enemy.accuracy;
        const totalEnemyAccuracy = enemyAccuracy * (1 + this.scentIntensity);
        
        const hitChance = calcHitChance(
            totalEnemyAccuracy,
            this.derived.evasionRating,
            0, 1, 1
        );

        const hit = Math.random() <= hitChance;
        let damage = 0;
        let blocked = false;

        if (hit) {
            // Check block first
            blocked = rollBlock(this.derived.blockChance);
            if (!blocked) {
                const enemyMaxHit = this.enemy.maxHit;
                const raw = rollDamage(enemyMaxHit);
                const mitigated = applyMitigation(
                    raw, 
                    this.derived.flatArmor, 
                    this.derived.damageReduction,
                    0, // Player doesn't have ARMPEN yet
                    this.enemy.damageProfile,
                    this.enemy.attackInterval
                );
                damage = Math.min(mitigated, this.playerHp); // Cap damage to current player HP
                this.playerHp -= damage;
                this.lastDamageTick = this.currentTick;
                this.scentIntensity = 0; // Reset scent on damage
                this.log('enemy_hit', `${this.enemy.name} hits you for ${damage} damage.`, damage);

                // --- Blood Siphon (v1.2 Sorcery Set Bonus) ---
                if (this.derived.siphonChance > 0 && Math.random() < this.derived.siphonChance) {
                    const siphoned = Math.floor(damage * this.derived.siphonAmount);
                    if (siphoned > 0) {
                        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + siphoned);
                        this.log('siphon', `Blood Siphon triggered! Recovered ${siphoned} HP.`, siphoned);
                    }
                }
            } else {
                this.log('enemy_miss', `You blocked ${this.enemy.name}'s attack!`);
            }
        } else {
            this.log('enemy_miss', `${this.enemy.name} missed you.`);
        }

        this.callbacks.onEnemyAttack({ hit, blocked, damage });

        // --- Player death ---
        if (this.playerHp <= 0) {
            this.handlePlayerDeath();
        }
    }

    private handleEnemyDeath(): void {
        if (!this.enemy) return;
        const enemy = this.enemy;
        this.log('kill', `${enemy.name} has been slain!`);

        // Phase 2A: Blood Shard Reward (Tier 1 baseline: 3-8)
        const shardCount = Math.floor(3 + Math.random() * 6);
        this.callbacks.onLoot({ itemId: 'blood_shard', itemName: 'Blood Shard', quantity: shardCount }, this.isRedMistActive);

        // Phase 2A: Cursed Ichor Roll with Red Mist bonus
        let ichorChance = 0.05; // 5% Base for Tier 1 Elite?
        if (this.isRedMistActive) ichorChance += RED_MIST_ICHOR_MOD;
        
        if (Math.random() < ichorChance) {
            if (this.isRedMistActive) this.redMistIchorDrops++;
            this.callbacks.onLoot({ itemId: 'cursed_ichor', itemName: 'Cursed Ichor', quantity: 1 }, this.isRedMistActive);
        }

        // XP is now awarded per-hit — roll other loot
        const loot = rollLootEntry(enemy.lootTable);
        if (loot) {
            this.log('loot', `Looted: ${loot.itemName}`);
        }

        this.callbacks.onEnemyDeath(enemy, {}, loot);

        // Respawn next enemy after delay
        const respawnMs = (this.zone?.respawnBase ?? 2) * 1000;
        this.stop();
        setTimeout(() => {
            if (!this.zone) return;
            this.enemyIndex = (this.enemyIndex + 1) % this.zone.enemyPool.length;
            // Reset enemy HP and meters for the new fight
            this.spawnNextEnemy();
            this.isRunning = true;
            this.intervalId = setInterval(() => this.tick(), TICK_MS);
        }, respawnMs);
    }

    private handlePlayerDeath(): void {
        this.stop();
        this.log('player_death', 'You have been slain. Penalties applied.');
        if (this.isRedMistActive) this.redMistDeaths++;
        this.callbacks.onPlayerDeath(this.isBraced, this.isRedMistActive);
    }

    private tryAutoEat(): void {
        if (!this.autoEatEnabled) return;
        if (this.playerHp / this.playerMaxHp > this.autoEatThreshold) return;

        const food = this.food.find(f => f.type === 'food' && f.quantity > 0);
        if (!food || !food.healAmount) return;
        const healed = Math.min(food.healAmount, this.playerMaxHp - this.playerHp);
        if (healed <= 0) return;
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healed);
        this.log('auto_eat', `Auto-ate ${food.name} (+${healed} HP).`, healed);
        this.callbacks.onAutoEat(healed);
    }

    private trySiphon(): void {
        // Siphoning triggers if HP is low and we have shards (handled by callbacks/store)
        if (this.playerHp / this.playerMaxHp > 0.3) return; 

        const cost = Math.floor(SIPHON_BASE_COST * Math.pow(SIPHON_COST_EXPONENT, this.siphonsThisHunt));
        
        // This call will be bridged to playerStore.siphon(this.playerMaxHp) via callback
        this.callbacks.onTrySiphon(cost, (success: boolean) => {
            if (success) {
                this.siphonsThisHunt++;
                this.scentIntensity *= 0.5; // Reduce scent per spec
                this.log('siphon', `Siphoned Blood Shards (+${Math.floor(this.playerMaxHp * SIPHON_HEAL_PCT)} HP). Cost: ${cost} Shards.`);
            }
        });
    }

    private log(type: CombatEventType, message: string, value?: number): void {
        const event: CombatEvent = {
            id: `${this.currentTick}-${type}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            tick: this.currentTick,
            message,
            value,
        };
        this.callbacks.onLog(event);
    }
}
