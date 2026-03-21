// =============================================================================
// CRIMSON ENGINE — XP Table
// Exact cumulative XP values for levels 1–120.
// Level 120 = 88,474,739 XP. Cap = 500,000,000.
// =============================================================================

import { MAX_LEVEL, XP_CAP } from './constants';

/** Cumulative XP required to REACH each level (index 0 = level 1) */
export const XP_TABLE: readonly number[] = [
    0, 75, 151, 227, 303,
    380, 531, 683, 836, 988,
    1_141, 1_294, 1_447, 1_751, 2_054,
    2_358, 2_663, 2_967, 3_272, 3_577,
    4_182, 4_788, 5_393, 5_999, 6_606,
    7_212, 7_819, 9_026, 10_233, 11_441,
    12_648, 13_856, 15_065, 16_273, 18_682,
    21_091, 23_500, 25_910, 28_319, 30_729,
    33_140, 37_950, 42_761, 47_572, 52_383,
    57_195, 62_006, 66_818, 76_431, 86_043,
    95_656, 105_269, 114_882, 124_496, 134_109,
    153_323, 172_538, 191_752, 210_967, 230_182,
    249_397, 268_613, 307_028, 345_444, 383_861,
    422_277, 460_694, 499_111, 537_528, 614_346,
    691_163, 767_981, 844_800, 921_618, 998_437,
    1_075_256, 1_228_875, 1_382_495, 1_536_114, 1_689_734,
    1_843_355, 1_996_975, 2_150_596, 2_457_817, 2_765_038,
    3_072_260, 3_379_481, 3_686_703, 3_993_926, 4_301_148,
    4_915_571, 5_529_994, 6_144_417, 6_758_841, 7_373_264,
    7_987_688, 8_602_113, 9_830_937, 11_059_762, 12_288_587,
    13_517_412, 14_746_238, 15_975_063, 17_203_889, 19_661_516,
    22_119_142, 24_576_769, 27_034_396, 29_492_023, 31_949_651,
    34_407_278, 39_322_506, 44_237_735, 49_152_963, 54_068_192,
    58_983_421, 63_898_650, 68_813_880, 78_644_309, 88_474_739,
] as const;

/**
 * Get the current level from a cumulative XP value.
 * Returns a level between 1 and MAX_LEVEL (120).
 */
export function getLevelFromXp(xp: number): number {
    const capped = Math.min(xp, XP_CAP);
    let level = 1;
    for (let i = 0; i < XP_TABLE.length; i++) {
        if (capped >= XP_TABLE[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    return Math.min(level, MAX_LEVEL);
}

/**
 * Get the cumulative XP required to reach a given level.
 * Clamps to valid range [1, MAX_LEVEL].
 */
export function getXpForLevel(level: number): number {
    const clamped = Math.max(1, Math.min(level, MAX_LEVEL));
    return XP_TABLE[clamped - 1];
}

/**
 * Get XP remaining to reach the next level from the current XP.
 * Returns 0 if already at MAX_LEVEL.
 */
export function getXpToNextLevel(currentXp: number): number {
    const level = getLevelFromXp(currentXp);
    if (level >= MAX_LEVEL) return 0;
    const nextLevelXp = getXpForLevel(level + 1);
    return nextLevelXp - Math.min(currentXp, XP_CAP);
}

/**
 * Get how far through the current level the player is, as a 0.0–1.0 fraction.
 * Used to render XP progress bars.
 */
export function getXpProgress(currentXp: number): number {
    const level = getLevelFromXp(currentXp);
    if (level >= MAX_LEVEL) return 1;
    const thisLevelXp = getXpForLevel(level);
    const nextLevelXp = getXpForLevel(level + 1);
    const range = nextLevelXp - thisLevelXp;
    if (range <= 0) return 1;
    return (currentXp - thisLevelXp) / range;
}
