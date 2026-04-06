import { useState } from 'react';
import { EquipmentPanel } from '../character/EquipmentPanel';
import styles from './inventory.module.scss';
import { usePlayerStore } from '../../store/playerStore';
import { useShallow } from 'zustand/react/shallow';
import { ITEM_MAP } from '../../data/items';
import { computeDerivedStats } from '../../engine/formulas';
const getItemVisual = (item: any) => {
    const template = ITEM_MAP.get(item.id);
    if (template && (template as any).icon) {
        return <img src={(template as any).icon} alt={item.name} className={styles.itemImage} />;
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
    const { 
        inventory, food, equipItem, consumeFoodItem, 
        skills, equipment, permanentArmorBonus, finesseTicksRemaining 
    } = usePlayerStore(useShallow(s => ({
        inventory: s.inventory,
        food: s.food,
        equipItem: s.equipItem,
        consumeFoodItem: s.consumeFoodItem,
        skills: s.skills,
        equipment: s.equipment,
        permanentArmorBonus: s.permanentArmorBonus,
        finesseTicksRemaining: s.finesseTicksRemaining
    })));
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const stats = computeDerivedStats(skills, equipment, {
        permanentArmorBonus,
        isFinesseActive: finesseTicksRemaining > 0,
        isLowHp: false,
        isFlickerActive: false
    });

    const allItems = [...inventory, ...food];
    const selectedItem = allItems.find(i => i.id === selectedId);

    const handleAction = (type: 'equip' | 'consume') => {
        if (!selectedId) return;
        if (type === 'equip') equipItem(selectedId);
        if (type === 'consume') consumeFoodItem(selectedId);
        setSelectedId(null);
    };

    return (
        <div className={styles.root}>
            <div className={styles.inventoryArea}>
                <div className={styles.headerRow}>
                    <h2>Inventory</h2>
                    <button 
                        className={styles.resetBtn}
                        onClick={() => {
                            if (window.confirm('Are you sure you want to RESET your profile? This will wipe your inventory and skills.')) {
                                usePlayerStore.getState().resetPlayer();
                            }
                        }}
                    >
                        RESET PROFILE
                    </button>
                </div>
                {allItems.length === 0 ? (
                    <p className={styles.empty}>Your inventory is empty.</p>
                ) : (
                    <div className={styles.grid}>
                        {allItems.map((item, idx) => (
                            <div 
                                key={`${item.id}-${idx}`} 
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

                <div className={styles.statBreakdown}>
                    <div className={styles.statCategory}>
                        <h4>OFFENSIVE</h4>
                        {stats.weaponStyle === 'melee' && (
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Melee Power</span>
                                <span className={styles.statValue}>{stats.meleeMaxHit}</span>
                            </div>
                        )}
                        {stats.weaponStyle === 'archery' && (
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Archery Power</span>
                                <span className={styles.statValue}>{stats.rangedMaxHit}</span>
                            </div>
                        )}
                        {stats.weaponStyle === 'sorcery' && (
                            <div className={styles.statRow}>
                                <span className={styles.statLabel}>Sorcery Power</span>
                                <span className={styles.statValue}>{stats.magicMaxHit}</span>
                            </div>
                        )}
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Accuracy</span>
                            <span className={styles.statValue}>{Math.round(stats.accuracyRating)}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Speed</span>
                            <span className={styles.statValue}>{stats.attackInterval.toFixed(1)}s</span>
                        </div>
                    </div>

                    <div className={styles.statCategory}>
                        <h4>DEFENSIVE</h4>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Mitigation (DR)</span>
                            <span className={styles.statValue}>{Math.round(stats.damageReduction * 100)}%</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Flat Armor</span>
                            <span className={styles.statValue}>{stats.flatArmor}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Evasion</span>
                            <span className={styles.statValue}>{Math.round(stats.evasionRating)}</span>
                        </div>
                        <div className={styles.statRow}>
                            <span className={styles.statLabel}>Block Chance</span>
                            <span className={styles.statValue}>{Math.round(stats.blockChance * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
