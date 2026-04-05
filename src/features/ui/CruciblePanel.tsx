import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useCombatEngine } from '../combat/useCombatEngine';
import iconBloodShard from '../../assets/icons/blood_shard.png';
import iconGraveSteel from '../../assets/icons/grave_steel.png';
import iconStabilizedIchor from '../../assets/icons/stabilized_ichor.png';
import styles from './CruciblePanel.module.scss';
import { 
    isEligibleForTierShift, getTierShiftCost, resolveNextTierItem
} from '../../engine/progression';
import type { SpecializationPath, EquipmentSlot, EquipmentItem } from '../../engine/types';
import { ITEM_DATABASE } from '../../data/items';

export const CruciblePanel: React.FC = () => {
    const { 
        equipment, bloodShards, graveSteel, stabilizedIchor,
        crucibleSealed, refineGear, tierShift, getResourceQuantity
    } = usePlayerStore();
    
    const { isRunning } = useCombatStore();
    const { fleeFromCombat } = useCombatEngine();

    const handleRefine = (slot: any) => {
        if (crucibleSealed) return;
        if (isRunning) fleeFromCombat();
        refineGear(slot);
    };

    const handleTierShift = (slot: EquipmentSlot, path: SpecializationPath) => {
        if (crucibleSealed) return;
        if (isRunning) fleeFromCombat();
        tierShift(slot, path);
    };

    const shiftableEntries = (Object.entries(equipment) as [EquipmentSlot, EquipmentItem][])
        .filter(([, item]) => isEligibleForTierShift(item));

    return (
        <div className={`${styles.root} ${crucibleSealed ? styles.sealed : ''}`}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h3>THE CRUCIBLE</h3>
                    <div className={`${styles.sealStatus} ${crucibleSealed ? styles.sealedText : styles.readyText}`}>
                        {crucibleSealed ? '🔒 SEALED' : '✨ READY'}
                    </div>
                </div>
                <p className={styles.desc}>
                    Distill essence into power. One action per cycle.
                </p>
            </header>

            <div className={styles.crucibleGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                {/* SECTION 1: Refinement (Altar of Steel) */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Steel</h4>
                    <div className={styles.gearList}>
                        {Object.entries(equipment).map(([slot, item]) => {
                            const shardCost = 25 * ((item.refinement || 0) + 1);
                            const steelCost = 5 * ((item.refinement || 0) + 1);
                            const canAfford = bloodShards >= shardCost && graveSteel >= steelCost;
                            const isReady = canAfford && !crucibleSealed && !isRunning && (item.refinement ?? 0) < 5;

                            return (
                                <div key={slot} className={styles.gearItem}>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div className={styles.gearInfo}>
                                            <span className={styles.itemName} style={{ fontSize: '0.8rem' }}>{item.name}</span>
                                            <span className={styles.refinement}>+{item.refinement || 0}</span>
                                        </div>
                                        {(item.refinement ?? 0) < 5 && (
                                            <div className={styles.costArea}>
                                                <span className={`${styles.costItem} ${bloodShards >= shardCost ? styles.affordable : styles.unaffordable}`}>
                                                    <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> {shardCost}
                                                </span>
                                                <span className={`${styles.costItem} ${graveSteel >= steelCost ? styles.affordable : styles.unaffordable}`}>
                                                    <img src={iconGraveSteel} alt="Steel" className={styles.costIcon} /> {steelCost}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        className={`${styles.refineBtn} ${isReady ? styles.readyGreen : ''}`}
                                        onClick={() => handleRefine(slot)}
                                        disabled={crucibleSealed || !isReady || (item.refinement ?? 0) >= 5}
                                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                    >
                                        {(item.refinement ?? 0) >= 5 ? 'MAX' : 'Refine'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION 2: Tier-Shift (Altar of Flesh) */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Flesh</h4>
                    {shiftableEntries.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className={styles.hint}>No +5 gear ready</p>
                        </div>
                    ) : (
                        <div className={styles.gearList}>
                            {shiftableEntries.map(([slot, item]) => {
                                const nextItem = resolveNextTierItem(item, ITEM_DATABASE.filter(i => 'slot' in i) as EquipmentItem[]);
                                const cost = getTierShiftCost(item.tier);
                                
                                const hasShards = bloodShards >= cost.shards;
                                const hasIchor = stabilizedIchor >= cost.stabilizedIchor;
                                const hasComponents = cost.components.every(comp => getResourceQuantity(comp.id) >= comp.quantity);
                                
                                const isReadyShift = hasShards && hasIchor && hasComponents && !crucibleSealed && !isRunning;

                                if (!nextItem) return null;

                                return (
                                    <div key={slot} className={styles.shiftItem}>
                                        <div className={styles.shiftPreview}>
                                            <div className={styles.gearInfo}>
                                                <span className={styles.itemName} style={{ fontSize: '0.8rem' }}>{item.name} ➔</span>
                                                <span className={styles.itemName} style={{ color: '#4ade80', fontSize: '0.8rem' }}>{nextItem.name}</span>
                                            </div>
                                            <div className={styles.costArea} style={{ flexWrap: 'wrap', gap: '8px' }}>
                                                <span className={`${styles.costItem} ${hasShards ? styles.affordable : styles.unaffordable}`}>
                                                    <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> {cost.shards}
                                                </span>
                                                <span className={`${styles.costItem} ${hasIchor ? styles.affordable : styles.unaffordable}`}>
                                                    <img src={iconStabilizedIchor} alt="S. Ichor" className={styles.costIcon} /> {cost.stabilizedIchor}
                                                </span>
                                                {/* Forged Components */}
                                                {cost.components.map(comp => (
                                                    <span key={comp.id} className={`${styles.costItem} ${getResourceQuantity(comp.id) >= comp.quantity ? styles.affordable : styles.unaffordable}`}>
                                                        <span style={{ fontSize: '10px', opacity: 0.8 }}>{comp.id.replace(/_/g, ' ')}:</span> {comp.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {!item.specPath ? (
                                            <div className={styles.shiftActions}>
                                                <button 
                                                    className={`${styles.sanguineBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                                    onClick={() => handleTierShift(slot, 'sanguine')}
                                                    disabled={!isReadyShift}
                                                    style={{ padding: '6px', fontSize: '10px' }}
                                                >
                                                    Sanguine
                                                </button>
                                                <button 
                                                    className={`${styles.vileBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                                    onClick={() => handleTierShift(slot, 'vile')}
                                                    disabled={!isReadyShift}
                                                    style={{ padding: '6px', fontSize: '10px' }}
                                                >
                                                    Vile
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                className={`${styles.refineBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                                onClick={() => handleTierShift(slot, item.specPath!)}
                                                disabled={!isReadyShift}
                                                style={{ width: '100%', fontSize: '0.75rem' }}
                                            >
                                                Shift ({item.specPath})
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {crucibleSealed && (
                <div className={styles.sealOverlay}>
                    <div className={styles.sealMessage}>
                        <span>Crucible is Sealed</span>
                        <small>Survive a full Hunt (5 seconds) to reset</small>
                    </div>
                </div>
            )}
        </div>
    );
};
