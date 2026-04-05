// =============================================================================
// CRIMSON ENGINE — Player Store (Zustand)
// Manages: skills, equipment, active combat style, food inventory
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerSkills, PlayerEquipment, EquipmentItem, CombatStyle, InventoryItem, SkillName, TrainingMode, LootHistoryItem, UpgradeId, RitualDefinition } from '../engine/types';
import { getLevelFromXp, getXpForLevel } from '../engine/xpTable';
import {
    STARTING_VITAE_LEVEL,
} from '../engine/constants';
import { 
    isEligibleForTierShift, 
    getTierShiftCost, 
    validateShiftResult,
    resolveNextTierItem
} from '../engine/progression';
import { ITEM_DATABASE } from '../data/items';
import { InventoryManager } from '../engine/inventoryManager';

const STARTER_FOOD: InventoryItem[] = [
    { id: 'blood_orange', name: 'Blood Orange', quantity: 25, type: 'food', healAmount: 12 },
    { id: 'ironbread', name: 'Ironbread', quantity: 5, type: 'food', healAmount: 20 },
];

const DEFAULT_SKILLS: PlayerSkills = {
    fangMastery:   { level: 1, xp: 0 },
    predatorForce: { level: 1, xp: 0 },
    obsidianWard:  { level: 1, xp: 0 },
    shadowArchery: { level: 1, xp: 0 },
    bloodSorcery:  { level: 1, xp: 0 },
    // Vitae starts at level 10; XP must match so gainXp doesn't recompute to level 1
    vitae: { level: STARTING_VITAE_LEVEL, xp: getXpForLevel(STARTING_VITAE_LEVEL) },
    bloodletting: { level: 1, xp: 0 },
    nightForaging: { level: 1, xp: 0 },
    graveHarvesting: { level: 1, xp: 0 },
    butchery: { level: 1, xp: 0 },
    relicScavenging: { level: 1, xp: 0 },
    distillation: { level: 1, xp: 0 },
    forging: { level: 1, xp: 0 },
    corpseHarvesting: { level: 1, xp: 0 },
    alchemy: { level: 1, xp: 0 },
    runecraft: { level: 1, xp: 0 },
};

