// =============================================================================
// CRIMSON ENGINE — Core Formulas (Pure Functions)
// All game math lives here. No React, no side effects.
// =============================================================================

import {
    MIN_ATTACK_INTERVAL,
    MAX_DAMAGE_REDUCTION,
    MIN_HIT_CHANCE,
    MAX_HIT_CHANCE,
    MAX_BLOCK_CHANCE,
    STYLE_ADVANTAGE_BONUS,
    STYLE_RESISTANCE_PENALTY,
    WEAKNESS_DAMAGE_MOD,
    RESISTANCE_DAMAGE_MOD,
    HIT_XP_FOCUS_MULT,
    HIT_XP_MIXED_MULT,
    HIT_XP_ALL_MULT,
    HIT_XP_VITAE_MULT,
    MC_THRESHOLD,
    MC_POWER_DEFAULT,
    STAB_ARMOR_BYPASS,
    STYLE_FREQ_THRESHOLD,
    STYLE_FREQ_INTENSITY,
    CRUSH_FRACTURE_RATE,
    DAMAGE_FLOOR_PERCENT,
    MAX_SCENT_SENSITIVITY,
    REFINEMENT_SCENT_MULT,
} from './constants';

const HEAVY_WEAKNESS_MAX_HIT_BONUS = 0.25; 
import type { CombatStyle, DerivedStats, PlayerEquipment, PlayerSkills, TrainingMode, Weakness } from './types';

// =============================================================================
// ATTACK INTERVAL
// =============================================================================

/**
 * Calculate final attack interval after all modifiers.
 * @param baseInterval  Weapon base interval in seconds
 * @param pctReductions Array of fractional % reductions (e.g., 0.20 for 20%)
 * @param flatReductions Total flat reduction in seconds
 * @returns Final clamped interval (minimum MIN_ATTACK_INTERVAL)
 */
export function calcAttackInterval(
    baseInterval: number,
    pctReductions: number[],
    flatReductions: number
): number {
    const multiplier = pctReductions.reduce((acc, r) => acc * (1 - r), 1);
    const modified = baseInterval * multiplier - flatReductions;
    return Math.max(MIN_ATTACK_INTERVAL, modified);
}

/**
 * How much the attack meter fills per game tick (100ms).
 * When the meter reaches 1.0, an attack is triggered.
 */
export function calcMeterFillPerTick(interval: number, tickMs: number): number {
    return tickMs / 1000 / interval;
}

// =============================================================================
// ACCURACY / HIT CHANCE
// =============================================================================

/**
 * Accuracy rating from a combat level and equipment bonus.
 */
export function calcAccuracyRating(level: number, equipmentBonus: number): number {
    return level * 4 + equipmentBonus;
}

/**
 * Evasion rating from Obsidian Ward level and equipment bonus.
 */
export function calcEvasionRating(obsidianWardLevel: number, equipmentBonus: number): number {
    return obsidianWardLevel * 4 + equipmentBonus;
}

/**
 * Base hit chance from attacker accuracy vs defender evasion.
 * Multiplicative bonuses applied after base chance (Idle Clans model).
 */
export function calcHitChance(
    accuracyRating: number,
    evasionRating: number,
    styleAdvantageBonus: number = 0,
    gearAccuracyMult: number = 1,
    buffMult: number = 1
): number {
    const total = accuracyRating + evasionRating;
    if (total <= 0) return MIN_HIT_CHANCE;
    const base = accuracyRating / total;
    const final = base * (1 + styleAdvantageBonus) * gearAccuracyMult * buffMult;
    return Math.max(MIN_HIT_CHANCE, Math.min(MAX_HIT_CHANCE, final));
}

/**
 * Determine style advantage bonus from player style vs enemy weakness/resistance.
 */
