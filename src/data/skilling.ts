import type { InventoryItem, SkillName } from '../engine/types';
import iconRat from '../assets/skills/bloodletting/plagued_rat.png';
import iconDistillRat from '../assets/items/distill/rat_blood_vial.png';

// Icons for Runecraft & Ichor
import iconBloodShard from '../assets/icons/blood_shard.png';
import iconCursedIchor from '../assets/icons/cursed_ichor.png';
import iconStabilizedIchor from '../assets/icons/stabilized_ichor.png';

// Global Skilling Icons (Packs/Generic)
import iconRelics from '../assets/items/skilling/relics.png';
import iconHero1 from '../assets/items/skilling/hero_1.png';
import iconHero2 from '../assets/items/skilling/hero_2.png';
import iconGraveSteel from '../assets/icons/grave_steel.png';

export interface SkillingNode {
    id: string;
    name: string;
    skill: SkillName;
    levelReq: number;
    timeMs: number;
    xp: number;
    ingredients?: { id: string; quantity: number; icon?: string }[];
    output: { id: string; name: string; quantity: number; type: InventoryItem['type']; healAmount?: number; icon?: string };
}

export const GRAVE_NODES: SkillingNode[] = [
    { id: 'grave_dust_piles', name: 'Dusty Grave Piles', skill: 'graveHarvesting', levelReq: 1, timeMs: 3000, xp: 15, output: { id: 'grave_dust', name: 'Grave Dust', quantity: 1, type: 'material', icon: iconGraveSteel } },
    { id: 'rusty_relics', name: 'Rusty Relics', skill: 'graveHarvesting', levelReq: 10, timeMs: 4000, xp: 30, output: { id: 'rusty_scrap', name: 'Rusty Scrap', quantity: 1, type: 'material', icon: iconGraveSteel } },
    { id: 'cursed_ore_vein', name: 'Cursed Ore Vein', skill: 'graveHarvesting', levelReq: 20, timeMs: 5000, xp: 50, output: { id: 'cursed_ore', name: 'Cursed Ore', quantity: 1, type: 'material', icon: iconGraveSteel } },
    { id: 'bone_fragment_heap', name: 'Bone Fragment Heap', skill: 'graveHarvesting', levelReq: 30, timeMs: 6500, xp: 80, output: { id: 'bone_fragment', name: 'Bone Fragment', quantity: 1, type: 'material', icon: iconGraveSteel } },
    { id: 'bloodstone_deposit', name: 'Bloodstone Deposit', skill: 'graveHarvesting', levelReq: 45, timeMs: 8000, xp: 120, output: { id: 'bloodstone_shard', name: 'Bloodstone Shard', quantity: 1, type: 'material', icon: iconBloodShard } },
    { id: 'ancient_relic_vault', name: 'Ancient Relic Vault', skill: 'graveHarvesting', levelReq: 60, timeMs: 10000, xp: 200, output: { id: 'ancient_relic', name: 'Ancient Relic', quantity: 1, type: 'material', icon: iconRelics } },
];

export const FORAGING_NODES: SkillingNode[] = [
    { id: 'thornvine_thicket', name: 'Thornvine Thicket', skill: 'nightForaging', levelReq: 1, timeMs: 2500, xp: 12, output: { id: 'thornvine', name: 'Thornvine', quantity: 1, type: 'material', icon: iconHero1 } },
    { id: 'nightshade_patch', name: 'Nightshade Patch', skill: 'nightForaging', levelReq: 10, timeMs: 3500, xp: 25, output: { id: 'nightshade_berry', name: 'Nightshade Berry', quantity: 1, type: 'material', icon: iconHero1 } },
    { id: 'moonleaf_grove', name: 'Moonleaf Grove', skill: 'nightForaging', levelReq: 20, timeMs: 4500, xp: 45, output: { id: 'moonleaf', name: 'Moonleaf', quantity: 1, type: 'material', icon: iconHero1 } },
    { id: 'grave_bloom_garden', name: 'Grave Bloom Garden', skill: 'nightForaging', levelReq: 35, timeMs: 6000, xp: 75, output: { id: 'grave_bloom', name: 'Grave Bloom', quantity: 1, type: 'material', icon: iconHero1 } },
    { id: 'ghost_orchid_glade', name: 'Ghost Orchid Glade', skill: 'nightForaging', levelReq: 50, timeMs: 8000, xp: 110, output: { id: 'ghost_orchid', name: 'Ghost Orchid', quantity: 1, type: 'material', icon: iconHero1 } },
];