interface PlayerState {
    skills: PlayerSkills;
    equipment: PlayerEquipment;
    activeStyle: CombatStyle;
    trainingMode: TrainingMode;
    food: InventoryItem[];
    inventory: InventoryItem[];
    lootHistory: LootHistoryItem[];
    autoLootEnabled: boolean;
    unlockedUpgrades: UpgradeId[];
    autoEatThreshold: number;
    autoEatEnabled: boolean;
    currentVitae: number;
    // Phase 2A: Foundational Resources
    bloodShards: number;
    graveSteel: number;
    cursedIchor: number;
    stabilizedIchor: number;
    unbankedShards: number;
    unbankedIchor: number;
    unbankedSteel: number;
    // Phase 2A Monitoring & Buffs
    isBraced: boolean;
    finesseTicksRemaining: number;
    permanentArmorBonus: number;
    redMistIchorDrops: number;
    redMistDeaths: number;
    crucibleSealed: boolean;
    // Phase 4: Rituals & Resonance
    activeRituals: RitualDefinition[];
    nextHuntModifiers: {
        scentGainMultiplier: number;
        lootQualityMultiplier: number;
        maxHpMultiplier: number;
        speedMultiplier: number;
        armorBonus: number;
    };
    // Actions
    gainXp: (skill: SkillName, amount: number) => void;
    equipItem: (itemId: string) => void;
    unequipItem: (slot: keyof PlayerEquipment) => void;
    consumeFoodItem: (itemId: string) => void;
    setActiveStyle: (style: CombatStyle) => void;
    setTrainingMode: (mode: TrainingMode) => void;
    addFood: (food: InventoryItem) => void;
    consumeFood: (itemId: string) => void;
    addInventoryItem: (item: InventoryItem) => void;
    updateInventoryItem: (itemId: string, quantity: number, template?: InventoryItem) => void;
    addLootLog: (item: { itemId: string, itemName: string }) => void;
    claimLoot: (itemId: string) => void;
    claimAllLoot: () => void;
    clearLootHistory: () => void;
    toggleAutoLoot: () => void;
    unlockUpgrade: (upgradeId: UpgradeId) => void;
    toggleAutoEat: () => void;
    setAutoEatThreshold: (threshold: number) => void;
    setVitae: (amount: number) => void;
    // Phase 2A Actions
    addUnbankedLoot: (shards: number, steel: number, ichor: number, isRedMist?: boolean) => void;
    withdraw: () => void;
    applyDeathPenalties: (isBraced: boolean, isRedMist?: boolean) => void;
    setFinesseTicks: (ticks: number) => void;
    // Resource Helpers
    getResourceQuantity: (id: string) => number;
    consumeResource: (id: string, quantity: number) => void;
    // Crucible Actions
    tierShift: (slot: keyof PlayerEquipment, path: 'sanguine' | 'vile') => void;
    refineGear: (slot: keyof PlayerEquipment) => void;
    resetCrucibleSeal: () => void;
    // Phase 4 Actions
    addRitual: (ritual: RitualDefinition) => void;
    removeRitual: (id: string) => void;
    clearRituals: () => void;
    computeNextHuntModifiers: () => void;
    resetPlayer: () => void;
    // Shop Actions
    buyItem: (itemId: string, price: number, currency?: 'bloodShards' | 'stabilizedIchor' | 'graveSteel') => boolean;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            skills: DEFAULT_SKILLS,
            equipment: {},
            activeStyle: 'melee',
            trainingMode: 'attack',
            food: STARTER_FOOD,
            inventory: [],
            lootHistory: [],
            autoLootEnabled: false,
            autoEatThreshold: 0.5,
            autoEatEnabled: false,
            currentVitae: 10,
            unlockedUpgrades: [],
            bloodShards: 0,
            graveSteel: 0,
            cursedIchor: 0,
            stabilizedIchor: 0,
            unbankedShards: 0,
            unbankedIchor: 0,
            unbankedSteel: 0,
            isBraced: false,
            finesseTicksRemaining: 0,
            permanentArmorBonus: 0,
            redMistIchorDrops: 0,
            redMistDeaths: 0,
            crucibleSealed: false,
            activeRituals: [],
            nextHuntModifiers: {
                scentGainMultiplier: 1,
                lootQualityMultiplier: 1,
                maxHpMultiplier: 1,
                speedMultiplier: 1,
                armorBonus: 0
            },

            gainXp: (skill: SkillName, amount: number) => {
                set((state) => {
                    const current = state.skills[skill] || { xp: 0, level: 1 };
                    const newXp = Math.min(current.xp + amount, 500_000_000);
                    const newLevel = getLevelFromXp(newXp);
                    return {
                        skills: {
                            ...state.skills,
                            [skill]: { xp: newXp, level: newLevel },
                        },
                    };
                });
            },

            equipItem: (itemId: string) => {
                set((state) => {
                    const itemInInv = state.inventory.find(i => i.id === itemId);
                    if (!itemInInv) return state;

                    const itemTemplate = InventoryManager.resolveItem(itemId, ITEM_DATABASE);
                    if (!itemTemplate || !('slot' in itemTemplate)) return state;

                    const slot = itemTemplate.slot;
                    const currentEquipped = state.equipment[slot] as EquipmentItem | undefined;

                    let nextInventory = InventoryManager.removeItem(state.inventory, itemId, 1);

                    if (currentEquipped) {
                        nextInventory = InventoryManager.addItem(nextInventory, currentEquipped, 1);
                    }

                    return {
                        inventory: nextInventory,
                        equipment: { ...state.equipment, [slot]: itemTemplate }
                    };
                });
            },

            unequipItem: (slot: keyof PlayerEquipment) => {
                set((state) => {
                    const item = state.equipment[slot];
                    if (!item) return state;

                    const nextEquipment = { ...state.equipment };
                    delete nextEquipment[slot];

                    return {
                        equipment: nextEquipment,
                        inventory: InventoryManager.addItem(state.inventory, item, 1)
                    };
                });
            },

            consumeFoodItem: (itemId: string) => {
                set((state) => {
                    const foodItem = state.inventory.find(i => i.id === itemId && i.type === 'food');
                    if (!foodItem) return state;

                    const healAmount = foodItem.healAmount || 0;
                    const maxHp = state.skills.vitae.level;
                    const newVitae = Math.min(state.currentVitae + healAmount, maxHp);

                    return {
                        currentVitae: newVitae,
                        inventory: state.inventory.map(i => 
                            i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
                        ).filter(i => i.quantity > 0)
                    };
                });
            },

