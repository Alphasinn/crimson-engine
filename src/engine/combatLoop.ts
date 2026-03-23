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
    calcScentScalingDmg,
    calcScentScalingHp,
} from './formulas';
import {
    MC_POWER_DEFAULT,
    MC_POWER_SLASH,
    SIPHON_HEAL_PCT,
    SIPHON_BASE_COST,
    SIPHON_COST_EXPONENT,
    SCENT_BUILD_INTERVAL,
    SCENT_INCREMENT,
    RED_MIST_ICHOR_MOD,
    BOSS_SCENT_THRESHOLD,
    SCENT_REDUCTION_BOSS,
    EVENT_THRESHOLD_BLOODLUST,
    EVENT_THRESHOLD_CURSE,
    EVENT_THRESHOLD_FANGS,
    RED_MIST_THRESHOLD,
    SCENT_ACCURACY_CAP,
    RED_MIST_DMG_BONUS,
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
    isCritical: boolean;
}

export interface CombatCallbacks {
    onPlayerAttack: (result: AttackResult, enemy: Enemy) => void;
    onEnemyAttack: (result: AttackResult) => void;
    onEnemyDeath: (enemy: Enemy, sessionStats: any, loot: LootTableEntry | null) => void;
    onPlayerDeath: (isBraced: boolean, isRedMist: boolean) => void;
    onRespawn: (enemy: Enemy) => void;
    onTick: (activeCombat: any) => void;
    onAutoEat: (healAmount: number) => void;
    onHitXp: (gains: Partial<PlayerSkills>) => void;
    onLog: (event: CombatEvent) => void;
    onLoot: (item: { itemId: string, itemName: string, quantity: number }, isRedMist: boolean) => void;
    onTrySiphon: (cost: number, callback: (success: boolean) => void) => void;
    getEnemyData: (id: string) => Enemy | null;
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
    private respawnTimeoutId: ReturnType<typeof setTimeout> | null = null;
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
    private _scentIntensity: number = 0.0;
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
    // Phase 2C State
    private isBossPending: boolean = false;
    private hasSpawnedBoss: boolean = false;
    private activeEvent: string | null = null;
    private prevScent: number = 0;

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
        this.isBossPending = false;
        this.hasSpawnedBoss = false;
        this.activeEvent = null;
        this.prevScent = 0;
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
        if (this.respawnTimeoutId !== null) {
            clearTimeout(this.respawnTimeoutId);
            this.respawnTimeoutId = null;
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
    get scentIntensity(): number { return this._scentIntensity; }
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
            this._scentIntensity = Math.min(SCENT_ACCURACY_CAP, this._scentIntensity + (SCENT_INCREMENT * scentPenaltyMultiplier));
        }

        // --- Phase 2C: Threshold Crossings & Events ---
        this.updateActiveEvent();
        this.checkForBossTrigger();
        this.prevScent = this._scentIntensity;

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
        let enemyInterval = this.enemy.attackInterval;
        
        // --- Phase 2C: Razor Fangs (Enemy Attack Speed +10%) ---
        if (this._scentIntensity >= EVENT_THRESHOLD_FANGS) {
            enemyInterval *= 0.90;
        }

        const enemyFill = calcMeterFillPerTick(enemyInterval, TICK_MS);

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
        this.callbacks.onTick({
            playerHp: this.playerHp,
            enemyHp: this.enemyHp,
            playerMeter: this.playerMeter,
            enemyMeter: this.enemyMeter,
            scentIntensity: this._scentIntensity,
            activeEvent: this.activeEvent || undefined,
            currentTick: this.currentTick,
            isRedMistActive: this.isRedMistActive,
            redMistTicks: this.redMistTicks,
            redMistIchorDrops: this.redMistIchorDrops,
            redMistDeaths: this.redMistDeaths,
            siphonsThisHunt: this.siphonsThisHunt,
            finesseTicksRemaining: this.finesseTicksRemaining,
            isBraced: this.isBraced
        });

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
        let crit = false;

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
            
            // --- Phase 2C: Critical Strikes ---
            let finalDmg = preMitigation;
            crit = Math.random() < this.derived.critChance;
            if (crit) {
                finalDmg = Math.floor(finalDmg * this.derived.critMultiplier);
            }

            // Phase 2A: Red Mist Bonus
            if (this.isRedMistActive) {
                finalDmg = Math.floor(finalDmg * RED_MIST_DMG_BONUS);
            }

            // Apply Enemy Mitigation with Trinity Lock (Style + Interval)
            const enemyFlatArmor = (this.enemy.stats as any).flatArmor ?? 0;
            const enemyDr = (this.enemy.stats as any).drPercent ?? 0;
            const mitigated = applyMitigation(
                finalDmg, 
                enemyFlatArmor, 
                enemyDr, 
                this.derived.armPen,
                this.derived.weaponSubStyle,
                this.derived.attackInterval
            );

            const damageOutcome = Math.min(mitigated, this.enemyHp); 
            damage = damageOutcome;