export const FORGING_RECIPES: SkillingNode[] = [
    { 
        id: 'forge_iron_plates', name: 'Iron Reinforcement', skill: 'forging', levelReq: 1, timeMs: 5000, xp: 40, 
        ingredients: [{ id: 'rusty_scrap', quantity: 3, icon: iconGraveSteel }],
        output: { id: 'iron_plate', name: 'Iron Plate', quantity: 1, type: 'material', icon: iconHero1 } 
    },
    { 
        id: 'forge_steel_rivets', name: 'Steel Rivets', skill: 'forging', levelReq: 15, timeMs: 6000, xp: 70, 
        ingredients: [{ id: 'rusty_scrap', quantity: 2, icon: iconGraveSteel }, { id: 'grave_dust', quantity: 5, icon: iconGraveSteel }],
        output: { id: 'steel_rivets', name: 'Steel Rivets', quantity: 2, type: 'material', icon: iconHero1 } 
    },
    { 
        id: 'forge_cursed_ingot', name: 'Cursed Ingot', skill: 'forging', levelReq: 30, timeMs: 8000, xp: 150, 
        ingredients: [{ id: 'cursed_ore', quantity: 2, icon: iconGraveSteel }, { id: 'grave_dust', quantity: 10, icon: iconGraveSteel }],
        output: { id: 'cursed_ingot', name: 'Cursed Ingot', quantity: 1, type: 'material', icon: iconHero1 } 
    },
];

export const CORPSE_RECIPES: SkillingNode[] = [
    { 
        id: 'process_low_remains', name: 'Extract Sinew', skill: 'corpseHarvesting', levelReq: 1, timeMs: 4000, xp: 20, 
        ingredients: [{ id: 'low_remains', quantity: 1, icon: iconHero2 }],
        output: { id: 'beast_sinew', name: 'Beast Sinew', quantity: 2, type: 'material', icon: iconHero2 } 
    },
    { 
        id: 'process_bone_remains', name: 'Grind Bones', skill: 'corpseHarvesting', levelReq: 10, timeMs: 5000, xp: 35, 
        ingredients: [{ id: 'bone_remains', quantity: 1, icon: iconHero2 }],
        output: { id: 'bone_meal', name: 'Bone Meal', quantity: 3, type: 'material', icon: iconHero2 } 
    },
    { 
        id: 'process_tough_remains', name: 'Cure Hides', skill: 'corpseHarvesting', levelReq: 25, timeMs: 7000, xp: 80, 
        ingredients: [{ id: 'tough_remains', quantity: 1, icon: iconHero2 }],
        output: { id: 'tough_leather', name: 'Tough Leather', quantity: 1, type: 'material', icon: iconHero2 } 
    },
];

export const ALCHEMY_RECIPES: SkillingNode[] = [
    { 
        id: 'brew_minor_vitae', name: 'Minor Vitae Extract', skill: 'alchemy', levelReq: 1, timeMs: 4000, xp: 30, 
        ingredients: [{ id: 'raw_rat_blood', quantity: 1, icon: iconRat }, { id: 'thornvine', quantity: 2, icon: iconHero1 }],
        output: { id: 'minor_vitae_extract', name: 'Minor Vitae Extract', quantity: 1, type: 'food', healAmount: 25, icon: iconHero2 } 
    },
    { 
        id: 'brew_scent_mask', name: 'Scent Mask Oil', skill: 'alchemy', levelReq: 15, timeMs: 6000, xp: 60, 
        ingredients: [{ id: 'nightshade_berry', quantity: 3, icon: iconHero1 }, { id: 'grave_dust', quantity: 5, icon: iconGraveSteel }],
        output: { id: 'scent_mask_oil', name: 'Scent Mask Oil', quantity: 1, type: 'material', icon: iconHero2 } // Pre-combat buff item
    },
    { 
        id: 'brew_greater_vitae', name: 'Greater Vitae Serum', skill: 'alchemy', levelReq: 35, timeMs: 8000, xp: 150, 
        ingredients: [{ id: 'raw_livestock_blood', quantity: 1, icon: iconRat }, { id: 'moonleaf', quantity: 3, icon: iconHero1 }, { id: 'bone_meal', quantity: 2, icon: iconHero2 }],
        output: { id: 'greater_vitae_serum', name: 'Greater Vitae Serum', quantity: 1, type: 'food', healAmount: 75, icon: iconHero2 } 
    },
];

