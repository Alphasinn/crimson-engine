// =============================================================================
// CRIMSON ENGINE — Consumable Data (Food)
// Items that can be equipped to the ConsumablePanel for auto-eating.
// =============================================================================

import type { InventoryItem } from '../engine/types';

export const CONSUMABLES: Record<string, InventoryItem> = {
    blood_orange: {
        id: 'blood_orange',
        name: 'Blood Orange',
        quantity: 0,
        type: 'food',
        healAmount: 12,
    },
    ironbread: {
        id: 'ironbread',
        name: 'Ironbread',
        quantity: 0,
        type: 'food',
        healAmount: 20,
    },
    vampires_brew: {
        id: 'vampires_brew',
        name: "Vampire's Brew",
        quantity: 0,
        type: 'food',
        healAmount: 35,
    },
    heart_meat: {
        id: 'heart_meat',
        name: 'Heart-Meat',
        quantity: 0,
        type: 'food',
        healAmount: 55,
    },
    elder_blood_vial: {
        id: 'elder_blood_vial',
        name: 'Elder Blood Vial',
        quantity: 0,
        type: 'food',
        healAmount: 90,
    },
};

export const FOOD_LIST = Object.values(CONSUMABLES);
