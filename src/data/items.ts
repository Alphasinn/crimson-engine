// =============================================================================
// CRIMSON ENGINE — Unified Item Database
// Combines all items from combat, skilling, and exploration.
// =============================================================================

import type { EquipmentItem, InventoryItem } from '../engine/types';
import WEAPONS from './weapons';
import ARMOR from './armor';
import { BLOOD_ECHO_ITEMS } from './bloodEchoItems';
import { ALL_SKILLING_NODES } from './skilling';
import { BLOOD_TIERS } from './harvesting';

// 1. Gather all equipment
const ALL_EQUIPMENT: EquipmentItem[] = [...WEAPONS, ...ARMOR];

// 2. Gather all materials and consumables from skilling
const SKILLING_ITEMS: InventoryItem[] = Object.values(ALL_SKILLING_NODES).map(node => ({
    id: node.output.id,
    name: node.output.name,
    type: node.output.type,
    quantity: 0,
    ...(node.output.healAmount ? { healAmount: node.output.healAmount } : {})
}));

// 3. Gather all raw blood and distilled vials
const HARVESTING_ITEMS: InventoryItem[] = BLOOD_TIERS.flatMap(tier => [
    { ...tier.rawItem, quantity: 0 },
    { ...tier.distillItem, quantity: 0 }
]);

// 4. Starter food (previously hardcoded in store)
const STARTER_ITEMS: InventoryItem[] = [
    { id: 'blood_orange', name: 'Blood Orange', quantity: 0, type: 'food', healAmount: 12 },
    { id: 'ironbread', name: 'Ironbread', quantity: 0, type: 'food', healAmount: 20 },
];

// 5. Special resources
const CORE_RESOURCES: InventoryItem[] = [
    { id: 'blood_shard', name: 'Blood Shard', quantity: 0, type: 'material' },
    { id: 'cursed_ichor', name: 'Cursed Ichor', quantity: 0, type: 'material' },
    { id: 'grave_steel', name: 'Grave Steel', quantity: 0, type: 'material' },
    { id: 'stabilized_ichor', name: 'Stabilized Ichor', quantity: 0, type: 'material' },
];

// Combine everything into a master list
export const ITEM_DATABASE: (EquipmentItem | InventoryItem)[] = [
    ...ALL_EQUIPMENT,
    ...SKILLING_ITEMS,
    ...HARVESTING_ITEMS,
    ...BLOOD_ECHO_ITEMS,
    ...STARTER_ITEMS,
    ...CORE_RESOURCES,
];

// Create a map for O(1) lookups
export const ITEM_MAP = new Map<string, EquipmentItem | InventoryItem>(
    ITEM_DATABASE.map(item => [item.id, item])
);

/**
 * Resolve an item ID to its canonical definition.
 */
export function resolveItem(id: string): (EquipmentItem | InventoryItem) | null {
    return ITEM_MAP.get(id) || null;
}