            this.enemyHp -= damage;
            const logMsg = crit 
                ? `CRITICAL! You hit ${this.enemy.name} for ${damage} damage.`
                : `You hit ${this.enemy.name} for ${damage} damage.`;
            this.log('hit', logMsg, damage);

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

        this.callbacks.onPlayerAttack({ hit, blocked, damage, isCritical: crit }, this.enemy);

        // --- Enemy death ---
        if (this.enemyHp <= 0) {
            this.handleEnemyDeath();
        }
    }

    private resolveEnemyAttack(): void {
        if (!this.enemy) return;
 
        let enemyAccuracy = this.enemy.accuracy;
        
        // --- Phase 2C: Bloodlust (Enemy Accuracy +10%) ---
        if (this._scentIntensity >= EVENT_THRESHOLD_BLOODLUST) {
             enemyAccuracy *= 1.10;
        }

        const totalEnemyAccuracy = enemyAccuracy * (1 + this._scentIntensity);
        
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
                // --- Phase 2C: Scent-Based Damage Scaling ---
                const enemyMaxHit = calcScentScalingDmg(this.enemy.maxHit, this._scentIntensity);
                const raw = rollDamage(enemyMaxHit);

                // --- Phase 2C: Hemophilic Curse (Income Damage +15%) ---
                let incoming = raw;
                if (this._scentIntensity >= EVENT_THRESHOLD_CURSE) {
                    incoming = Math.floor(incoming * 1.15);
                }

                const mitigated = applyMitigation(
                    incoming, 
                    this.derived.flatArmor, 
                    this.derived.damageReduction,
                    0, // Player doesn't have ARMPEN yet
                    this.enemy.damageProfile,
                    this.enemy.attackInterval
                );
                damage = Math.min(mitigated, this.playerHp); // Cap damage to current player HP
                this.playerHp -= damage;
                this.lastDamageTick = this.currentTick;
                this._scentIntensity *= 0.5; // Partial decay on damage (Option B)
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

        this.callbacks.onEnemyAttack({ hit, blocked, damage, isCritical: false });

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

        this.callbacks.onEnemyDeath(enemy, {
            killedEnemyId: this.enemy.id,
            isBoss: this.enemy.isElite 
        }, loot);

        // Phase 2C: Boss Resolution (Partial Scent Reset)
        if (this.enemy.isElite) {
            this._scentIntensity = Math.max(0, this._scentIntensity - SCENT_REDUCTION_BOSS);
        }

        // Respawn next enemy after delay
        const respawnMs = (this.zone?.respawnBase ?? 2) * 1000;
        this.stop();
        this.respawnTimeoutId = setTimeout(() => {
            this.respawnTimeoutId = null;
            if (!this.zone) return;

            // Phase 2B/2C: Deterministic Boss Spawning
            if (this.isBossPending && !this.hasSpawnedBoss) {
                // Find boss ID for current zone (next step) or force elite flag
                this.isBossPending = false;
                this.hasSpawnedBoss = true;
                this.spawnBoss(); // Helper (to be implemented)
            } else {
                this.enemyIndex = (this.enemyIndex + 1) % this.zone.enemyPool.length;
                this.spawnNextEnemy();
            }
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
                this._scentIntensity *= 0.5; // Reduce scent per spec
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

    private updateActiveEvent() {
        const scent = this._scentIntensity;
        let newEvent: string | null = null;

        if (scent >= EVENT_THRESHOLD_FANGS) newEvent = 'Razor Fangs';
        else if (scent >= EVENT_THRESHOLD_CURSE) newEvent = 'Hemophilic Curse';
        else if (scent >= EVENT_THRESHOLD_BLOODLUST) newEvent = 'Bloodlust';

        if (newEvent !== this.activeEvent) {
            this.activeEvent = newEvent;
            if (newEvent) {
                this.log('respawn', `${newEvent} has been triggered by the Scent of Fear!`);
            }
        }
    }

    private checkForBossTrigger() {
        if (this.prevScent < BOSS_SCENT_THRESHOLD && this._scentIntensity >= BOSS_SCENT_THRESHOLD && !this.hasSpawnedBoss) {
            this.isBossPending = true;
            this.log('respawn', "A powerful presence is drawn to your scent... The hunt is escalating!");
        }
    }

    private spawnBoss() {
        if (!this.zone) return;
        const bossId = this.zone.enemyPool[this.zone.enemyPool.length - 1];
        this.enemy = this.callbacks.getEnemyData(bossId);
        
        if (this.enemy) {
            this.enemy = { 
                ...this.enemy, 
                isElite: true, 
                name: `[BOSS] ${this.enemy.name}`,
                stats: {
                    ...this.enemy.stats,
                    hp: calcScentScalingHp(this.enemy.stats.hp, this._scentIntensity),
                    attack: calcScentScalingDmg(this.enemy.stats.attack, this._scentIntensity),
                    strength: calcScentScalingDmg(this.enemy.stats.strength, this._scentIntensity),
                }
            };
            this.enemyHp = this.enemy.stats.hp;
            this.enemyMeter = 0;
            this.log('respawn', `The ${this.enemy.name} has emerged!`);
            this.callbacks.onRespawn(this.enemy);
        }
    }
}
