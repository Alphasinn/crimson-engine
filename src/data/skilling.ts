import type { InventoryItem, SkillName } from '../engine/types';

export interface SkillingNode {
    id: string;
    name: string;
    skill: SkillName;
    levelReq: number;
    timeMs: number;
    xp: number;
    ingredients?: { id: string; quantity: number }[];
    output: { id: string; name: string; quantity: number; type: InventoryItem['type']; healAmount?: number };
}

export const GRAVE_NODES: SkillingNode[] = [
    { id: 'grave_dust_piles', name: 'Dusty Grave Piles', skill: 'graveHarvesting', levelReq: 1, timeMs: 3000, xp: 15, output: { id: 'grave_dust', name: 'Grave Dust', quantity: 1, type: 'material' } },
    { id: 'rusty_relics', name: 'Rusty Relics', skill: 'graveHarvesting', levelReq: 10, timeMs: 4000, xp: 30, output: { id: 'rusty_scrap', name: 'Rusty Scrap', quantity: 1, type: 'material' } },
    { id: 'cursed_ore_vein', name: 'Cursed Ore Vein', skill: 'graveHarvesting', levelReq: 20, timeMs: 5000, xp: 50, output: { id: 'cursed_ore', name: 'Cursed Ore', quantity: 1, type: 'material' } },
    { id: 'bone_fragment_heap', name: 'Bone Fragment Heap', skill: 'graveHarvesting', levelReq: 30, timeMs: 6500, xp: 80, output: { id: 'bone_fragment', name: 'Bone Fragment', quantity: 1, type: 'material' } },
    { id: 'bloodstone_deposit', name: 'Bloodstone Deposit', skill: 'graveHarvesting', levelReq: 45, timeMs: 8000, xp: 120, output: { id: 'bloodstone_shard', name: 'Bloodstone Shard', quantity: 1, type: 'material' } },
    { id: 'ancient_relic_vault', name: 'Ancient Relic Vault', skill: 'graveHarvesting', levelReq: 60, timeMs: 10000, xp: 200, output: { id: 'ancient_relic', name: 'Ancient Relic', quantity: 1, type: 'material' } },
];

export const FORAGING_NODES: SkillingNode[] = [
    { id: 'thornvine_thicket', name: 'Thornvine Thicket', skill: 'nightForaging', levelReq: 1, timeMs: 2500, xp: 12, output: { id: 'thornvine', name: 'Thornvine', quantity: 1, type: 'material' } },
    { id: 'nightshade_patch', name: 'Nightshade Patch', skill: 'nightForaging', levelReq: 10, timeMs: 3500, xp: 25, output: { id: 'nightshade_berry', name: 'Nightshade Berry', quantity: 1, type: 'material' } },
    { id: 'moonleaf_grove', name: 'Moonleaf Grove', skill: 'nightForaging', levelReq: 20, timeMs: 4500, xp: 45, output: { id: 'moonleaf', name: 'Moonleaf', quantity: 1, type: 'material' } },
    { id: 'grave_bloom_garden', name: 'Grave Bloom Garden', skill: 'nightForaging', levelReq: 35, timeMs: 6000, xp: 75, output: { id: 'grave_bloom', name: 'Grave Bloom', quantity: 1, type: 'material' } },
    { id: 'ghost_orchid_glade', name: 'Ghost Orchid Glade', skill: 'nightForaging', levelReq: 50, timeMs: 8000, xp: 110, output: { id: 'ghost_orchid', name: 'Ghost Orchid', quantity: 1, type: 'material' } },
];

export const FORGING_RECIPES: SkillingNode[] = [
    { 
        id: 'forge_iron_plates', name: 'Iron Reinforcement', skill: 'forging', levelReq: 1, timeMs: 5000, xp: 40, 
        ingredients: [{ id: 'rusty_scrap', quantity: 3 }],
        output: { id: 'iron_plate', name: 'Iron Plate', quantity: 1, type: 'material' } 
    },
    { 
        id: 'forge_steel_rivets', name: 'Steel Rivets', skill: 'forging', levelReq: 15, timeMs: 6000, xp: 70, 
        ingredients: [{ id: 'rusty_scrap', quantity: 2 }, { id: 'grave_dust', quantity: 5 }],
        output: { id: 'steel_rivets', name: 'Steel Rivets', quantity: 2, type: 'material' } 
    },
    { 
        id: 'forge_cursed_ingot', name: 'Cursed Ingot', skill: 'forging', levelReq: 30, timeMs: 8000, xp: 150, 
        ingredients: [{ id: 'cursed_ore', quantity: 2 }, { id: 'grave_dust', quantity: 10 }],
        output: { id: 'cursed_ingot', name: 'Cursed Ingot', quantity: 1, type: 'material' } 
    },
];

export const CORPSE_RECIPES: SkillingNode[] = [
    { 
        id: 'process_low_remains', name: 'Extract Sinew', skill: 'corpseHarvesting', levelReq: 1, timeMs: 4000, xp: 20, 
        ingredients: [{ id: 'low_remains', quantity: 1 }],
        output: { id: 'beast_sinew', name: 'Beast Sinew', quantity: 2, type: 'material' } 
    },
    { 
        id: 'process_bone_remains', name: 'Grind Bones', skill: 'corpseHarvesting', levelReq: 10, timeMs: 5000, xp: 35, 
        ingredients: [{ id: 'bone_remains', quantity: 1 }],
        output: { id: 'bone_meal', name: 'Bone Meal', quantity: 3, type: 'material' } 
    },
    { 
        id: 'process_tough_remains', name: 'Cure Hides', skill: 'corpseHarvesting', levelReq: 25, timeMs: 7000, xp: 80, 
        ingredients: [{ id: 'tough_remains', quantity: 1 }],
        output: { id: 'tough_leather', name: 'Tough Leather', quantity: 1, type: 'material' } 
    },
];

export const ALCHEMY_RECIPES: SkillingNode[] = [
    { 
        id: 'brew_minor_vitae', name: 'Minor Vitae Extract', skill: 'alchemy', levelReq: 1, timeMs: 4000, xp: 30, 
        ingredients: [{ id: 'raw_rat_blood', quantity: 1 }, { id: 'thornvine', quantity: 2 }],
        output: { id: 'minor_vitae_extract', name: 'Minor Vitae Extract', quantity: 1, type: 'food', healAmount: 25 } 
    },
    { 
        id: 'brew_scent_mask', name: 'Scent Mask Oil', skill: 'alchemy', levelReq: 15, timeMs: 6000, xp: 60, 
        ingredients: [{ id: 'nightshade_berry', quantity: 3 }, { id: 'grave_dust', quantity: 5 }],
        output: { id: 'scent_mask_oil', name: 'Scent Mask Oil', quantity: 1, type: 'material' } // Pre-combat buff item
    },
    { 
        id: 'brew_greater_vitae', name: 'Greater Vitae Serum', skill: 'alchemy', levelReq: 35, timeMs: 8000, xp: 150, 
        ingredients: [{ id: 'raw_livestock_blood', quantity: 1 }, { id: 'moonleaf', quantity: 3 }, { id: 'bone_meal', quantity: 2 }],
        output: { id: 'greater_vitae_serum', name: 'Greater Vitae Serum', quantity: 1, type: 'food', healAmount: 75 } 
    },
];

export const ALL_SKILLING_NODES: Record<string, SkillingNode> = [
    ...GRAVE_NODES,
    ...FORAGING_NODES,
    ...FORGING_RECIPES,
    ...CORPSE_RECIPES,
    ...ALCHEMY_RECIPES
].reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
}, {} as Record<string, SkillingNode>);
