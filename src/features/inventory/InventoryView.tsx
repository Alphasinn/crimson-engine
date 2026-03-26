import React, { useState } from 'react';
import { EquipmentPanel } from '../character/EquipmentPanel';
import styles from './inventory.module.scss';
import { usePlayerStore } from '../../store/playerStore';
import { ARMOR_MAP } from '../../data/armor';
import { WEAPON_MAP } from '../../data/weapons';

const getItemVisual = (item: any) => {
    if (item.type === 'equipment') {
        const stats = ARMOR_MAP.get(item.id) || WEAPON_MAP.get(item.id);
        if (stats?.icon) return <img src={stats.icon} alt={item.name} className={styles.itemImage} />;
    }
    
    // Fallback/Default logic
    const id = item.id;
    let text = '#';
    if (id.includes('coin')) text = 'G';
    else if (id.includes('cloth') || id.includes('pelt') || id.includes('fur')) text = 'M';
    else if (id.includes('dagger') || id.includes('sword') || id.includes('blade') || id.includes('fang') || id.includes('maul') || id.includes('bow')) text = 'W';
    else if (id.includes('blood') || id.includes('vial') || id.includes('essence') || id.includes('orange')) text = 'B';
    else if (id.includes('bone') || id.includes('fragment')) text = 'X';
    
    return <div className={styles.itemIconText}>{text}</div>;
};

export function InventoryView() {
    const { inventory, equipItem, useFood } = usePlayerStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selectedItem = inventory.find(i => i.id === selectedId);

    const handleAction = (type: 'equip' | 'consume') => {
        if (!selectedId) return;
        if (type === 'equip') equipItem(selectedId);
        if (type === 'consume') useFood(selectedId);
        setSelectedId(null);
    };

    return (
        <div className={styles.root}>
            <div className={styles.inventoryArea}>
                <h2>Inventory</h2>
                {inventory.length === 0 ? (
                    <p className={styles.empty}>Your inventory is empty.</p>
                ) : (
                    <div className={styles.grid}>
                        {inventory.map(item => (
                            <div 
                                key={item.id} 
                                className={`${styles.itemCard} ${selectedId === item.id ? styles.selected : ''}`} 
                                onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                                title={item.name}
                            >
                                <div className={styles.itemVisual}>
                                    {getItemVisual(item)}
                                </div>
                                <div className={styles.itemQty}>{item.quantity}</div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedItem && (
                    <div className={styles.actionMenu}>
                        <div className={styles.menuHeader}>
                            <div className={styles.menuTitleGroup}>
                                <div className={styles.menuIconPreview}>
                                    {getItemVisual(selectedItem)}
                                </div>
                                <h3>{selectedItem.name}</h3>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedId(null)}>×</button>
                        </div>
                        <div className={styles.menuActions}>
                            {selectedItem.type === 'equipment' && (
                                <button className={styles.actionBtn} onClick={() => handleAction('equip')}>
                                    EQUIP ITEM
                                </button>
                            )}
                            {selectedItem.type === 'food' && (
                                <button className={styles.actionBtn} onClick={() => handleAction('consume')}>
                                    CONSUME
                                </button>
                            )}
                            <button className={styles.actionBtn} onClick={() => setSelectedId(null)}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className={styles.equipmentArea}>
                <h2 style={{ marginBottom: '16px' }}>Equipment Loadout</h2>
                <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
                    <EquipmentPanel />
                </div>
            </div>
        </div>
    );
}