export function calcStyleBonus(
    playerStyle: CombatStyle,
    enemyWeakness: Weakness,
    enemyResistance: Weakness,
    weaponSubStyle?: Weakness
): number {
    // 1. Try specific weapon sub-style first (Crush, Slash, etc.)
    if (weaponSubStyle && weaponSubStyle === enemyWeakness) return STYLE_ADVANTAGE_BONUS;
    if (weaponSubStyle && weaponSubStyle === enemyResistance) return STYLE_RESISTANCE_PENALTY;

    // 2. Fall back to broad style (Melee, Ranged, Magic)
    const styleToWeaknessKey: Record<CombatStyle, Weakness> = {
        melee:   null, // Melee handled by weaponSubStyle (Stab, Slash, etc.)
        archery: 'archery',
        sorcery: 'sorcery',
    };
    if (enemyWeakness === 'none') return 0;
    const playerWeaknessKey = styleToWeaknessKey[playerStyle];
    if (playerWeaknessKey === enemyWeakness) return STYLE_ADVANTAGE_BONUS;
    if (playerWeaknessKey === enemyResistance) return STYLE_RESISTANCE_PENALTY;
    return 0;
}

/**
 * Check if the player receives a bonus max hit scalar for being "Heavy" against a weakness.
 */
export function calcHeavyWeaknessMult(
    isHeavy: boolean,
    playerStyle: CombatStyle,
    enemyWeakness: Weakness,
    weaponSubStyle?: Weakness
): number {
    if (!isHeavy) return 1.0;
    
    // Check match
    const styleToWeaknessKey: Record<CombatStyle, Weakness> = {
        melee: 'fang',
        archery: 'shadow',
        sorcery: 'blood',
    };
    const playerKey = styleToWeaknessKey[playerStyle];
    const isMatch = (weaponSubStyle && weaponSubStyle === enemyWeakness) || (playerKey === enemyWeakness);
    
    return isMatch ? (1 + HEAVY_WEAKNESS_MAX_HIT_BONUS) : 1.0;
}

// =============================================================================
// DAMAGE
// =============================================================================

/**
 * Base max hit using the "Low Fantasy" model (Level/8).
 * Formula: floor(level / 8) + 1
 */
export function calcBaseMaxHit(level: number): number {
    return Math.floor(level / 8) + 1;
}

/**
 * Final max hit after weapon power modifier and bonus %.
 */
export function calcMaxHit(
    baseMaxHit: number,
    weaponPowerModifier: number,
    bonusPct: number
): number {
    return Math.floor(baseMaxHit * weaponPowerModifier * (1 + bonusPct));
}

/**
 * Roll a random integer damage value [0, maxHit] inclusive.
 * Minimum hit guaranteed = 1 if attack connects.
 */
/**
 * Roll a random integer damage value [0, maxHit] inclusive.
 * Minimum hit guaranteed = 1 if attack connects.
 * @param maxHit       Maximum possible hit
 * @param minDamagePct Optional floor as percentage of max hit (e.g. 0.35 for Heavy weapons)
 */
export function rollDamage(maxHit: number, minDamagePct: number = 0): number {
    if (maxHit <= 0) return 1;
    const floor = Math.floor(maxHit * minDamagePct);
    const range = maxHit - floor;
    if (range <= 0) return maxHit;
    return Math.max(1, floor + Math.floor(Math.random() * (range + 1)));
}

/**
 * Apply enemy weakness / resistance modifier to raw damage.
 */
export function applyWeaknessMod(
    rawDamage: number,
    playerStyle: CombatStyle,
    enemyWeakness: Weakness,
    enemyResistance: Weakness,
    weaponSubStyle?: Weakness
): number {
    // 1. Specific sub-style match
    if (weaponSubStyle && weaponSubStyle === enemyWeakness) return Math.floor(rawDamage * WEAKNESS_DAMAGE_MOD);
    if (weaponSubStyle && weaponSubStyle === enemyResistance) return Math.floor(rawDamage * RESISTANCE_DAMAGE_MOD);

    // 2. Broad style match
    const styleToWeaknessKey: Record<CombatStyle, Weakness> = {
        melee: 'fang',
        archery: 'shadow',
        sorcery: 'blood',
    };
    const playerKey = styleToWeaknessKey[playerStyle];
    let mod = 1;
    if (playerKey === enemyWeakness) mod = WEAKNESS_DAMAGE_MOD;
    if (playerKey === enemyResistance) mod = RESISTANCE_DAMAGE_MOD;
    return Math.floor(rawDamage * mod);
}

