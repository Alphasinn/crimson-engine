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
    applyRitualBonuses,
} from './formulas';
import {
    MC_POWER_DEFAULT,
    MC_POWER_SLASH,
    SCENT_BUILD_INTERVAL,
    SCENT_INCREMENT,
    RED_MIST_ICHOR_MOD,
    EVENT_THRESHOLD_BLOODLUST,
    EVENT_THRESHOLD_CURSE,
    EVENT_THRESHOLD_FANGS,
    RED_MIST_THRESHOLD,
    SCENT_ACCURACY_CAP,
    RED_MIST_DMG_BONUS,
    SCENT_LOCK_DURATION_MS,
} from './constants';
import { BLOOD_ECHOES } from '../data/bloodEchoes';
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
    getEnemyData: (id: string) => Enemy | null;
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
    private activeEvent: string | null = null;

    // Phase 4: Resonance & Rituals
    private ritualModifiers: any = null;
    private resonanceState: any = null;
    private dashCooldownTicks: number = 0;
    private flickerTicksRemaining: number = 0;
    private ironboundTicksRemaining: number = 0;
    private isDashReady: boolean = true;
    private activeRitualIds: string[] = [];

    // Phase 4 Sprint 4 Metrics
    private flickerTriggers: number = 0;
    private ironboundTriggers: number = 0;
    private peakScent: number = 0;
    private timeAbove60Scent: number = 0;
    private timeAbove80Scent: number = 0;
    private respawnTicksRemaining: number = 0;
    private scentLockTicks: number = 0;
    private queuedBloodEchoId: string | null = null;

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
        meta?: { isBraced: boolean, permanentArmorBonus: number, bloodShards: number, finesseTicksRemaining: number },
        ritualModifiers?: any,
        resonanceState?: any,
        activeRitualIds?: string[],
        initialEnemy?: Enemy
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

        // Phase 4: Resonance & Rituals
        this.ritualModifiers = ritualModifiers || {
            scentGainMultiplier: 1,
            lootQualityMultiplier: 1,
            maxHpMultiplier: 1,
            ticksSinceLastSpawn: 0,
        };
        this.resonanceState = resonanceState || { activePath: null, bonuses: {} };
        this.activeRitualIds = activeRitualIds || [];
        this.isDashReady = true;
        this.dashCooldownTicks = 0;
        this.flickerTicksRemaining = 0;
        this.ironboundTicksRemaining = 0;

        this.flickerTriggers = 0;
        this.ironboundTriggers = 0;
        this.peakScent = 0;
        this.timeAbove60Scent = 0;
        this.timeAbove80Scent = 0;

        this.redMistOccurred = false;
        this.timeAbove60Scent = 0;
        this.timeAbove80Scent = 0;
        this.respawnTicksRemaining = 0;
        this.scentLockTicks = 0;
        this.queuedBloodEchoId = null;
        this.activeEvent = null;
        this.enemyIndex = 0;
        this.currentTick = 0;
        
        this.recomputeDerived();

        // Important: Set max HP from derived stats so heal logic knows the cap
        this.playerMaxHp = this.derived.maxHp;
        // Use provided HP or default to max
        this.playerHp = initialHp !== undefined ? Math.min(initialHp, this.playerMaxHp) : this.playerMaxHp;

        if (initialEnemy) {
            this.setEnemy(initialEnemy);
            this.log('respawn', `${initialEnemy.name} appears.`);
            this.callbacks.onRespawn(initialEnemy);
        } else {
            this.spawnNextEnemy();
        }

        this.isRunning = true;
        this.intervalId = setInterval(() => this.tick(), TICK_MS);
    }

    /**
     * Stop the combat engine.
     */
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
        meta?: { isBraced: boolean, permanentArmorBonus: number, bloodShards: number, finesseTicksRemaining: number },
        ritualModifiers?: any,
        resonanceState?: any,
        activeRitualIds?: string[]
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

        if (ritualModifiers) this.ritualModifiers = ritualModifiers;
        if (resonanceState) this.resonanceState = resonanceState;
        if (activeRitualIds) this.activeRitualIds = activeRitualIds;

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
        const baseStats = computeDerivedStats(this.skills, this.equipment, {
            permanentArmorBonus: this.permanentArmorBonus,
            isFinesseActive: this.finesseTicksRemaining > 0,
            isLowHp: hpRatio < 0.50,
            isFlickerActive: this.flickerTicksRemaining > 0
        });

        // Apply Ritual modifiers (Stat-based)
        this.derived = applyRitualBonuses(baseStats, this.ritualModifiers);
    }

    private spawnNextEnemy(): void {
        if (!this.zone || !this.zone.enemyPool.length) return;
        
        const enemyId = this.zone.enemyPool[this.enemyIndex];
        const template = this.callbacks.getEnemyData(enemyId);
        
        if (template) {
            // Strict cloning to prevent cross-spawn state leakage
            const nextEnemy: Enemy = {
                ...template,
                stats: { ...template.stats }
            };
            this.setEnemy(nextEnemy);
            this.log('respawn', `${nextEnemy.name} appears.`);
            this.callbacks.onRespawn(nextEnemy);
        }
    }


    /** Called by the store to set an actual enemy object */
    setEnemy(enemy: Enemy): void {
        this.enemy = enemy;
        this.enemyHp = enemy.stats.hp;
        this.enemyMeter = 0;
        this.playerMeter = 0;

        // Phase 4: Sync focus index for any enemy in the pool (including Elites)
        if (this.zone) {
            const idx = this.zone.enemyPool.indexOf(enemy.id);
            if (idx !== -1) {
                this.enemyIndex = idx;
            }
        }
    }

    private tick(): void {
        if (!this.isRunning) return;
        this.currentTick++;

        // --- Phase 4 S4: Constant Lifecycle Logic ---
        // Scent and Regen now build regardless of whether an enemy is active
        this.tryAutoEat();
        
        const hpRatio = this.playerHp / this.playerMaxHp;
        const wasRedMist = this.isRedMistActive;
        this.isRedMistActive = hpRatio < RED_MIST_THRESHOLD;
        
        if (this.isRedMistActive) {
            this.redMistTicks++;
            this.redMistOccurred = true;
            if (!wasRedMist) this.log('xp_gain' as any, "The Red Mist descends... (+20% Dmg, +10% Ichor)");
        }

        const ticksSinceStart = this.currentTick;
        if (ticksSinceStart > 0 && ticksSinceStart % SCENT_BUILD_INTERVAL === 0) {
            if (this.scentLockTicks > 0) {
                // Scent is locked, do not increase
            } else {
                const scentPenaltyMultiplier = 1 + this.derived.scentSensitivity;
                const ritualScentMult = this.ritualModifiers?.scentGainMultiplier || 1;
                
                const totalScentGain = SCENT_INCREMENT * scentPenaltyMultiplier * ritualScentMult;
                this._scentIntensity = Math.min(SCENT_ACCURACY_CAP, this._scentIntensity + totalScentGain);
            }
        }

        if (this.scentLockTicks > 0) {
            this.scentLockTicks--;
        }

        this.peakScent = Math.max(this.peakScent, this._scentIntensity);
        if (this._scentIntensity >= 0.8) {
            this.timeAbove80Scent++;
            this.timeAbove60Scent++;
        } else if (this._scentIntensity >= 0.6) {
            this.timeAbove60Scent++;
        }

        // Blood Echo Trigger at 100% (1.0)
        if (this._scentIntensity >= 1.0 && !this.queuedBloodEchoId && this.scentLockTicks <= 0) {
            if (this.zone && BLOOD_ECHOES[this.zone.id]) {
                const echo = BLOOD_ECHOES[this.zone.id];
                this.queuedBloodEchoId = echo.id;
                this._scentIntensity = 0; // Immediate reset
                // Start 120s lock (120,000ms / 20ms = 6000 ticks)
                this.scentLockTicks = Math.floor(SCENT_LOCK_DURATION_MS / TICK_MS);
                this.log('event_boss' as any, "A Blood Echo manifestation looms... It will appear after this encounter.");
            }
        }


        // --- Phase 4 S4: Famine Rest (Safety Net) ---
        if (hpRatio < 0.30 && this.bloodShards < 5) {
            this.famineRestTicks++;
            if (this.famineRestTicks >= 50) { // 5 seconds
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

        // --- Phase 4 S4: Respawn Timer / Combat Logic Split ---
        if (!this.enemy) {
            if (this.respawnTicksRemaining > 0) {
                this.respawnTicksRemaining--;
                if (this.respawnTicksRemaining === 0) {
                    this.executeRespawn();
                }
            }
            return; // Skip combat logic if no enemy
        }

        // --- Combat Logic ---

        // --- Phase 4: Resonance & Ritual Timers ---
        if (this.dashCooldownTicks > 0) {
            this.dashCooldownTicks--;
            if (this.dashCooldownTicks === 0) {
                this.isDashReady = true;
            }
        }
        if (this.flickerTicksRemaining > 0) {
            this.flickerTicksRemaining--;
            if (this.flickerTicksRemaining === 0) {
                this.recomputeDerived();
            }
        }
        if (this.ironboundTicksRemaining > 0) {
            this.ironboundTicksRemaining--;
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

        this.callbacks.onTick(this.getActiveCombatState());

        // Notify UI of Phase 2A metrics if they changed meaningfully or periodically
        // (Implementation detail: usually handled by onTick if Payload is updated)
        this.updateActiveEvent();
    }

    private getActiveCombatState(): any {
        return {
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
            finesseTicksRemaining: this.finesseTicksRemaining,
            isBraced: this.isBraced,
            viewMode: 'home',
            queuedBloodEchoId: this.queuedBloodEchoId,
            scentLockTicks: this.scentLockTicks,
            // Phase 4
            isDashReady: this.isDashReady,
            dashCooldownTicks: this.dashCooldownTicks,
            flickerTicks: this.flickerTicksRemaining,
            isIronbound: this.ironboundTicksRemaining > 0,
            ironboundTicks: this.ironboundTicksRemaining,
            activeRituals: this.activeRitualIds,
            // Phase 4 Metrics
            flickerTriggers: this.flickerTriggers,
            ironboundTriggers: this.ironboundTriggers,
            peakScent: this.peakScent,
            timeAbove60Scent: this.timeAbove60Scent,
            timeAbove80Scent: this.timeAbove80Scent
        };
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
        const blocked = false;
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
        let evaded = false;

        if (hit) {
            // Check Reactive Flicker (Auto-Evade)
            if (this.isDashReady) {
                this.isDashReady = false;
                const cooldown = this.resonanceState.activePath === 'sanguine' ? 400 : 600;
                const flickerWindow = this.resonanceState.activePath === 'sanguine' ? 100 : 50; 
                this.dashCooldownTicks = cooldown;
                this.flickerTicksRemaining = flickerWindow;
                evaded = true;
                this.flickerTriggers++;
                this.log('siphon' as any, "EVADED! Attack negated."); 
                this.recomputeDerived();
            } else {
                // Check block
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
                    this.log('enemy_hit', `${this.enemy.name} hits you for ${damage} damage.`, damage);

                    // --- Phase 4: Stagger (Meter Setback) ---
                    if (this.ironboundTicksRemaining <= 0) {
                        this.playerMeter = Math.max(0, this.playerMeter - 0.1);
                        this.log('auto_eat', "Staggered! (-10% Meter)");
                    }
                } else {
                    this.log('enemy_miss', `You blocked ${this.enemy.name}'s attack!`);

                    // --- Phase 4: Vile Resonance (Ironbound) ---
                    if (this.resonanceState.activePath === 'vile') {
                        this.ironboundTicksRemaining = 100; // 2s
                        this.ironboundTriggers++;
                        this.log('auto_eat', "Ironbound active!");
                    }
                }
            }
        } else {
            this.log('enemy_miss', `${this.enemy.name} missed you.`);
        }

        this.callbacks.onEnemyAttack({ hit: hit && !evaded, blocked, damage, isCritical: false });

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
        this.callbacks.onLoot({ itemId: 'blood_shard', itemName: 'Blood Shard', quantity: Math.floor(3 + Math.random() * 6) }, this.isRedMistActive);

        // Phase 2A: Cursed Ichor Roll with Red Mist bonus
        let ichorChance = 0.05; // 5% Base for Tier 1 Elite?
        if (this.isRedMistActive) ichorChance += RED_MIST_ICHOR_MOD;
        
        if (Math.random() < ichorChance) {
            if (this.isRedMistActive) this.redMistIchorDrops++;
            this.callbacks.onLoot({ itemId: 'cursed_ichor', itemName: 'Cursed Ichor', quantity: 1 }, this.isRedMistActive);
        }

        // Phase 2A: Grave Steel Roll (Refinement Currency)
        // Elites: 100% chance for 1-2
        // Regulars (T2+): 10% chance for 1
        let steelCount = 0;
        if (enemy.isElite) {
            steelCount = Math.floor(1 + Math.random() * 2); // 1 or 2
        } else if (this.zone && this.zone.dropTier !== 'T1') {
            if (Math.random() < 0.10) {
                steelCount = 1;
            }
        }

        if (steelCount > 0) {
            this.callbacks.onLoot({ itemId: 'grave_steel', itemName: 'Grave Steel', quantity: steelCount }, this.isRedMistActive);
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
            // reduction logic removed in favor of Blood Echoes model
        }

        // Respawn next enemy after delay
        this.respawnTicksRemaining = (this.zone?.respawnBase ?? 2) * 10; // 2s = 20 ticks
        this.enemy = null;
    }

    private executeRespawn(): void {
        if (!this.zone) return;

        // Phase 4 S4: Blood Echoes manifestation takes priority over all
        if (this.queuedBloodEchoId) {
            const echo = BLOOD_ECHOES[this.zone.id];
            if (echo && echo.id === this.queuedBloodEchoId) {
                this.queuedBloodEchoId = null; // Clear queue
                // Strict cloning to prevent cross-spawn state leakage
                const echoInstance: Enemy = {
                    ...echo,
                    stats: { ...echo.stats }
                };
                this.setEnemy(echoInstance);
                this.log('respawn', `MANIFESTATION: ${echoInstance.name} has erupted from the echoes!`);
                this.callbacks.onRespawn(echoInstance);
                return;
            }
        }

        this.spawnNextEnemy();
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

    private log(type: CombatEventType, message: string, value?: number): void {
        const event: CombatEvent = {
            id: `${this.currentTick}-${type}-${Math.random().toString(36).slice(2, 7)}`,
            type,
            tick: this.currentTick,
            message,
            value
        };
        this.callbacks.onLog(event);
    }
    private updateActiveEvent(): void {
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

}
