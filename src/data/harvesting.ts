import type { InventoryItem } from '../engine/types';
import iconRat from '../assets/skills/bloodletting/plagued_rat.png';
import iconDistillRat from '../assets/items/distill/rat_blood_vial.png';

export interface HarvestingNode {
    id: string;
    name: string;
    levelReq: number;
    rawItem: InventoryItem;
    distillItem: InventoryItem;
    baseHarvestTimeMs: number;
    baseDistillTimeMs: number;
    harvestXp: number;
    distillXp: number;
    icon?: string;
    distillIcon?: string;
}

export const BLOOD_TIERS: HarvestingNode[] = [
    {
        id: 'node_rat',
        name: 'Plagued Rats',
        levelReq: 1,
        rawItem: { id: 'raw_rat_blood', name: 'Plagued Rat Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_rat_blood', name: 'Rat Blood Vial', quantity: 0, type: 'food', healAmount: 15 },
        baseHarvestTimeMs: 2000,
        baseDistillTimeMs: 1500,
        harvestXp: 10,
        distillXp: 15,
        icon: iconRat,
        distillIcon: iconDistillRat
    },
    {
        id: 'node_stray',
        name: 'Feral Strays',
        levelReq: 10,
        rawItem: { id: 'raw_stray_blood', name: 'Feral Stray Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_stray_blood', name: 'Stray Blood Vial', quantity: 0, type: 'food', healAmount: 30 },
        baseHarvestTimeMs: 3000,
        baseDistillTimeMs: 2000,
        harvestXp: 25,
        distillXp: 35
    },
    {
        id: 'node_livestock',
        name: 'Livestock Pens',
        levelReq: 20,
        rawItem: { id: 'raw_livestock_blood', name: 'Livestock Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_livestock_blood', name: 'Livestock Blood Vial', quantity: 0, type: 'food', healAmount: 50 },
        baseHarvestTimeMs: 4000,
        baseDistillTimeMs: 2500,
        harvestXp: 45,
        distillXp: 60
    },
    {
        id: 'node_peasant',
        name: 'Peasant Slums',
        levelReq: 30,
        rawItem: { id: 'raw_peasant_blood', name: 'Peasant Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_peasant_blood', name: 'Peasant Blood Vial', quantity: 0, type: 'food', healAmount: 80 },
        baseHarvestTimeMs: 5000,
        baseDistillTimeMs: 3000,
        harvestXp: 70,
        distillXp: 90
    },
    {
        id: 'node_vagrant',
        name: 'Vagrant Camps',
        levelReq: 40,
        rawItem: { id: 'raw_vagrant_blood', name: 'Vagrant Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_vagrant_blood', name: 'Vagrant Blood Vial', quantity: 0, type: 'food', healAmount: 120 },
        baseHarvestTimeMs: 6000,
        baseDistillTimeMs: 3500,
        harvestXp: 100,
        distillXp: 125
    },
    {
        id: 'node_beast',
        name: 'Dire Woods',
        levelReq: 50,
        rawItem: { id: 'raw_beastblood', name: 'Beastblood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_beastblood', name: 'Beastblood Vial', quantity: 0, type: 'food', healAmount: 180 },
        baseHarvestTimeMs: 7500,
        baseDistillTimeMs: 4000,
        harvestXp: 140,
        distillXp: 170
    },
    {
        id: 'node_commoner',
        name: 'Commoner District',
        levelReq: 60,
        rawItem: { id: 'raw_commoner_blood', name: 'Commoner Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_commoner_blood', name: 'Commoner Blood Vial', quantity: 0, type: 'food', healAmount: 250 },
        baseHarvestTimeMs: 9000,
        baseDistillTimeMs: 5000,
        harvestXp: 190,
        distillXp: 220
    },
    {
        id: 'node_clergy',
        name: 'Holy Orders',
        levelReq: 70,
        rawItem: { id: 'raw_clergy_blood', name: 'Clergy Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_clergy_blood', name: 'Clergy Blood Vial', quantity: 0, type: 'food', healAmount: 350 },
        baseHarvestTimeMs: 11000,
        baseDistillTimeMs: 6000,
        harvestXp: 250,
        distillXp: 280
    },
    {
        id: 'node_noble',
        name: 'Nobility Estates',
        levelReq: 80,
        rawItem: { id: 'raw_noble_blood', name: 'Noble Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_noble_blood', name: 'Noble Blood Vial', quantity: 0, type: 'food', healAmount: 500 },
        baseHarvestTimeMs: 13000,
        baseDistillTimeMs: 7000,
        harvestXp: 320,
        distillXp: 360
    },
    {
        id: 'node_tainted',
        name: 'Occult Covens',
        levelReq: 90,
        rawItem: { id: 'raw_tainted_blood', name: 'Tainted Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_tainted_blood', name: 'Tainted Blood Vial', quantity: 0, type: 'food', healAmount: 700 },
        baseHarvestTimeMs: 15000,
        baseDistillTimeMs: 8500,
        harvestXp: 400,
        distillXp: 450
    },
    {
        id: 'node_royal',
        name: 'Royal Palace',
        levelReq: 95,
        rawItem: { id: 'raw_royal_blood', name: 'Royal Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_royal_blood', name: 'Royal Vitae Vial', quantity: 0, type: 'food', healAmount: 1000 },
        baseHarvestTimeMs: 18000,
        baseDistillTimeMs: 10000,
        harvestXp: 500,
        distillXp: 550
    },
    {
        id: 'node_elder',
        name: 'Slumbering Gods',
        levelReq: 99,
        rawItem: { id: 'raw_elder_blood', name: 'Elder Blood', quantity: 0, type: 'raw_blood' },
        distillItem: { id: 'vial_elder_blood', name: 'Mythic Vitae Phial', quantity: 0, type: 'food', healAmount: 1500 },
        baseHarvestTimeMs: 22000,
        baseDistillTimeMs: 12000,
        harvestXp: 650,
        distillXp: 700
    }
];

// Helper dictionaries for easy lookup
export const HARVESTING_NODES: Record<string, HarvestingNode> = BLOOD_TIERS.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
}, {} as Record<string, HarvestingNode>);

export const ALCHEMY_RECIPES: Record<string, HarvestingNode> = BLOOD_TIERS.reduce((acc, node) => {
    acc[node.distillItem.id] = node;
    return acc;
}, {} as Record<string, HarvestingNode>);