/**
 * Apply Multiplicative Compression (MC) to total multipliers.
 * Reduces the impact of high-stacking bonuses to prevent dominance.
 */
export function applyMultiplicativeCompression(
    totalMult: number,
    power: number = MC_POWER_DEFAULT
): { finalMult: number; isCompressed: boolean } {
    if (totalMult <= MC_THRESHOLD) {
        return { finalMult: totalMult, isCompressed: false };
    }
    const compressed = MC_THRESHOLD + Math.pow(totalMult - MC_THRESHOLD, power);
    return { finalMult: compressed, isCompressed: true };
}

// =============================================================================
// MITIGATION
// =============================================================================

/**
 * Apply style-specific mitigation (v1.7 Trinity Lock).
 * Incorporates Armor Fracture (CRUSH), Partial Bypass (STAB), and Frequency Scaling.
 */
export function applyMitigation(
    incoming: number,
    flatArmor: number,
    drPct: number,
    armPen: number = 0,
    style: Weakness | null = null,
    interval: number = 2.0
): number {
    const frequency = 1.0 / interval;
    let styleArmorBypass = 0.0;
    let styleArmorFactor = 1.0;

    // TRINITY LOCK LOGIC
    if (style === 'crush' || style === 'pound') {
        // CRUSH/POUND: Armor Fracture (Bypass proportional to interval)
        styleArmorBypass = CRUSH_FRACTURE_RATE * interval;
        // Exempt from frequency scaling
    } else if (style === 'stab') {
        // STAB: Light Bypass + Mild Frequency Scaling
        styleArmorBypass = STAB_ARMOR_BYPASS;
        styleArmorFactor = 1.0 + Math.max(0, (frequency - STYLE_FREQ_THRESHOLD) * STYLE_FREQ_INTENSITY);
    } else if (style === 'slash') {
        // SLASH: Subject to frequency scaling only
        styleArmorFactor = 1.0 + Math.max(0, (frequency - STYLE_FREQ_THRESHOLD) * STYLE_FREQ_INTENSITY);
    }

    // 1. Flat Armor Scaling (Penalty)
    const scaledArmor = flatArmor * styleArmorFactor;
    // 2. Armor Bypass & Penetration
    const effectiveArmor = Math.max(0, scaledArmor * (1.0 - armPen - styleArmorBypass));

    const clampedDr = Math.min(drPct, MAX_DAMAGE_REDUCTION);
    let current = incoming;

    // 3. Armor Reduction
    current -= effectiveArmor;
    
    // 4. Damage Reduction (DR)
    current = Math.floor(current * (1 - clampedDr));
    
    // 5. Minimum Damage Floor (15% of raw incoming)
    const floor = Math.floor(incoming * DAMAGE_FLOOR_PERCENT);
    
    return Math.max(1, floor, current);
}

/**
 * Check if a block occurs (random roll vs block chance).
 */
export function rollBlock(blockChance: number): boolean {
    const clamped = Math.min(blockChance, MAX_BLOCK_CHANCE);
    return Math.random() < clamped;
}

// =============================================================================
// HP
// =============================================================================

/**
 * Max HP = Vitae level.
 * Level 10 (start) = 10 HP. Level 120 = 120 HP.
 */
export function calcMaxHp(vitaeLevel: number): number {
    return vitaeLevel;
}

// =============================================================================
// XP
// =============================================================================

/**
 * Calculate XP awarded to the style skill on enemy kill.
 * Vitae always gets a separate 33% share (handled separately).
 */
export function calcSkillXp(enemyXpReward: number, styleShare: number): number {
    return Math.floor(enemyXpReward * styleShare);
}

/**
 * Calculate the Vitae XP share (always 33% of enemy reward).
 */
export function calcVitaeXp(enemyXpReward: number, vitaeShare: number): number {
    return Math.floor(enemyXpReward * vitaeShare);
}