            setActiveStyle: (style: CombatStyle) => set({ activeStyle: style }),

            setTrainingMode: (mode: TrainingMode) => set({ trainingMode: mode }),

            addFood: (foodItem: InventoryItem) => {
                if (foodItem.type !== 'food') {
                    console.warn(`Attempted to add non-food item to food inventory: ${foodItem.id}`);
                    return;
                }
                set((state) => ({
                    food: InventoryManager.addItem(state.food, foodItem, foodItem.quantity)
                        .filter(f => f.type === 'food') // Sanity check
                }));
            },

            consumeFood: (itemId: string) => {
                set((state) => ({
                    food: state.food
                        .map(f => f.id === itemId ? { ...f, quantity: f.quantity - 1 } : f)
                        .filter(f => f.quantity > 0),
                }));
            },

            addInventoryItem: (item: InventoryItem) => {
                const itemTemplate = InventoryManager.resolveItem(item.id, ITEM_DATABASE);
                const template = itemTemplate || item; // Fallback to provided item if not in database
                
                set((state) => ({
                    inventory: InventoryManager.addItem(state.inventory, template, item.quantity)
                }));
            },

            updateInventoryItem: (itemId: string, quantity: number, template?: InventoryItem) => {
                set((state) => {
                    const existing = state.inventory.find(i => i.id === itemId);
                    if (existing) {
                        return {
                            inventory: state.inventory.map(i =>
                                i.id === itemId ? { ...i, quantity } : i
                            ).filter(i => i.quantity > 0),
                        };
                    } else if (template && quantity > 0) {
                        return { inventory: [...state.inventory, { ...template, quantity }] };
                    }
                    return state;
                });
            },

            addLootLog: (item) => {
                const { autoLootEnabled } = get();
                
                const itemTemplate = InventoryManager.resolveItem(item.itemId, ITEM_DATABASE);
                // Fail-safe: If not in database, we should still allow it but it's a bug if it's missing
                const template = itemTemplate || { id: item.itemId, name: item.itemName, type: 'misc' as const, quantity: 1 };

                if (autoLootEnabled) {
                    set((state) => ({
                        inventory: InventoryManager.addItem(state.inventory, template, 1)
                    }));
                    return;
                }

                set((state) => {
                    const existing = state.lootHistory.find(l => l.id === item.itemId);
                    if (existing) {
                        return {
                            lootHistory: state.lootHistory.map(l =>
                                l.id === item.itemId ? { ...l, quantity: l.quantity + 1 } : l
                            ),
                        };
                    }
                    return {
                        lootHistory: [
                            {
                                id: item.itemId,
                                name: item.itemName,
                                quantity: 1,
                                firstLooted: Date.now(),
                            },
                            ...state.lootHistory,
                        ],
                    };
                });
            },

            claimLoot: (itemId: string) => {
                const { lootHistory } = get();
                const item = lootHistory.find(l => l.id === itemId);
                if (!item) return;

                const itemTemplate = InventoryManager.resolveItem(item.id, ITEM_DATABASE);
                // Fallback for non-equipment items
                const template = itemTemplate || { id: item.id, name: item.name, type: 'misc' as const, quantity: item.quantity };

                set((state) => ({
                    inventory: InventoryManager.addItem(state.inventory, template, item.quantity),
                    lootHistory: state.lootHistory.filter(l => l.id !== itemId)
                }));
            },

            claimAllLoot: () => {
                const { lootHistory, withdraw } = get();
                
                set((state) => {
                    let nextInventory = [...state.inventory];
                    lootHistory.forEach(item => {
                        const itemTemplate = InventoryManager.resolveItem(item.id, ITEM_DATABASE);
                        const template = itemTemplate || { id: item.id, name: item.name, type: 'misc' as const, quantity: item.quantity };
                        nextInventory = InventoryManager.addItem(nextInventory, template, item.quantity);
                    });
                    
                    return { 
                        inventory: nextInventory,
                        lootHistory: []
                    };
                });
                withdraw(); 
            },

            clearLootHistory: () => set({ lootHistory: [] }),

