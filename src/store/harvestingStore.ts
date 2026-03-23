// =============================================================================
// CRIMSON ENGINE — Harvesting Store (Zustand)
// Manages: Global timer for Bloodletting and Distillation out-of-combat.
// =============================================================================

import { create } from 'zustand';
import { usePlayerStore } from './playerStore';
import { useCombatStore } from './combatStore';
import { HARVESTING_NODES } from '../data/harvesting';

type HarvestingActionType = 'harvesting' | 'distilling';

interface HarvestingState {
    activeNodeId: string | null;
    actionType: HarvestingActionType | null;
    progressTimer: number; // Ticks
    requiredTicks: number; // Target for perfection
    isActive: boolean;
    intervalId: ReturnType<typeof setInterval> | null;

    // Actions
    startAction: (nodeId: string, type: HarvestingActionType) => void;
    stopAction: () => void;
    tick: () => void;
}

const TICK_MS = 100;

export const useHarvestingStore = create<HarvestingState>((set, get) => ({
    activeNodeId: null,
    actionType: null,
    progressTimer: 0,
    requiredTicks: 0,
    isActive: false,
    intervalId: null,

    startAction: (nodeId: string, type: HarvestingActionType) => {
        // Prevent running if in combat (Global Lock)
        if (useCombatStore.getState().isRunning) {
            console.warn("Cannot start harvesting while combat is running.");
            return;
        }

        const node = HARVESTING_NODES[nodeId];
        if (!node) return;

        // Prevent running if player lacks the skill
        const playerSkills = usePlayerStore.getState().skills;
        const skillLvl = type === 'harvesting' 
            ? (playerSkills.bloodletting?.level || 1) 
            : (playerSkills.distillation?.level || 1);
        
        if (skillLvl < node.levelReq) {
            console.warn(`Need level ${node.levelReq} to process ${node.name}`);
            return;
        }

        // Make sure previous action stops
        get().stopAction();

        const msReq = type === 'harvesting' ? node.baseHarvestTimeMs : node.baseDistillTimeMs;

        set({
            activeNodeId: nodeId,
            actionType: type,
            progressTimer: 0,
            requiredTicks: msReq / TICK_MS,
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
            actionType: null,
            progressTimer: 0,
            requiredTicks: 0,
        });
    },

    tick: () => {
        const { activeNodeId, actionType, progressTimer, requiredTicks, isActive } = get();
        
        // Safety lock, if combat maliciously started
        if (useCombatStore.getState().isRunning) {
            get().stopAction();
            return;
        }

        if (!isActive || !activeNodeId || !actionType) return;

        const nextTimer = progressTimer + 1;

        if (nextTimer >= requiredTicks) {
            // FIRE EVENT
            const node = HARVESTING_NODES[activeNodeId];
            const pStore = usePlayerStore.getState();

            // 1. Give XP
            const xpAward = actionType === 'harvesting' ? node.harvestXp : node.distillXp;
            const skillName = actionType === 'harvesting' ? 'bloodletting' : 'distillation';
            
            pStore.gainXp(skillName, xpAward);
            
            // 2. Resolve Items
            const rawInv = pStore.inventory.find(i => i.id === node.rawItem.id);
            const foodInv = pStore.food.find(f => f.id === node.distillItem.id);

            if (actionType === 'harvesting') {
                // Add Raw Blood to Inventory
                const qty = rawInv ? rawInv.quantity + 1 : 1;
                pStore.updateInventoryItem(node.rawItem.id, qty, node.rawItem);
            } else if (actionType === 'distilling') {
                // Consume 1 Raw Blood to make 1 Vial
                if (!rawInv || rawInv.quantity < 1) {
                    get().stopAction();
                    return; // Out of materials
                }

                // Remove material
                pStore.updateInventoryItem(node.rawItem.id, rawInv.quantity - 1, node.rawItem);
                
                // Add Vial
                const vQty = foodInv ? foodInv.quantity + 1 : 1;
                // Distilled items go straight to food
                const newFoodList = [...pStore.food];
                const existingIndex = newFoodList.findIndex(f => f.id === node.distillItem.id);
                if (existingIndex !== -1) {
                    newFoodList[existingIndex].quantity = vQty;
                } else {
                    newFoodList.push({ ...node.distillItem, quantity: 1 });
                }
                
                // Hacky forced overwrite of pStore array
                usePlayerStore.setState({ food: newFoodList });
            }

            // Loop back to 0
            set({ progressTimer: 0 });
        } else {
            // Tick up
            set({ progressTimer: nextTimer });
        }
    }
}));