// =============================================================================
// PER-HIT XP (Idle Clans model)
// =============================================================================

/**
 * Calculate XP gains for a single successful player hit.
 * Vitae always included passively at ×1.33 regardless of mode.
 *
 * @param damage     Final damage dealt to the enemy
 * @param mode       The player's active training mode
 * @returns          Partial PlayerSkills map with { level: 0, xp: N } entries
 */
export function calcHitXpGains(
    damage: number,
    mode: TrainingMode
): Partial<PlayerSkills> {
    const gains: Record<string, { level: number; xp: number }> = {};
    const xp = (mult: number) => Math.max(1, Math.floor(damage * mult));

    // Vitae is always passive
    gains['vitae'] = { level: 0, xp: xp(HIT_XP_VITAE_MULT) };

    switch (mode) {
        case 'attack':
            gains['fangMastery'] = { level: 0, xp: xp(HIT_XP_FOCUS_MULT) };
            break;
        case 'strength':
            gains['predatorForce'] = { level: 0, xp: xp(HIT_XP_FOCUS_MULT) };
            break;
        case 'defense':
            gains['obsidianWard'] = { level: 0, xp: xp(HIT_XP_FOCUS_MULT) };
            break;
        case 'all_melee':
            gains['fangMastery']   = { level: 0, xp: xp(HIT_XP_ALL_MULT) };
            gains['predatorForce'] = { level: 0, xp: xp(HIT_XP_ALL_MULT) };
            gains['obsidianWard']  = { level: 0, xp: xp(HIT_XP_ALL_MULT) };
            break;
        case 'archery':
            gains['shadowArchery'] = { level: 0, xp: xp(HIT_XP_FOCUS_MULT) };
            break;
        case 'warding_archery':
            gains['shadowArchery'] = { level: 0, xp: xp(HIT_XP_MIXED_MULT) };
            gains['obsidianWard']  = { level: 0, xp: xp(HIT_XP_MIXED_MULT) };
            break;
        case 'sorcery':
            gains['bloodSorcery'] = { level: 0, xp: xp(HIT_XP_FOCUS_MULT) };
            break;
        case 'warding_sorcery':
            gains['bloodSorcery'] = { level: 0, xp: xp(HIT_XP_MIXED_MULT) };
            gains['obsidianWard'] = { level: 0, xp: xp(HIT_XP_MIXED_MULT) };
            break;
    }

    return gains as Partial<PlayerSkills>;
}


/**
 * Compute all derived stats in one shot from skills and equipment.
 * This is the single function the combat engine and UI call.
 */
