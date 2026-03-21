// =============================================================================
// CRIMSON ENGINE — Loot Roller
// Weighted random selection from an enemy's loot table.
// =============================================================================

import type { LootTableEntry } from './types';

/**
 * Roll a random loot item from a weighted table.
 * Returns the winning itemId, or null if the table is empty/all zero.
 *
 * @example
 * rollLoot([
 *   { itemId: 'copper_coin', itemName: 'Copper Coin', weight: 50 },
 *   { itemId: 'rusted_dagger', itemName: 'Rusted Dagger', weight: 15 },
 * ]);
 */
export function rollLoot(lootTable: LootTableEntry[]): string | null {
    if (!lootTable.length) return null;

    const totalWeight = lootTable.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (const entry of lootTable) {
        roll -= entry.weight;
        if (roll <= 0) return entry.itemId;
    }

    // Fallback (floating point safety)
    return lootTable[lootTable.length - 1].itemId;
}

/**
 * Roll a loot drop and return the full entry object (name + id).
 */
export function rollLootEntry(lootTable: LootTableEntry[]): LootTableEntry | null {
    const id = rollLoot(lootTable);
    if (!id) return null;
    return lootTable.find(e => e.itemId === id) ?? null;
}