export const BUTCHERY_NODES: SkillingNode[] = [
    { id: 'butcher_basic_remains', name: 'Process Basic Remains', skill: 'butchery', levelReq: 1, timeMs: 3000, xp: 15, output: { id: 'raw_meat_scraps', name: 'Raw Meat Scraps', quantity: 1, type: 'material', icon: iconHero2 } },
    { id: 'butcher_beast_carcass', name: 'Carve Beast Carcass', skill: 'butchery', levelReq: 15, timeMs: 5000, xp: 40, output: { id: 'prime_beast_cuts', name: 'Prime Beast Cuts', quantity: 1, type: 'material', icon: iconHero2 } },
    { id: 'butcher_marrow_bones', name: 'Extract Marrow Bones', skill: 'butchery', levelReq: 30, timeMs: 7000, xp: 80, output: { id: 'bone_marrow', name: 'Bone Marrow', quantity: 1, type: 'material', icon: iconHero1 } },
];

export const RELIC_NODES: SkillingNode[] = [
    { id: 'scavenge_ruins', name: 'Sift Through Ruins', skill: 'relicScavenging', levelReq: 1, timeMs: 4000, xp: 20, output: { id: 'rusted_token', name: 'Rusted Token', quantity: 1, type: 'material', icon: iconRelics } },
    { id: 'scavenge_crypt_relics', name: 'Loot Crypt Relics', skill: 'relicScavenging', levelReq: 20, timeMs: 6000, xp: 55, output: { id: 'crypt_relic_shard', name: 'Crypt Relic Shard', quantity: 1, type: 'material', icon: iconRelics } },
    { id: 'scavenge_sealed_vault', name: 'Breach Sealed Vault', skill: 'relicScavenging', levelReq: 40, timeMs: 9000, xp: 130, output: { id: 'sealed_artifact', name: 'Sealed Artifact', quantity: 1, type: 'material', icon: iconHero1 } },
];

export const RUNECRAFT_RECIPES: SkillingNode[] = [
    { 
        id: 'runecraft_stabilize_ichor', 
        name: 'Stabilize Ichor', 
        skill: 'runecraft', 
        levelReq: 1, 
        timeMs: 15000, 
        xp: 100, 
        ingredients: [
            { id: 'blood_shard', quantity: 125, icon: iconBloodShard },
            { id: 'cursed_ichor', quantity: 1, icon: iconCursedIchor }
        ],
        output: { id: 'stabilized_ichor', name: 'Stabilized Ichor', quantity: 1, type: 'material', icon: iconStabilizedIchor } 
    },
    { id: 'inscribe_minor_ward', name: 'Inscribe Minor Ward', skill: 'runecraft', levelReq: 1, timeMs: 5000, xp: 35, output: { id: 'minor_ward_rune', name: 'Minor Ward Rune', quantity: 1, type: 'material', icon: iconHero2 } },
    { id: 'inscribe_blood_sigil', name: 'Inscribe Blood Sigil', skill: 'runecraft', levelReq: 20, timeMs: 7000, xp: 80, ingredients: [{ id: 'grave_dust', quantity: 5, icon: iconGraveSteel }], output: { id: 'blood_sigil', name: 'Blood Sigil', quantity: 1, type: 'material', icon: iconHero2 } },
    { id: 'inscribe_sanguine_glyph', name: 'Sanguine Glyph', skill: 'runecraft', levelReq: 40, timeMs: 10000, xp: 160, ingredients: [{ id: 'bloodstone_shard', quantity: 2, icon: iconBloodShard }, { id: 'grave_dust', quantity: 10, icon: iconGraveSteel }], output: { id: 'sanguine_glyph', name: 'Sanguine Glyph', quantity: 1, type: 'material', icon: iconHero2 } },
];

export const ALL_SKILLING_NODES: Record<string, SkillingNode> = [
    ...GRAVE_NODES,
    ...FORAGING_NODES,
    ...FORGING_RECIPES,
    ...CORPSE_RECIPES,
    ...ALCHEMY_RECIPES,
    ...BUTCHERY_NODES,
    ...RELIC_NODES,
    ...RUNECRAFT_RECIPES,
].reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
}, {} as Record<string, SkillingNode>);
