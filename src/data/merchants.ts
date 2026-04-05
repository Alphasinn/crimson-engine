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

            // --- T2 Armor: Melee ---
            { id: 'iron_guard_helm', price: 125, currency: 'bloodShards', tier: 'T2' },
            { id: 'iron_guard_chest', price: 250, currency: 'bloodShards', tier: 'T2' },
            { id: 'iron_guard_legs', price: 200, currency: 'bloodShards', tier: 'T2' },
            { id: 'iron_guard_gloves', price: 75, currency: 'bloodShards', tier: 'T2' },
            { id: 'iron_guard_boots', price: 75, currency: 'bloodShards', tier: 'T2' },

            // --- T2 Armor: Archery ---
            { id: 'nightstrider_helm', price: 125, currency: 'bloodShards', tier: 'T2' },
            { id: 'nightstrider_chest', price: 250, currency: 'bloodShards', tier: 'T2' },
            { id: 'nightstrider_legs', price: 200, currency: 'bloodShards', tier: 'T2' },
            { id: 'nightstrider_gloves', price: 75, currency: 'bloodShards', tier: 'T2' },
            { id: 'nightstrider_boots', price: 75, currency: 'bloodShards', tier: 'T2' },

            // --- T2 Armor: Sorcery ---
            { id: 'hemomancer_helm', price: 125, currency: 'bloodShards', tier: 'T2' },
            { id: 'hemomancer_chest', price: 250, currency: 'bloodShards', tier: 'T2' },
            { id: 'hemomancer_legs', price: 200, currency: 'bloodShards', tier: 'T2' },
            { id: 'hemomancer_gloves', price: 75, currency: 'bloodShards', tier: 'T2' },
            { id: 'hemomancer_boots', price: 75, currency: 'bloodShards', tier: 'T2' },

            // --- T3 Armor: Melee ---
            { id: 'blackthorn_helm', price: 600, currency: 'bloodShards', tier: 'T3' },
            { id: 'blackthorn_chest', price: 1200, currency: 'bloodShards', tier: 'T3' },
            { id: 'blackthorn_legs', price: 1000, currency: 'bloodShards', tier: 'T3' },
            { id: 'blackthorn_gloves', price: 400, currency: 'bloodShards', tier: 'T3' },
            { id: 'blackthorn_boots', price: 400, currency: 'bloodShards', tier: 'T3' },

            // --- T3 Armor: Archery ---
            { id: 'veilstalker_helm', price: 600, currency: 'bloodShards', tier: 'T3' },
            { id: 'veilstalker_chest', price: 1200, currency: 'bloodShards', tier: 'T3' },
            { id: 'veilstalker_legs', price: 1000, currency: 'bloodShards', tier: 'T3' },
            { id: 'veilstalker_gloves', price: 400, currency: 'bloodShards', tier: 'T3' },
            { id: 'veilstalker_boots', price: 400, currency: 'bloodShards', tier: 'T3' },

            // --- T3 Armor: Sorcery ---
            { id: 'sanguine_helm', price: 600, currency: 'bloodShards', tier: 'T3' },
            { id: 'sanguine_shroud', price: 1200, currency: 'bloodShards', tier: 'T3' },
            { id: 'sanguine_leggings', price: 1000, currency: 'bloodShards', tier: 'T3' },
            { id: 'sanguine_gloves', price: 400, currency: 'bloodShards', tier: 'T3' },
            { id: 'sanguine_boots', price: 400, currency: 'bloodShards', tier: 'T3' },

            // --- T4 Armor: Melee ---
            { id: 'sentinel_helm', price: 3000, currency: 'bloodShards', tier: 'T4' },
            { id: 'sentinel_chest', price: 6000, currency: 'bloodShards', tier: 'T4' },
            { id: 'sentinel_legs', price: 5000, currency: 'bloodShards', tier: 'T4' },
            { id: 'sentinel_gloves', price: 2000, currency: 'bloodShards', tier: 'T4' },
            { id: 'sentinel_boots', price: 2000, currency: 'bloodShards', tier: 'T4' },

            // --- T4 Armor: Archery ---
            { id: 'gravewalker_helm', price: 3000, currency: 'bloodShards', tier: 'T4' },
            { id: 'gravewalker_chest', price: 6000, currency: 'bloodShards', tier: 'T4' },
            { id: 'gravewalker_legs', price: 5000, currency: 'bloodShards', tier: 'T4' },
            { id: 'gravewalker_gloves', price: 2000, currency: 'bloodShards', tier: 'T4' },
            { id: 'gravewalker_boots', price: 2000, currency: 'bloodShards', tier: 'T4' },

            // --- T4 Armor: Sorcery ---
            { id: 'soulbound_helm', price: 3000, currency: 'bloodShards', tier: 'T4' },
            { id: 'soulbound_vestments', price: 6000, currency: 'bloodShards', tier: 'T4' },
            { id: 'soulbound_leggings', price: 5000, currency: 'bloodShards', tier: 'T4' },
            { id: 'soulbound_gloves', price: 2000, currency: 'bloodShards', tier: 'T4' },
            { id: 'soulbound_boots', price: 2000, currency: 'bloodShards', tier: 'T4' },

            // --- T5 Armor: Melee ---
            { id: 'warden_helm', price: 15000, currency: 'bloodShards', tier: 'T5' },
            { id: 'warden_chest', price: 30000, currency: 'bloodShards', tier: 'T5' },
            { id: 'warden_legs', price: 25000, currency: 'bloodShards', tier: 'T5' },
            { id: 'warden_gloves', price: 10000, currency: 'bloodShards', tier: 'T5' },
            { id: 'warden_boots', price: 10000, currency: 'bloodShards', tier: 'T5' },

            // --- T5 Armor: Archery ---
            { id: 'shadowweave_helm', price: 15000, currency: 'bloodShards', tier: 'T5' },
            { id: 'shadowweave_chest', price: 30000, currency: 'bloodShards', tier: 'T5' },
            { id: 'shadowweave_legs', price: 25000, currency: 'bloodShards', tier: 'T5' },
            { id: 'shadowweave_gloves', price: 10000, currency: 'bloodShards', tier: 'T5' },
            { id: 'shadowweave_boots', price: 10000, currency: 'bloodShards', tier: 'T5' },

            // --- T5 Armor: Sorcery ---
            { id: 'blood_prince_helm', price: 15000, currency: 'bloodShards', tier: 'T5' },
            { id: 'blood_prince_robe', price: 30000, currency: 'bloodShards', tier: 'T5' },
            { id: 'blood_prince_hose', price: 25000, currency: 'bloodShards', tier: 'T5' },
            { id: 'blood_prince_gloves', price: 10000, currency: 'bloodShards', tier: 'T5' },
            { id: 'blood_prince_boots', price: 10000, currency: 'bloodShards', tier: 'T5' },

            // --- T6 Armor: Melee ---
            { id: 'patriarch_crown', price: 75000, currency: 'bloodShards', tier: 'T6' },
            { id: 'patriarch_hauberk', price: 150000, currency: 'bloodShards', tier: 'T6' },
            { id: 'patriarch_cuisses', price: 120000, currency: 'bloodShards', tier: 'T6' },
            { id: 'patriarch_mittens', price: 50000, currency: 'bloodShards', tier: 'T6' },
            { id: 'patriarch_sollerets', price: 50000, currency: 'bloodShards', tier: 'T6' },

            // --- T6 Armor: Archery ---
            { id: 'phantom_helm', price: 75000, currency: 'bloodShards', tier: 'T6' },
            { id: 'phantom_chest', price: 150000, currency: 'bloodShards', tier: 'T6' },
            { id: 'phantom_legs', price: 120000, currency: 'bloodShards', tier: 'T6' },
            { id: 'phantom_gloves', price: 50000, currency: 'bloodShards', tier: 'T6' },
            { id: 'phantom_boots', price: 50000, currency: 'bloodShards', tier: 'T6' },

            // --- T6 Armor: Sorcery ---
            { id: 'void_conduit_helm', price: 75000, currency: 'bloodShards', tier: 'T6' },
            { id: 'void_conduit_chest', price: 150000, currency: 'bloodShards', tier: 'T6' },
            { id: 'void_conduit_legs', price: 120000, currency: 'bloodShards', tier: 'T6' },
            { id: 'void_conduit_gloves', price: 50000, currency: 'bloodShards', tier: 'T6' },
            { id: 'void_conduit_boots', price: 50000, currency: 'bloodShards', tier: 'T6' },
        ]
    },
    soul_broker: {
        id: 'soul_broker',
        name: 'Soul Broker',
        description: 'Trade boss essences for arcane relics. (Under Construction)',
        inventory: []
    }
};
