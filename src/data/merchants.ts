import type { GearTier } from '../engine/types';

export interface MerchantItem {
    id: string;
    price: number;
    currency: 'bloodShards' | 'stabilizedIchor' | 'graveSteel';
    tier?: GearTier;
}

export interface Merchant {
    id: string;
    name: string;
    description: string;
    inventory: MerchantItem[];
}

export const MERCHANTS: Record<string, Merchant> = {
    blood_merchant: {
        id: 'blood_merchant',
        name: 'Blood Merchant',
        description: 'Exchange shards for basic equipment and consumables.',
        inventory: [
            // --- T1 Melee: Rustborn Plate ---
            { id: 'rustborn_helm', price: 25, currency: 'bloodShards', tier: 'T1' },
            { id: 'rustborn_chest', price: 50, currency: 'bloodShards', tier: 'T1' },
            { id: 'rustborn_legs', price: 40, currency: 'bloodShards', tier: 'T1' },
            { id: 'rustborn_gloves', price: 15, currency: 'bloodShards', tier: 'T1' },
            { id: 'rustborn_boots', price: 15, currency: 'bloodShards', tier: 'T1' },

            // --- T1 Archery: Scout Leathers ---
            { id: 'scout_helm', price: 25, currency: 'bloodShards', tier: 'T1' },
            { id: 'scout_chest', price: 50, currency: 'bloodShards', tier: 'T1' },
            { id: 'scout_legs', price: 40, currency: 'bloodShards', tier: 'T1' },
            { id: 'scout_gloves', price: 15, currency: 'bloodShards', tier: 'T1' },
            { id: 'scout_boots', price: 15, currency: 'bloodShards', tier: 'T1' },

            // --- T1 Sorcery: Acolyte Rags ---
            { id: 'acolyte_helm', price: 25, currency: 'bloodShards', tier: 'T1' },
            { id: 'acolyte_chest', price: 50, currency: 'bloodShards', tier: 'T1' },
            { id: 'acolyte_legs', price: 40, currency: 'bloodShards', tier: 'T1' },
            { id: 'acolyte_gloves', price: 15, currency: 'bloodShards', tier: 'T1' },
            { id: 'acolyte_boots', price: 15, currency: 'bloodShards', tier: 'T1' },

            // --- T1 Weapons: Melee ---
            { id: 'rusted_fang', price: 35, currency: 'bloodShards', tier: 'T1' },
            { id: 'frayed_cleaver', price: 35, currency: 'bloodShards', tier: 'T1' },
            { id: 'bone_maul', price: 35, currency: 'bloodShards', tier: 'T1' },
            { id: 'stone_mace', price: 35, currency: 'bloodShards', tier: 'T1' },

            // --- T1 Weapons: Archery ---
            { id: 'ashwood_bow', price: 35, currency: 'bloodShards', tier: 'T1' },
            { id: 'crank_crossbow', price: 35, currency: 'bloodShards', tier: 'T1' },

            // --- T1 Weapons: Sorcery ---
            { id: 'flicker_wand', price: 35, currency: 'bloodShards', tier: 'T1' },
            { id: 'bone_staff', price: 35, currency: 'bloodShards', tier: 'T1' },
        ]
    },
    soul_broker: {
        id: 'soul_broker',
        name: 'Soul Broker',
        description: 'Trade boss essences for arcane relics. (Under Construction)',
        inventory: []
    }
};