            toggleAutoLoot: () => {
                const isUnlocked = get().unlockedUpgrades.includes('auto_loot');
                if (!isUnlocked) return set({ autoLootEnabled: false });

                const nextState = !get().autoLootEnabled;
                set({ autoLootEnabled: nextState });

                // If toggled ON, immediately bank current unbanked loot
                if (nextState) {
                    get().withdraw();
                }
            },

            unlockUpgrade: (upgradeId: UpgradeId) => set((state) => {
                const alreadyUnlocked = state.unlockedUpgrades.includes(upgradeId);
                const nextUpgrades = alreadyUnlocked ? state.unlockedUpgrades : [...state.unlockedUpgrades, upgradeId];
                
                // If unlocking auto_eat, also enable it for convenience
                const autoEatEnabled = upgradeId === 'auto_eat' ? true : state.autoEatEnabled;
                
                return { 
                    unlockedUpgrades: nextUpgrades,
                    autoEatEnabled
                };
            }),

            toggleAutoEat: () => set((state) => {
                const isUnlocked = state.unlockedUpgrades.includes('auto_eat');
                if (!isUnlocked) return { autoEatEnabled: false };
                return { autoEatEnabled: !state.autoEatEnabled };
            }),

            setAutoEatThreshold: (threshold: number) => set({ autoEatThreshold: threshold }),
            
            setVitae: (amount: number) => set({ currentVitae: amount }),

            // Phase 2A Implementation
            addUnbankedLoot: (shards, steel, ichor, isRedMist) => set((state) => {
                const SHARD_CAP = 5000;
                const currentTotal = state.bloodShards + state.unbankedShards;
                const allowedShards = Math.max(0, SHARD_CAP - currentTotal);
                const finalShards = Math.min(shards, allowedShards);
                
                if (state.autoLootEnabled) {
                    return {
                        bloodShards: state.bloodShards + state.unbankedShards + finalShards,
                        graveSteel: state.graveSteel + state.unbankedSteel + steel,
                        cursedIchor: state.cursedIchor + state.unbankedIchor + ichor,
                        unbankedShards: 0,
                        unbankedSteel: 0,
                        unbankedIchor: 0,
                        redMistIchorDrops: isRedMist ? state.redMistIchorDrops + ichor : state.redMistIchorDrops
                    };
                }

                return {
                    unbankedShards: state.unbankedShards + finalShards,
                    unbankedSteel: state.unbankedSteel + steel,
                    unbankedIchor: state.unbankedIchor + ichor,
                    redMistIchorDrops: isRedMist ? state.redMistIchorDrops + ichor : state.redMistIchorDrops
                };
            }),

            withdraw: () => set((state) => ({
                bloodShards: state.bloodShards + state.unbankedShards,
                graveSteel: state.graveSteel + state.unbankedSteel,
                cursedIchor: state.cursedIchor + state.unbankedIchor,
                unbankedShards: 0,
                unbankedSteel: 0,
                unbankedIchor: 0
            })),

            applyDeathPenalties: (isBraced, isRedMist) => set((state) => {
                const shardLoss = isBraced ? 0.25 : 0.50; // Per spec: 25% if braced, else 50%
                const ichorLoss = isBraced ? 0.50 : 1.00; // Per spec: 50% if braced, else 100%
                
                return {
                    bloodShards: state.bloodShards + Math.floor(state.unbankedShards * (1 - shardLoss)),
                    cursedIchor: state.cursedIchor + Math.floor(state.unbankedIchor * (1 - ichorLoss)),
                    graveSteel: state.graveSteel + state.unbankedSteel, // Steel is always persistent
                    unbankedShards: 0,
                    unbankedSteel: 0,
                    unbankedIchor: 0,
                    isBraced: false, // Consumed on death
                    redMistDeaths: isRedMist ? state.redMistDeaths + 1 : state.redMistDeaths
                };
            }),

            setFinesseTicks: (ticks) => set({ finesseTicksRemaining: ticks }),

            getResourceQuantity: (id: string) => {
                const state = get();
                if (id === 'blood_shard') return state.bloodShards;
                if (id === 'cursed_ichor') return state.cursedIchor;
                if (id === 'grave_steel') return state.graveSteel;
                if (id === 'stabilized_ichor') return state.stabilizedIchor;
                const invItem = state.inventory.find(i => i.id === id);
                return invItem?.quantity || 0;
            },

