// =============================================================================
// CRIMSON ENGINE — Progression & Tier Shift Logic
// Handles leveling, tier transitions, and item upgrades.
// =============================================================================

import type { PlayerSkills, EquipmentItem } from './types';

/**
 * Checks if a player is eligible to perform a Tier Shift.
 * Requires all core combat skills to be at the level cap.
 */
export function isEligibleForTierShift(skills: PlayerSkills): boolean {
    const coreSkills: (keyof PlayerSkills)[] = ['attack', 'strength', 'defense', 'vitality', 'ranged', 'magic', 'agility'];
    return coreSkills.every(skill => skills[skill].level >= 120);
}

/**
 * Calculate the Vitae shard cost for a Tier Shift.
 * Base: 1000 * (Tier ^ 1.5)
 */
export function getTierShiftCost(currentTier: number): number {
    return Math.floor(1000 * Math.pow(currentTier, 1.5));
}

/**
 * Validates if the result of a shift matches the target tier.
 */
export function validateShiftResult(targetTier: number, resultItem: EquipmentItem): boolean {
    return resultItem.tier === targetTier;
}

/**
 * Resolves the upgraded version of an item based on its current tier.
 */
export function resolveNextTierItem(item: EquipmentItem, allItems: EquipmentItem[]): EquipmentItem | null {
    const nextTier = item.tier + 1;
    // Simple lookup: same name/archetype but next tier
    return allItems.find(i => i.name === item.name && i.tier === nextTier) || null;
}
