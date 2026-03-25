// =============================================================================
// CRIMSON ENGINE — Skilling Store (Zustand)
// Manages: Global timer for all non-combat skills (Gathering, Refining, Processing).
// =============================================================================

import { create } from 'zustand';
import { usePlayerStore } from './playerStore';
import { useCombatStore } from './combatStore';
import { HARVESTING_NODES } from '../data/harvesting';
import { ALL_SKILLING_NODES } from '../data/skilling';
import type { SkillName } from '../engine/types';

interface SkillingState {
    activeNodeId: string | null;
    activeSkill: SkillName | null;
    progressTimer: number; // Ticks
    requiredTicks: number; 
    isActive: boolean;
    intervalId: ReturnType<typeof setInterval> | null;

    // Actions
    startAction: (nodeId: string, skill: SkillName) => void;
    stopAction: () => void;
    tick: () => void;
}

const TICK_MS = 100;

export const useSkillingStore = create<SkillingState>((set, get) => ({
    activeNodeId: null,
    activeSkill: null,
    progressTimer: 0,
    requiredTicks: 0,
    isActive: false,
    intervalId: null,

    startAction: (nodeId: string, skill: SkillName) => {
        // Prevent running if in combat (Global Lock)
        if (useCombatStore.getState().isRunning) {
            console.warn("Cannot start skilling while combat is running.");
            return;
        }

        // Look up node in both legacy and new data
        const node = ALL_SKILLING_NODES[nodeId] || HARVESTING_NODES[nodeId];
        if (!node) return;

        // Skill check
        const playerSkills = usePlayerStore.getState().skills;
        const skillLvl = playerSkills[skill]?.level || 1;
        
        if (skillLvl < node.levelReq) {
            console.warn(`Need level ${node.levelReq} to process ${node.name}`);
            return;
        }

        // Ingredient check (if refining)
        if ('ingredients' in node && node.ingredients) {
            const inventory = usePlayerStore.getState().inventory;
            const hasMaterials = node.ingredients.every(ing => {
                const invItem = inventory.find(i => i.id === ing.id);
                return invItem && invItem.quantity >= ing.quantity;
            });

            if (!hasMaterials) {
                console.warn("Insufficient materials to start action.");
                return;
            }
        }

        // Legacy compatibility for Bloodletting/Distillation
        const timeMs = 'timeMs' in node ? node.timeMs : (skill === 'bloodletting' ? (node as any).baseHarvestTimeMs : (node as any).baseDistillTimeMs);

        // Make sure previous action stops
        get().stopAction();

        set({
            activeNodeId: nodeId,
            activeSkill: skill,
            progressTimer: 0,
            requiredTicks: timeMs / TICK_MS,
            isActive: true,
            intervalId: setInterval(() => get().tick(), TICK_MS),
        });
    },

    stopAction: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        
        set({
            intervalId: null,
            isActive: false,
            activeNodeId: null,
            activeSkill: null,
            progressTimer: 0,
            requiredTicks: 0,
        });
    },

    tick: () => {
        const { activeNodeId, activeSkill, progressTimer, requiredTicks, isActive } = get();
        
        // Safety lock
        if (useCombatStore.getState().isRunning) {
            get().stopAction();
            return;
        }

        if (!isActive || !activeNodeId || !activeSkill) return;

        const nextTimer = progressTimer + 1;

        if (progressTimer >= requiredTicks) {
            const node = ALL_SKILLING_NODES[activeNodeId] || HARVESTING_NODES[activeNodeId];
            const pStore = usePlayerStore.getState();

            // 1. Resolve Ingredients (if any)
            if ('ingredients' in node && node.ingredients) {
                // Secondary check mid-tick
                const canConsume = node.ingredients.every(ing => {
                    const invItem = pStore.inventory.find(i => i.id === ing.id);
                    return invItem && invItem.quantity >= ing.quantity;
                });

                if (!canConsume) {
                    get().stopAction();
                    return;
                }

                // Consume
                node.ingredients.forEach(ing => {
                    const invItem = pStore.inventory.find(i => i.id === ing.id);
                    pStore.updateInventoryItem(ing.id, invItem!.quantity - ing.quantity);
                });
            } else if ('rawItem' in node && activeSkill === 'distillation') {
                // Legacy logic for Distillation
                const rawInv = pStore.inventory.find(i => i.id === (node as any).rawItem.id);
                if (!rawInv || rawInv.quantity < 1) {
                    get().stopAction();
                    return;
                }
                pStore.updateInventoryItem((node as any).rawItem.id, rawInv.quantity - 1);
            }

            // 2. Give XP
            const xpAward = 'xp' in node ? node.xp : (activeSkill === 'bloodletting' ? (node as any).harvestXp : (node as any).distillXp);
            pStore.gainXp(activeSkill, xpAward);
            
            // 3. Resolve Output
            if ('output' in node) {
                const out = node.output;
                if (out.type === 'food') {
                    pStore.addFood({ id: out.id, name: out.name, quantity: out.quantity, type: 'food', healAmount: out.healAmount });
                } else {
                    pStore.addInventoryItem({ id: out.id, name: out.name, quantity: out.quantity, type: out.type });
                }
            } else {
                // Legacy output
                const legacy = node as any;
                if (activeSkill === 'bloodletting') {
                    pStore.addInventoryItem({ ...legacy.rawItem, quantity: 1 });
                } else {
                    pStore.addFood({ ...legacy.distillItem, quantity: 1 });
                }
            }

            // Loop back to 0
            set({ progressTimer: 0 });
        } else {
            set({ progressTimer: nextTimer });
        }
    }
}));