export function computeDerivedStats(
    skills: PlayerSkills,
    equipment: PlayerEquipment,
    meta?: {
        permanentArmorBonus: number;
        isFinesseActive: boolean;
        isLowHp: boolean;
    }
): DerivedStats {
    const weapon = equipment.weapon;
    // Combat mechanics key off weapon type, not the training mode
    const weaponStyle: CombatStyle = weapon?.style ?? 'melee';

    // --- Accuracy ---
    const offensiveLevel = weaponStyle === 'melee'
        ? skills.fangMastery.level
        : weaponStyle === 'archery'
            ? skills.shadowArchery.level
            : skills.bloodSorcery.level;

    const equipAccBonus = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.accuracyBonus ?? 0), 0
    );
    let accuracyRating = calcAccuracyRating(offensiveLevel, equipAccBonus);
    
    // Phase 2A: Sanguine Finesse Buff
    if (meta?.isFinesseActive) {
        accuracyRating = Math.floor(accuracyRating * 1.05);
    }

    const subStyle = weapon?.subStyle ?? null;
    const equipEvasBonus = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.evasionBonus ?? 0), 0
    );
    const evasionRating = calcEvasionRating(skills.obsidianWard.level, equipEvasBonus);

    // --- Max Hit (keyed by weapon style) ---
    const strengthLevel = weaponStyle === 'melee'
        ? skills.predatorForce.level
        : weaponStyle === 'archery'
            ? skills.shadowArchery.level
            : skills.bloodSorcery.level;
    const baseMaxHit = calcBaseMaxHit(strengthLevel);
    const powerMod = weapon?.powerModifier ?? 1.0;
    const meleeMaxHit = calcMaxHit(baseMaxHit, powerMod, 0);
    const rangedMaxHit = calcMaxHit(calcBaseMaxHit(skills.shadowArchery.level), powerMod, 0);
    const magicMaxHit = calcMaxHit(calcBaseMaxHit(skills.bloodSorcery.level), weapon?.powerModifier ?? 1.0, 0);

    // --- Phase 2B: Path Specializations ---
    const t2Items = Object.values(equipment).filter(item => item && item.tier === 'T2');
    const sanguineCount = t2Items.filter(item => item?.specPath === 'sanguine').length;
    const vileCount = t2Items.filter(item => item?.specPath === 'vile').length;

    // --- Defense ---
    const drPercent = Math.min(
        MAX_DAMAGE_REDUCTION,
        Object.values(equipment).reduce((sum, item) => sum + (item?.drPercent ?? 0), 0) + (vileCount * 0.05)
    );
    const blockChance = Math.min(
        MAX_BLOCK_CHANCE,
        Object.values(equipment).reduce((sum, item) => sum + (item?.blockChance ?? 0), 0) + (vileCount * 0.05)
    );
    const flatArmor = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.flatArmor ?? 0), 0
    ) + (meta?.permanentArmorBonus ?? 0);

    // --- Attack Interval ---
    const baseInterval = weapon ? 2.0 : 2.4; // bare fists fallback
    const weaponInterval = weapon?.attackIntervalFlat ?? 0;
    const pctReductions = Object.values(equipment)
        .map(item => item?.attackIntervalPct ?? 0)
        .filter(v => v > 0);
    
    // Sanguine Path: +5% Speed per item
    if (sanguineCount > 0) pctReductions.push(sanguineCount * 0.05);

    const attackInterval = calcAttackInterval(
        weapon ? (2.0 - weaponInterval) : baseInterval,
        pctReductions,
        0
    );

    // --- Lifesteal & Utility ---
    let lifestealPercent = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.lifestealPercent ?? 0), 0
    );
    // Sanguine Path: +2% Lifesteal per item
    lifestealPercent += (sanguineCount * 0.02);
    
    // Phase 2A: Sanguine Finesse Lifesteal Doubling (if HP < 50%)
    if (meta?.isFinesseActive && meta?.isLowHp) {
        lifestealPercent *= 2;
    }
    const regenPerSec = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.regenPerSec ?? 0), 0
    );
    const siphonChance = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.siphonChance ?? 0), 0
    );
    const siphonAmount = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.siphonAmount ?? 0), 0
    );

    // --- Heavy Weapon Mechanics ---
    // A weapon is considered "Heavy" if its base attack interval is > 2.2s
    const isHeavyWeapon = attackInterval > 2.2;
    
    const armPen = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.armPen ?? 0), 0
    ) + (isHeavyWeapon ? 0.35 : 0);

    const minDamagePct = Math.max(
        0,
        ...Object.values(equipment).map(item => item?.minDamagePct ?? 0),
        (isHeavyWeapon ? 0.35 : 0)
    );

    // --- Phase 2B: Scent Sensitivity ---
    const totalRefinement = Object.values(equipment).reduce(
        (sum, item) => sum + (item?.refinement ?? 0), 0
    );
    const scentSensitivity = Math.min(MAX_SCENT_SENSITIVITY, totalRefinement * REFINEMENT_SCENT_MULT);

    return {
        maxHp: calcMaxHp(skills.vitae.level),
        accuracyRating,
        evasionRating,
        meleeMaxHit,
        rangedMaxHit,
        magicMaxHit,
        damageReduction: drPercent,
        attackInterval,
        blockChance,
        flatArmor,
        lifestealPercent,
        regenPerSec,
        siphonChance,
        siphonAmount,
        armPen,
        minDamagePct,
        scentSensitivity,
        weaponStyle,
        weaponSubStyle: subStyle,
    };
}
