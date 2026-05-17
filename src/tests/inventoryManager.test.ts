// =============================================================================
// CRIMSON ENGINE — Inventory Manager Unit Tests (Vitest)
// =============================================================================

import { describe, it, expect } from 'vitest';
import { InventoryManager } from '../engine/inventoryManager';
import type { InventoryItem, EquipmentItem } from '../engine/types';

describe('InventoryManager', () => {
    const baseItem: InventoryItem = { id: 'blood_orange', name: 'Blood Orange', quantity: 1, type: 'food' };
    const equipTemplate: EquipmentItem = { 
        id: 'rusted_fang', 
        name: 'Rusted Fang', 
        slot: 'weapon', 
        tier: 'T1', 
        levelRequirement: 1, 
        refinement: 0 
    };

    describe('isStackable', () => {
        it('returns true for materials and food', () => {
            expect(InventoryManager.isStackable(baseItem)).toBe(true);
        });

        it('returns true for equipment', () => {
            expect(InventoryManager.isStackable(equipTemplate)).toBe(true);
        });
    });

    describe('createItem', () => {
        it('copies refinement and specPath', () => {
            const template: EquipmentItem = { ...equipTemplate, refinement: 3, specPath: 'sanguine' };
            const item = InventoryManager.createItem(template, 1);
            expect(item.refinement).toBe(3);
            expect(item.specPath).toBe('sanguine');
        });

        it('does not include undefined properties', () => {
            const item = InventoryManager.createItem(equipTemplate, 1);
            expect(item.refinement).toBe(0);
            expect(item.specPath).toBeUndefined();
        });
    });

    describe('addItem', () => {
        it('stacks identical items', () => {
            const inv: InventoryItem[] = [
                { id: 'rusted_fang', name: 'Rusted Fang', quantity: 1, type: 'equipment', refinement: 0 }
            ];
            const nextInv = InventoryManager.addItem(inv, equipTemplate, 1);
            expect(nextInv.length).toBe(1);
            expect(nextInv[0].quantity).toBe(2);
        });

        it('does not stack items with different refinement', () => {
            const inv: InventoryItem[] = [
                { id: 'rusted_fang', name: 'Rusted Fang', quantity: 1, type: 'equipment', refinement: 1 }
            ];
            const nextInv = InventoryManager.addItem(inv, equipTemplate, 1);
            expect(nextInv.length).toBe(2);
            expect(nextInv[0].quantity).toBe(1);
            expect(nextInv[1].quantity).toBe(1);
            expect(nextInv[1].refinement).toBe(0);
        });

        it('does not stack items with different specPath', () => {
            const inv: InventoryItem[] = [
                { id: 'rusted_fang', name: 'Rusted Fang', quantity: 1, type: 'equipment', refinement: 5, specPath: 'sanguine' }
            ];
            const template: EquipmentItem = { ...equipTemplate, refinement: 5, specPath: 'vile' };
            const nextInv = InventoryManager.addItem(inv, template, 1);
            expect(nextInv.length).toBe(2);
            expect(nextInv[0].specPath).toBe('sanguine');
            expect(nextInv[1].specPath).toBe('vile');
        });
    });

    describe('removeItem', () => {
        it('removes correct item with specific refinement', () => {
            const inv: InventoryItem[] = [
                { id: 'rusted_fang', name: 'Rusted Fang', quantity: 1, type: 'equipment', refinement: 0 },
                { id: 'rusted_fang', name: 'Rusted Fang', quantity: 1, type: 'equipment', refinement: 1 }
            ];
            const nextInv = InventoryManager.removeItem(inv, 'rusted_fang', 1, 0);
            expect(nextInv.length).toBe(1);
            expect(nextInv[0].refinement).toBe(1);
        });

        it('decreases quantity if greater than amount to remove', () => {
            const inv: InventoryItem[] = [
                { id: 'rusted_fang', name: 'Rusted Fang', quantity: 5, type: 'equipment', refinement: 0 }
            ];
            const nextInv = InventoryManager.removeItem(inv, 'rusted_fang', 2, 0);
            expect(nextInv.length).toBe(1);
            expect(nextInv[0].quantity).toBe(3);
        });
    });
});