            consumeResource: (id: string, quantity: number) => {
                set((state) => {
                    if (id === 'blood_shard') return { bloodShards: state.bloodShards - quantity };
                    if (id === 'cursed_ichor') return { cursedIchor: state.cursedIchor - quantity };
                    if (id === 'grave_steel') return { graveSteel: state.graveSteel - quantity };
                    if (id === 'stabilized_ichor') return { stabilizedIchor: state.stabilizedIchor - quantity };
                    
                    const newInv = state.inventory.map(item => 
                        item.id === id ? { ...item, quantity: item.quantity - quantity } : item
                    ).filter(item => item.quantity > 0);
                    
                    return { inventory: newInv };
                });
            },

            tierShift: (slot, path) => set((state) => {
                if (state.crucibleSealed) return state;
                const item = state.equipment[slot];
                if (!item) return state;

                // 1. Check Eligibility (Refinement 5, not terminal tier)
                if (!isEligibleForTierShift(item)) return state;

                // 2. Resource Check
                const cost = getTierShiftCost(item.tier);
                
                const hasShards = state.bloodShards >= cost.shards;
                const hasIchor = state.stabilizedIchor >= cost.stabilizedIchor;
                const hasComponents = cost.components.every(comp => {
                    const invItem = state.inventory.find(i => i.id === comp.id);
                    return invItem && invItem.quantity >= comp.quantity;
                });

                if (!hasShards || !hasIchor || !hasComponents) {
                    console.warn("Missing materials for Tier Shift", cost);
                    return state;
                }

                // 3. Execution (Pulling base stats for next tier)
                const nextTierItem = resolveNextTierItem(item, ITEM_DATABASE.filter(i => 'slot' in i) as EquipmentItem[]);
                if (!nextTierItem) return state;

                const newItem: EquipmentItem = {
                    ...nextTierItem,
                    refinement: 0,
                    specPath: path || item.specPath // Preserve if already set
                };

                // 4. Final Validation
                if (!validateShiftResult(item, newItem)) return state;

                // Consume components
                let nextInventory = [...state.inventory];
                cost.components.forEach(comp => {
                    nextInventory = nextInventory.map(invItem => 
                        invItem.id === comp.id ? { ...invItem, quantity: invItem.quantity - comp.quantity } : invItem
                    ).filter(i => i.quantity > 0);
                });

                return {
                    bloodShards: state.bloodShards - cost.shards,
                    stabilizedIchor: state.stabilizedIchor - cost.stabilizedIchor,
                    inventory: nextInventory,
                    equipment: { ...state.equipment, [slot]: newItem },
                    crucibleSealed: true
                };
            }),

            refineGear: (slot) => set((state) => {
                if (state.crucibleSealed) return state;
                const item = state.equipment[slot];
                if (!item) return state;
                
                const currentRefinement = item.refinement || 0;
                if (currentRefinement >= 5) return state;

                // Simple scaling cost for refinement (example: 25 shards + 5 steel per level)
                const shardCost = 25 * (currentRefinement + 1);
                const steelCost = 5 * (currentRefinement + 1);

                if (state.bloodShards >= shardCost && state.graveSteel >= steelCost) {
                    const newItem = { ...item, refinement: currentRefinement + 1 };
                    return {
                        bloodShards: state.bloodShards - shardCost,
                        graveSteel: state.graveSteel - steelCost,
                        equipment: { ...state.equipment, [slot]: newItem },
                        crucibleSealed: true
                    };
                }
                return state;
            }),

            resetCrucibleSeal: () => set({ crucibleSealed: false }),

            // Phase 4 Implementation
            addRitual: (ritual) => {
                set((state) => {
                    const alreadyHas = state.activeRituals.find(r => r.id === ritual.id);
                    if (alreadyHas) return state;
                    return { activeRituals: [...state.activeRituals, ritual] };
                });
                get().computeNextHuntModifiers();
            },

            removeRitual: (id) => {
                set((state) => ({
                    activeRituals: state.activeRituals.filter(r => r.id !== id)
                }));
                get().computeNextHuntModifiers();
            },

            clearRituals: () => {
                set({ activeRituals: [] });
                get().computeNextHuntModifiers();
            },

