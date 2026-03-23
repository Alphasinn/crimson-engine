// =============================================================================
// CRIMSON ENGINE — Player Store (Zustand)
// Manages: skills, equipment, active combat style, food inventory
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCombatStore } from './combatStore';
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
import WEAPONS from '../data/weapons';
import ARMOR from '../data/armor';

const ITEM_DATABASE = [...WEAPONS, ...ARMOR];

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
    distillation: { level: 1, xp: 0 },
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
        lifestealBonus: number;
        speedMultiplier: number;
        armorBonus: number;
    };
    // Actions
    gainXp: (skill: SkillName, amount: number) => void;
    equipItem: (item: EquipmentItem) => void;
    unequipItem: (slot: keyof PlayerEquipment) => void;
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
    siphon: (maxHp: number, cost: number) => boolean; // Returns true if successful
    stabilizeIchor: () => void;
    setFinesseTicks: (ticks: number) => void;
    // Distill Actions
    sanguineFinesse: () => void;
    vileReinforcement: () => void;
    tierShift: (slot: keyof PlayerEquipment, path: 'sanguine' | 'vile') => void;
    // Phase 2B Crucible
    refineGear: (slot: keyof PlayerEquipment) => void;
    resetCrucibleSeal: () => void;
    // Phase 4 Actions
    addRitual: (ritual: RitualDefinition) => void;
    removeRitual: (id: string) => void;
    clearRituals: () => void;
    computeNextHuntModifiers: () => void;
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
            crucibleSealed: false,
            activeRituals: [],
            nextHuntModifiers: {
                scentGainMultiplier: 1,
                lootQualityMultiplier: 1,
                maxHpMultiplier: 1,
                lifestealBonus: 0,
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
                const { lootHistory, addInventoryItem, withdraw } = get();
                lootHistory.forEach(item => {
                    addInventoryItem({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        type: 'misc'
                    });
                });
                set({ lootHistory: [] });
                withdraw(); // Unify currency banking with loot claiming
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
                if (state.crucibleSealed) return state;
                if (state.bloodShards >= 125 && state.cursedIchor >= 1) {
                    const lastSession = useCombatStore.getState().lastSession;
                    const lastRisk = (lastSession && !lastSession.wasSlain) ? (lastSession.lastScentIntensity ?? 0) : 0;
                    const yieldMult = 1 + lastRisk;
                    
                    return {
                        bloodShards: state.bloodShards - 125,
                        cursedIchor: state.cursedIchor - 1,
                        stabilizedIchor: state.stabilizedIchor + yieldMult,
                        crucibleSealed: true
                    };
                }
                return state;
            }),

            sanguineFinesse: () => set((state) => {
                if (state.crucibleSealed) return state;
                if (state.bloodShards >= 15) {
                    return { 
                        bloodShards: state.bloodShards - 15,
                        finesseTicksRemaining: 200,
                        crucibleSealed: true
                    };
                }
                return state;
            }),

            vileReinforcement: () => set((state) => {
                if (state.crucibleSealed) return state;
                if (state.bloodShards >= 30 && state.graveSteel >= 10) {
                    return { 
                        bloodShards: state.bloodShards - 30,
                        graveSteel: state.graveSteel - 10,
                        permanentArmorBonus: state.permanentArmorBonus + 5,
                        isBraced: true,
                        crucibleSealed: true
                    };
                }
                return state;
            }),

            tierShift: (slot, path) => set((state) => {
                if (state.crucibleSealed) return state;
                const item = state.equipment[slot];
                if (!item) return state;

                // 1. Check Eligibility (Refinement 5, not terminal tier)
                if (!isEligibleForTierShift(item)) return state;

                // 2. Resource Check
                const cost = getTierShiftCost(item.tier);
                if (
                    state.bloodShards < cost.shards || 
                    state.stabilizedIchor < cost.stabilizedIchor || 
                    state.graveSteel < cost.steel
                ) {
                    return state;
                }

                // 3. Execution (Pulling base stats for next tier)
                const nextTierItem = resolveNextTierItem(item, ITEM_DATABASE);
                if (!nextTierItem) return state;

                const newItem: EquipmentItem = {
                    ...nextTierItem,
                    refinement: 0,
                    specPath: path || item.specPath // Preserve if already set
                };

                // 4. Final Validation
                if (!validateShiftResult(item, newItem)) return state;

                return {
                    bloodShards: state.bloodShards - cost.shards,
                    stabilizedIchor: state.stabilizedIchor - cost.stabilizedIchor,
                    graveSteel: state.graveSteel - cost.steel,
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
                        lifestealBonus: 0,
                        speedMultiplier: 1,
                        armorBonus: 0
                    };

                    state.activeRituals.forEach(r => {
                        mods.scentGainMultiplier *= (r.modifiers.scentGainMultiplier ?? 1);
                        mods.lootQualityMultiplier *= (r.modifiers.lootQualityMultiplier ?? 1);
                        mods.maxHpMultiplier *= (r.modifiers.maxHpMultiplier ?? 1);
                        mods.lifestealBonus += (r.modifiers.lifestealBonus ?? 0);
                        mods.speedMultiplier *= (r.modifiers.speedMultiplier ?? 1);
                        mods.armorBonus += (r.modifiers.armorBonus ?? 0);
                    });

                    return { nextHuntModifiers: mods };
                });
            },

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
            version: 5,
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
                        lifestealBonus: 0,
                        speedMultiplier: 1,
                        armorBonus: 0
                    };
                }
                return persistedState;
            }
        }

    )
);
