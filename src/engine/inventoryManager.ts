// =============================================================================
// CRIMSON ENGINE — Inventory Manager
// Centralized logic for adding, removing, and validating items.
// =============================================================================

import type { InventoryItem, EquipmentItem, SpecializationPath } from './types';
 
 export class InventoryManager {
     /**
      * Determine if an item is stackable based on its type and slot.
      */
     static isStackable(item: InventoryItem | EquipmentItem): boolean {
         // Equipment (weapons, armor) stack if they are identical
         if ('slot' in item) return true;
         
         // Materials and consumables (food) stack
         return item.type === 'material' || item.type === 'food' || item.type === 'misc' || item.type === 'raw_blood' || item.type === 'equipment';
     }
 
     /**
      * Create a clean inventory item from a template, 
      * ensuring only necessary data is stored.
      */
     static createItem(template: EquipmentItem | InventoryItem, quantity: number = 1): InventoryItem {
         const isEquipment = 'slot' in template;
         const refinement = (template as any).refinement;
         const specPath = (template as any).specPath;
         
         return {
             id: template.id,
             name: template.name, 
             type: isEquipment ? 'equipment' : (template as InventoryItem).type,
             quantity: quantity,
             icon: (template as any).icon,
             ...(template as any).healAmount ? { healAmount: (template as InventoryItem).healAmount } : {},
             ...(refinement !== undefined) ? { refinement } : {},
             ...(specPath !== undefined) ? { specPath } : {}
         };
     }
 
     /**
      * Immutable add operation. Returns a new array.
      */
     static addItem(inventory: InventoryItem[], template: EquipmentItem | InventoryItem, quantity: number = 1): InventoryItem[] {
         if (quantity <= 0) return inventory;
         
         const stackable = this.isStackable(template);
         
         if (stackable) {
             const existingIndex = inventory.findIndex(i => 
                 i.id === template.id && 
                 (i.refinement ?? 0) === ((template as any).refinement ?? 0) && 
                 i.specPath === (template as any).specPath
             );
             if (existingIndex !== -1) {
                 const newInventory = [...inventory];
                 newInventory[existingIndex] = {
                     ...newInventory[existingIndex],
                     quantity: newInventory[existingIndex].quantity + quantity
                 };
                 return newInventory;
             }
         }
         
         // Add as new entry (either non-stackable or not yet in inventory)
         return [...inventory, this.createItem(template, quantity)];
     }
 
     /**
      * Immutable remove operation. Returns a new array.
      */
     static removeItem(inventory: InventoryItem[], itemId: string, quantity: number = 1, refinement?: number, specPath?: SpecializationPath): InventoryItem[] {
         const existingIndex = inventory.findIndex(i => 
             i.id === itemId && 
             (i.refinement ?? 0) === (refinement ?? 0) && 
             i.specPath === specPath
         );
         if (existingIndex === -1) return inventory;
         
         const item = inventory[existingIndex];
         if (item.quantity <= quantity) {
             // Remove entire slot
             return inventory.filter((_, idx) => idx !== existingIndex);
         }
         
         // Subtract quantity
         const newInventory = [...inventory];
         newInventory[existingIndex] = {
             ...newInventory[existingIndex],
             quantity: newInventory[existingIndex].quantity - quantity
         };
         return newInventory;
     }

    /**
     * Validate an ID against a database and return the item.
     * Prevents "Ghost" items.
     */
    static resolveItem<T extends EquipmentItem | InventoryItem>(id: string, database: T[]): T | null {
        return database.find(i => i.id === id) || null;
    }
}
