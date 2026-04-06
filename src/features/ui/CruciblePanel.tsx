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

    const getRefinementBonusPreview = (item: EquipmentItem) => {
        const slot = item.slot;
        if (['weapon', 'offhand', 'ammo'].includes(slot)) return "+1% Accuracy & Max Hit";
        if (['helmet', 'chest', 'legs', 'gloves', 'boots'].includes(slot)) return "+1% Mitigation & Armor";
        if (['ring', 'amulet'].includes(slot)) return "+1% Accuracy & Evasion";
        return "+1% Primary Stats";
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

            <div className={styles.crucibleGrid}>
                {/* SECTION 1: Refinement (Altar of Steel) */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Steel</h4>
                    <div className={styles.refineGrid}>
                        {Object.entries(equipment).map(([slot, item]) => {
                            const shardCost = 25 * ((item.refinement || 0) + 1);
                            const steelCost = 5 * ((item.refinement || 0) + 1);
                            const canAfford = bloodShards >= shardCost && graveSteel >= steelCost;
                            const isReady = canAfford && !crucibleSealed && !isRunning && (item.refinement ?? 0) < 5;

                            return (
                                <div key={slot} className={styles.refineCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.itemIconBox}>
                                            {item.icon ? (
                                                <img src={item.icon} alt={item.name} className={styles.itemIcon} />
                                            ) : (
                                                <div className={styles.itemIconPlaceholder}>{item.name.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div className={styles.nameGroup}>
                                            <span className={styles.itemName}>{item.name}</span>
                                            <span className={styles.refinementBadge}>+{item.refinement || 0}</span>
                                        </div>
                                    </div>

                                    <div className={styles.bonusPreview}>
                                        <span className={styles.bonusLabel}>Boost:</span>
                                        <span className={styles.bonusValue}>{getRefinementBonusPreview(item)}</span>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        {(item.refinement ?? 0) < 5 ? (
                                            <div className={styles.costGrid}>
                                                <div className={styles.requirementContainer} title="Blood Shards">
                                                    <div className={styles.qtyBadge}>{shardCost}</div>
                                                    <img src={iconBloodShard} alt="Blood Shards" className={styles.costIcon} />
                                                    <div className={`${styles.stockBadge} ${bloodShards < shardCost ? styles.insufficient : ''}`}>
                                                        {bloodShards}
                                                    </div>
                                                </div>
                                                <div className={styles.requirementContainer} title="Grave Steel">
                                                    <div className={styles.qtyBadge}>{steelCost}</div>
                                                    <img src={iconGraveSteel} alt="Grave Steel" className={styles.costIcon} />
                                                    <div className={`${styles.stockBadge} ${graveSteel < steelCost ? styles.insufficient : ''}`}>
                                                        {graveSteel}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.maxLabel}>MAXED</div>
                                        )}

                                        <button 
                                            className={`${styles.refineBtnSmall} ${isReady ? styles.readyGreen : ''}`}
                                            onClick={() => handleRefine(slot)}
                                            disabled={crucibleSealed || !isReady || (item.refinement ?? 0) >= 5}
                                        >
                                            {(item.refinement ?? 0) >= 5 ? 'DONE' : 'REFINE'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION 2: Tier-Shift (Altar of Flesh) */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Flesh</h4>
                    {shiftableEntries.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
                            <p className={styles.hint}>No +5 gear ready for Tier-Shift</p>
                        </div>
                    ) : (
                    <div className={styles.refineGrid}>
                            {shiftableEntries.map(([slot, item]) => {
                                const nextItem = resolveNextTierItem(item, ITEM_DATABASE.filter(i => 'slot' in i) as EquipmentItem[]);
                                const cost = getTierShiftCost(item.tier);
                                
                                const hasShards = bloodShards >= cost.shards;
                                const hasIchor = stabilizedIchor >= cost.stabilizedIchor;
                                const hasComponents = cost.components.every(comp => getResourceQuantity(comp.id) >= comp.quantity);
                                
                                const isReadyShift = hasShards && hasIchor && hasComponents && !crucibleSealed && !isRunning;

                                if (!nextItem) return null;

                                return (
                                    <div key={slot} className={styles.refineCard}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.itemIconBox}>
                                                {item.icon ? (
                                                    <img src={item.icon} alt={item.name} className={styles.itemIcon} />
                                                ) : (
                                                    <div className={styles.itemIconPlaceholder}>{item.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className={styles.nameGroup}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <span className={styles.refinementBadge}>READY TO SHIFT</span>
                                            </div>

                                            <div className={styles.evolveIntoHeader}>
                                                <span className={styles.evolveLabel}>Evolving to:</span>
                                                <span className={styles.evolveValue}>{nextItem.name}</span>
                                            </div>
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <div className={styles.stackedCostArea}>
                                                <div className={styles.costGrid}>
                                                    <div className={styles.requirementContainer} title="Blood Shards">
                                                        <div className={styles.qtyBadge}>{cost.shards}</div>
                                                        <img src={iconBloodShard} alt="Blood Shards" className={styles.costIcon} />
                                                        <div className={`${styles.stockBadge} ${bloodShards < cost.shards ? styles.insufficient : ''}`}>
                                                            {bloodShards}
                                                        </div>
                                                    </div>
                                                    <div className={styles.requirementContainer} title="Stabilized Ichor">
                                                        <div className={styles.qtyBadge}>{cost.stabilizedIchor}</div>
                                                        <img src={iconStabilizedIchor} alt="Stabilized Ichor" className={styles.costIcon} />
                                                        <div className={`${styles.stockBadge} ${stabilizedIchor < cost.stabilizedIchor ? styles.insufficient : ''}`}>
                                                            {stabilizedIchor}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Forged Components Row */}
                                                <div className={styles.costGrid}>
                                                    {cost.components.map(comp => {
                                                        const ownedComp = getResourceQuantity(comp.id);
                                                        return (
                                                            <div key={comp.id} className={styles.requirementContainer} title={comp.id.replace(/_/g, ' ')}>
                                                                <div className={styles.qtyBadge}>{comp.quantity}</div>
                                                                <div className={styles.costIcon} style={{fontSize: '12px', fontWeight: 'bold', color: '#ff4d4d'}}>
                                                                    {comp.id.split('_').map(w => w[0]).join('').toUpperCase()}
                                                                </div>
                                                                <div className={`${styles.stockBadge} ${ownedComp < comp.quantity ? styles.insufficient : ''}`}>
                                                                    {ownedComp}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {!item.specPath ? (
                                                <div className={styles.shiftActions}>
                                                    <button 
                                                        className={`${styles.sanguineBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                                        onClick={() => handleTierShift(slot, 'sanguine')}
                                                        disabled={!isReadyShift}
                                                    >
                                                        Sanguine
                                                    </button>
                                                    <button 
                                                        className={`${styles.vileBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                                        onClick={() => handleTierShift(slot, 'vile')}
                                                        disabled={!isReadyShift}
                                                    >
                                                        Vile
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className={`${styles.refineBtnSmall} ${isReadyShift ? styles.readyGreen : ''}`}
                                                    onClick={() => handleTierShift(slot, item.specPath!)}
                                                    disabled={!isReadyShift}
                                                >
                                                    Shift ({item.specPath})
                                                </button>
                                            )}
                                        </div>
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
