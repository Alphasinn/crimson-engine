// =============================================================================
// CRIMSON ENGINE — Player Store (Zustand)
// Manages: skills, equipment, active combat style, food inventory
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerSkills, PlayerEquipment, EquipmentItem, CombatStyle, InventoryItem, SkillName, TrainingMode, LootHistoryItem, UpgradeId } from '../engine/types';
import { getLevelFromXp, getXpForLevel } from '../engine/xpTable';
import {
    STARTING_VITAE_LEVEL,
} from '../engine/constants';

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
    // Actions
    gainXp: (skill: SkillName, amount: number) => void;
    equipItem: (item: EquipmentItem) => void;
    unequipItem: (slot: keyof PlayerEquipment) => void;
    setActiveStyle: (style: CombatStyle) => void;
    setTrainingMode: (mode: TrainingMode) => void;
    addFood: (food: InventoryItem) => void;
    consumeFood: (itemId: string) => void;
    addInventoryItem: (item: InventoryItem) => void;
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
    siphon: (maxHp: number, cost: number) => boolean; // Returns true if successful
    stabilizeIchor: () => void;
    setFinesseTicks: (ticks: number) => void;
    // Distill Actions
    sanguineFinesse: () => void;
    vileReinforcement: () => void;
    tierShift: () => void;
    resetPlayer: () => void;
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

            gainXp: (skill: SkillName, amount: number) => {
                set((state) => {
                    const current = state.skills[skill];
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

            equipItem: (item: EquipmentItem) => {
                set((state) => ({
                    equipment: { ...state.equipment, [item.slot]: item },
                }));
            },

            unequipItem: (slot: keyof PlayerEquipment) => {
                set((state) => {
                    const next = { ...state.equipment };
                    delete next[slot];
                    return { equipment: next };
                });
            },

            setActiveStyle: (style: CombatStyle) => set({ activeStyle: style }),

            setTrainingMode: (mode: TrainingMode) => set({ trainingMode: mode }),

            addFood: (food: InventoryItem) => {
                set((state) => {
                    const existing = state.food.find(f => f.id === food.id);
                    if (existing) {
                        return {
                            food: state.food.map(f =>
                                f.id === food.id ? { ...f, quantity: f.quantity + food.quantity } : f
                            ),
                        };
                    }
                    return { food: [...state.food, food] };
                });
            },

            consumeFood: (itemId: string) => {
                set((state) => ({
                    food: state.food
                        .map(f => f.id === itemId ? { ...f, quantity: f.quantity - 1 } : f)
                        .filter(f => f.quantity > 0),
                }));
            },

            addInventoryItem: (item: InventoryItem) => {
                set((state) => {
                    const existing = state.inventory.find(i => i.id === item.id);
                    if (existing) {
                        return {
                            inventory: state.inventory.map(i =>
                                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                            ),
                        };
                    }
                    return { inventory: [...state.inventory, item] };
                });
            },

            addLootLog: (item) => {
                const { autoLootEnabled, addInventoryItem } = get();
                
                if (autoLootEnabled) {
                    addInventoryItem({
                        id: item.itemId,
                        name: item.itemName,
                        quantity: 1,
                        type: 'misc' // Default for general loot
                    });
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
                const { lootHistory, addInventoryItem } = get();
                const item = lootHistory.find(l => l.id === itemId);
                if (!item) return;

                addInventoryItem({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    type: 'misc'
                });

                set((state) => ({
                    lootHistory: state.lootHistory.filter(l => l.id !== itemId)
                }));
            },

            claimAllLoot: () => {
                const { lootHistory, addInventoryItem } = get();
                lootHistory.forEach(item => {
                    addInventoryItem({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        type: 'misc'
                    });
                });
                set({ lootHistory: [] });
            },

            clearLootHistory: () => set({ lootHistory: [] }),

            toggleAutoLoot: () => set((state) => {
                const isUnlocked = state.unlockedUpgrades.includes('auto_loot');
                if (!isUnlocked) return { autoLootEnabled: false };
                return { autoLootEnabled: !state.autoLootEnabled };
            }),

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

            siphon: (maxHp, cost) => {
                const { bloodShards, unbankedShards, currentVitae, setVitae } = get();
                // For simplicity, siphoning in prototype uses banked shards first, then unbanked
                const totalShards = bloodShards + unbankedShards;
                
                if (totalShards < cost) return false;
                
                if (bloodShards >= cost) {
                    set({ bloodShards: bloodShards - cost });
                } else {
                    set({ 
                        bloodShards: 0, 
                        unbankedShards: unbankedShards - (cost - bloodShards) 
                    });
                }
                
                const healAmount = Math.floor(maxHp * 0.20);
                setVitae(Math.min(maxHp, currentVitae + healAmount));
                return true;
            },

            setFinesseTicks: (ticks) => set({ finesseTicksRemaining: ticks }),

            stabilizeIchor: () => set((state) => {
                if (state.bloodShards >= 125 && state.cursedIchor >= 1) {
                    return {
                        bloodShards: state.bloodShards - 125,
                        cursedIchor: state.cursedIchor - 1,
                        stabilizedIchor: state.stabilizedIchor + 1
                    };
                }
                return state;
            }),

            sanguineFinesse: () => set((state) => {
                if (state.bloodShards >= 15) {
                    return { 
                        bloodShards: state.bloodShards - 15,
                        finesseTicksRemaining: 200 // 200 Player attack ticks per spec
                    };
                }
                return state;
            }),

            vileReinforcement: () => set((state) => {
                if (state.bloodShards >= 30 && state.graveSteel >= 10) {
                    return { 
                        bloodShards: state.bloodShards - 30,
                        graveSteel: state.graveSteel - 10,
                        permanentArmorBonus: state.permanentArmorBonus + 5,
                        isBraced: true
                    };
                }
                return state;
            }),

            tierShift: () => set((state) => {
                if (state.bloodShards >= 200 && state.stabilizedIchor >= 3 && state.graveSteel >= 25) {
                    return {
                        bloodShards: state.bloodShards - 200,
                        stabilizedIchor: state.stabilizedIchor - 3,
                        graveSteel: state.graveSteel - 25
                    };
                }
                return state;
            }),

            resetPlayer: () => set({ 
                skills: DEFAULT_SKILLS, 
                equipment: {}, 
                food: [], 
                inventory: [],
                lootHistory: [],
                autoLootEnabled: false,
                autoEatThreshold: 0.5,
                autoEatEnabled: false,
                unlockedUpgrades: [],
                bloodShards: 0,
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
                redMistDeaths: 0
            }),
        }),
        {
            name: 'crimson-engine-player',
            version: 4,
            migrate: (persistedState: any, version: number) => {
                if (version < 4) {
                    // Ensure player has starter food if they have none
                    if (!persistedState.food || persistedState.food.length === 0) {
                        persistedState.food = STARTER_FOOD;
                    }
                    persistedState.autoEatThreshold = 0.5;
                    persistedState.autoEatEnabled = false;
                }
                return persistedState;
            }
        }

    )
);