            computeNextHuntModifiers: () => {
                set((state) => {
                    const mods = {
                        scentGainMultiplier: 1,
                        lootQualityMultiplier: 1,
                        maxHpMultiplier: 1,
                        speedMultiplier: 1,
                        armorBonus: 0
                    };

                    state.activeRituals.forEach(r => {
                        mods.scentGainMultiplier *= (r.modifiers.scentGainMultiplier ?? 1);
                        mods.lootQualityMultiplier *= (r.modifiers.lootQualityMultiplier ?? 1);
                        mods.maxHpMultiplier *= (r.modifiers.maxHpMultiplier ?? 1);
                        mods.speedMultiplier *= (r.modifiers.speedMultiplier ?? 1);
                        mods.armorBonus += (r.modifiers.armorBonus ?? 0);
                    });

                    return { nextHuntModifiers: mods };
                });
            },

            resetPlayer: () => {
                const fang = InventoryManager.resolveItem('rusted_fang', ITEM_DATABASE);
                const initialInv = fang ? [InventoryManager.createItem(fang, 1)] : [];
                
                set({ 
                    skills: DEFAULT_SKILLS, 
                    equipment: {}, 
                    food: STARTER_FOOD, 
                    inventory: initialInv,
                    lootHistory: [],
                    autoLootEnabled: false,
                    autoEatThreshold: 0.5,
                    autoEatEnabled: false,
                    unlockedUpgrades: [],
                    bloodShards: 100, // Give some starting shards
                    graveSteel: 0,
                    cursedIchor: 0,
                    stabilizedIchor: 0,
                    unbankedShards: 0,
                    unbankedSteel: 0,
                    unbankedIchor: 0,
                    isBraced: false,
                    finesseTicksRemaining: 0,
                    permanentArmorBonus: 0,
                    redMistIchorDrops: 0,
                    redMistDeaths: 0,
                    crucibleSealed: false,
                    activeRituals: [],
                    nextHuntModifiers: {
                        scentGainMultiplier: 1,
                        lootQualityMultiplier: 1,
                        maxHpMultiplier: 1,
                        speedMultiplier: 1,
                        armorBonus: 0
                    }
                });
            },

            buyItem: (itemId, price, currency = 'bloodShards') => {
                const itemTemplate = InventoryManager.resolveItem(itemId, ITEM_DATABASE);
                if (!itemTemplate) return false;

                const state = get();
                // @ts-ignore - dynamic key access
                const currentBalance = state[currency];
                
                if (currentBalance >= price) {
                    set((s) => ({
                        // @ts-ignore
                        [currency]: s[currency] - price,
                        inventory: InventoryManager.addItem(s.inventory, itemTemplate, 1)
                    }));
                    return true;
                }
                return false;
            },

        }),
        {
            name: 'crimson-engine-player',
            version: 8,
            migrate: (persistedState: any, version: number) => {
                if (version < 4) {
                    if (!persistedState.food || persistedState.food.length === 0) {
                        persistedState.food = STARTER_FOOD;
                    }
                    persistedState.autoEatThreshold = 0.5;
                    persistedState.autoEatEnabled = false;
                }
                if (version < 5) {
                    persistedState.activeRituals = [];
                    persistedState.nextHuntModifiers = {
                        scentGainMultiplier: 1,
                        lootQualityMultiplier: 1,
                        maxHpMultiplier: 1,
                        speedMultiplier: 1,
                        armorBonus: 0
                    };
                }
                if (version < 6) {
                    const skills = persistedState.skills || {};
                    const newSkills = [
                        'nightForaging', 'graveHarvesting', 'forging', 
                        'corpseHarvesting', 'alchemy'
                    ];
                    newSkills.forEach((s: string) => {
                        if (!skills[s]) skills[s] = { level: 1, xp: 0 };
                    });
                    persistedState.skills = skills;
                }
                if (version < 8) {
                    // Initialize all missing skill keys to prevent runtime crashes
                    const skills = persistedState.skills || {};
                    const allSkillKeys = [
                        'fangMastery', 'predatorForce', 'obsidianWard', 'shadowArchery', 'bloodSorcery', 'vitae',
                        'bloodletting', 'graveHarvesting', 'nightForaging', 'butchery', 'relicScavenging',
                        'distillation', 'forging', 'corpseHarvesting', 'alchemy', 'runecraft'
                    ];
                    allSkillKeys.forEach((s: string) => {
                        if (!skills[s]) skills[s] = { level: 1, xp: 0 };
                    });
                    persistedState.skills = skills;
                }
                return persistedState;
            }
        }

    )
);
