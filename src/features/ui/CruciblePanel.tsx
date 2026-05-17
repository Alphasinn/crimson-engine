import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
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
        refineGear, tierShift, getResourceQuantity,
        crucibleTargetSlot, crucibleKillProgress, setCrucibleTarget,
        cancelCrucibleTarget
    } = usePlayerStore();
    
    const { isRunning } = useCombatStore();

    const handleRefine = (slot: EquipmentSlot) => {
        const item = equipment[slot];
        if (!item) return;
        
        const tierNum = parseInt(item.tier.slice(1));
        const requiredKills = 25 * tierNum;
        
        if (crucibleKillProgress >= requiredKills) {
            refineGear(slot);
            setCrucibleTarget(null); // Clear target after use
        }
    };

    const handleTierShift = (slot: EquipmentSlot, path: SpecializationPath) => {
        const item = equipment[slot];
        if (!item) return;
        
        const tierNum = parseInt(item.tier.slice(1));
        const requiredKillsShift = 50 * tierNum;
        
        if (crucibleKillProgress >= requiredKillsShift) {
            tierShift(slot, path);
            setCrucibleTarget(null); // Clear target after use
        }
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
        <div className={styles.root}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h3>THE CRUCIBLE</h3>
                    <div className={`${styles.sealStatus} ${crucibleTargetSlot ? styles.sealedText : styles.readyText}`}>
                        {crucibleTargetSlot ? '🎯 TARGET ACTIVE' : '✨ READY'}
                    </div>
                </div>
                <p className={styles.desc}>
                    Target an equipped item to refine it through combat.
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
                            
                            const tierNum = parseInt(item.tier.slice(1));
                            const requiredKills = 25 * tierNum;
                            
                            const isTargeted = crucibleTargetSlot === slot;
                            const progressMet = crucibleKillProgress >= requiredKills;
                            
                            const isReady = isTargeted && progressMet && (item.refinement ?? 0) < 5;

                            return (
                                <div key={slot} className={`${styles.refineCard} ${isTargeted ? styles.targetedCard : ''}`}>
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

                                    {isTargeted ? (
                                        <div className={styles.progressArea}>
                                            <div className={styles.progressHeader}>
                                                <span>Progress</span>
                                                <span>{crucibleKillProgress} / {requiredKills}</span>
                                            </div>
                                            <div className={styles.progressBar}>
                                                <div 
                                                    className={styles.progressFill} 
                                                    style={{ width: `${Math.min(100, (crucibleKillProgress / requiredKills) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.targetActionArea}>
                                            <button 
                                                className={styles.targetBtn}
                                                onClick={() => setCrucibleTarget(slot as EquipmentSlot)}
                                                disabled={crucibleTargetSlot !== null}
                                            >
                                                {crucibleTargetSlot !== null ? 'Busy' : 'Set Target'}
                                            </button>
                                        </div>
                                    )}

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
                                            className={`${styles.refineBtnSmall} ${isReady ? styles.readyGreen : (isTargeted && !progressMet) ? styles.cancelRed : ''}`}
                                            onClick={() => {
                                                if (isTargeted && !progressMet) {
                                                    cancelCrucibleTarget();
                                                } else {
                                                    handleRefine(slot as EquipmentSlot);
                                                }
                                            }}
                                            disabled={(!isReady && !isTargeted) || (item.refinement ?? 0) >= 5}
                                        >
                                            {isTargeted && !progressMet ? 'CANCEL' : 'REFINE'}
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
                                
                                const tierNum = parseInt(item.tier.slice(1));
                                const requiredKillsShift = 50 * tierNum;
                                
                                const isTargeted = crucibleTargetSlot === slot;
                                const progressMet = crucibleKillProgress >= requiredKillsShift;
                                
                                const isReadyShift = isTargeted && progressMet;

                                if (!nextItem) return null;

                                return (
                                    <div key={slot} className={`${styles.refineCard} ${isTargeted ? styles.targetedCard : ''}`}>
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

                                        {isTargeted ? (
                                            <div className={styles.progressArea}>
                                                <div className={styles.progressHeader}>
                                                    <span>Progress</span>
                                                    <span>{crucibleKillProgress} / {requiredKillsShift}</span>
                                                </div>
                                                <div className={styles.progressBar}>
                                                    <div 
                                                        className={styles.progressFill} 
                                                        style={{ width: `${Math.min(100, (crucibleKillProgress / requiredKillsShift) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.targetActionArea}>
                                                <button 
                                                    className={styles.targetBtn}
                                                    onClick={() => setCrucibleTarget(slot as EquipmentSlot)}
                                                    disabled={crucibleTargetSlot !== null}
                                                >
                                                    {crucibleTargetSlot !== null ? 'Busy' : 'Set Target'}
                                                </button>
                                            </div>
                                        )}

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
                                                    {isTargeted && !progressMet ? (
                                                        <button 
                                                            className={`${styles.refineBtnSmall} ${styles.cancelRed}`}
                                                            onClick={() => cancelCrucibleTarget()}
                                                            style={{ width: '100%' }}
                                                        >
                                                            CANCEL
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                className={`${styles.sanguineBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                                                onClick={() => handleTierShift(slot as EquipmentSlot, 'sanguine')}
                                                                disabled={!isReadyShift}
                                                            >
                                                                Sanguine
                                                                <div className={styles.btnTooltip}>
                                                                    <div className={styles.tooltipTitle}>Sanguine</div>
                                                                    <div>Grants +5% Attack Speed.</div>
                                                                    <div style={{ color: '#aaa', marginTop: '4px' }}>Resonance (3+ items): +20% Dash Distance, +10% Dash Cooldown Reduction.</div>
                                                                </div>
                                                            </button>
                                                            <button 
                                                                className={`${styles.vileBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                                                onClick={() => handleTierShift(slot as EquipmentSlot, 'vile')}
                                                                disabled={!isReadyShift}
                                                            >
                                                                Vile
                                                                <div className={styles.btnTooltip}>
                                                                    <div className={styles.tooltipTitle}>Vile</div>
                                                                    <div>Grants +5% Damage Reduction.</div>
                                                                    <div style={{ color: '#aaa', marginTop: '4px' }}>Resonance (3+ items): 2s Braced state on block.</div>
                                                                </div>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <button 
                                                    className={`${styles.refineBtnSmall} ${isReadyShift ? styles.readyGreen : ''}`}
                                                    onClick={() => handleTierShift(slot as EquipmentSlot, item.specPath!)}
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
        </div>
    );
};
