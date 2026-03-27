import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useCombatEngine } from '../combat/useCombatEngine';
import iconBloodShard from '../../assets/icons/blood_shard.png';
import iconGraveSteel from '../../assets/icons/grave_steel.png';
import iconCursedIchor from '../../assets/icons/cursed_ichor.png';
import iconStabilizedIchor from '../../assets/icons/stabilized_ichor.png';
import styles from './CruciblePanel.module.scss';
import { 
    isEligibleForTierShift, getTierShiftCost, resolveNextTierItem
} from '../../engine/progression';
import type { SpecializationPath, EquipmentSlot, EquipmentItem } from '../../engine/types';
import { ITEM_DATABASE } from '../../data/items';

export const CruciblePanel: React.FC = () => {
    const { 
        equipment, cursedIchor, bloodShards, graveSteel, stabilizedIchor,
        crucibleSealed, refineGear, stabilizeIchor: doStabilizeIchor, tierShift,
        sanguineFinesse, vileReinforcement
    } = usePlayerStore();
    
    const { isRunning, lastSession } = useCombatStore();
    const { fleeFromCombat } = useCombatEngine();
    // Risk yield calculation (v1.1 design: 1 + ScentIntensity of last hunt)
    const lastScent = lastSession && !lastSession.wasSlain ? (lastSession.lastScentIntensity ?? 0) : 0;
    const potentialYieldBonus = Math.round(lastScent * 100);

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

    const handleStabilize = () => {
        if (crucibleSealed) return;
        if (isRunning) fleeFromCombat();
        doStabilizeIchor();
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
                {/* COLUMN 1: Refinement */}
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

                {/* COLUMN 2: Enhancement */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Blood</h4>
                    <div className={styles.gearList}>
                        {/* Sanguine Finesse */}
                        <div className={styles.gearItem}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div className={styles.gearInfo}>
                                    <span className={styles.itemName} style={{ fontSize: '0.8rem' }}>Sanguine Finesse</span>
                                </div>
                                <div className={styles.yieldInfo}>
                                    <small style={{ fontSize: '10px' }}>+5% Acc (20s)</small>
                                </div>
                                <div className={styles.costArea}>
                                    <span className={`${styles.costItem} ${bloodShards >= 15 ? styles.affordable : styles.unaffordable}`}>
                                        <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> 15
                                    </span>
                                </div>
                            </div>
                            <button 
                                className={`${styles.refineBtn} ${(!crucibleSealed && !isRunning && bloodShards >= 15) ? styles.readyGreen : ''}`}
                                onClick={() => !crucibleSealed && sanguineFinesse()}
                                disabled={crucibleSealed || isRunning || bloodShards < 15}
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                                Craft
                            </button>
                        </div>

                        {/* Vile Reinforcement */}
                        <div className={styles.gearItem}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div className={styles.gearInfo}>
                                    <span className={styles.itemName} style={{ fontSize: '0.8rem' }}>Vile Reinforce</span>
                                </div>
                                <div className={styles.yieldInfo}>
                                    <small style={{ fontSize: '10px' }}>+5 Armor & Braced</small>
                                </div>
                                <div className={styles.costArea}>
                                    <span className={`${styles.costItem} ${bloodShards >= 30 ? styles.affordable : styles.unaffordable}`}>
                                        <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> 30
                                    </span>
                                    <span className={`${styles.costItem} ${graveSteel >= 10 ? styles.affordable : styles.unaffordable}`}>
                                        <img src={iconGraveSteel} alt="Steel" className={styles.costIcon} /> 10
                                    </span>
                                </div>
                            </div>
                            <button 
                                className={`${styles.refineBtn} ${(!crucibleSealed && !isRunning && bloodShards >= 30 && graveSteel >= 10) ? styles.readyGreen : ''}`}
                                onClick={() => !crucibleSealed && vileReinforcement()}
                                disabled={crucibleSealed || isRunning || bloodShards < 30 || graveSteel < 10}
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                                Craft
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Transmutation */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Ichor</h4>
                    <div className={styles.transmuteArea} style={{ flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                        <div className={styles.yieldInfo}>
                            <span>Yield: <strong className={styles.bonus}>+{potentialYieldBonus}%</strong></span>
                            <small>Based on escape risk</small>
                        </div>
                        <div className={styles.costArea}>
                            <span className={`${styles.costItem} ${bloodShards >= 125 ? styles.affordable : styles.unaffordable}`}>
                                <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> 125
                            </span>
                            <span className={`${styles.costItem} ${cursedIchor >= 1 ? styles.affordable : styles.unaffordable}`}>
                                <img src={iconCursedIchor} alt="C. Ichor" className={styles.costIcon} /> 1
                            </span>
                        </div>
                        <button 
                            className={`${styles.transmuteBtn} ${(!crucibleSealed && !isRunning && bloodShards >= 125 && cursedIchor >= 1) ? styles.readyGreen : ''}`}
                            onClick={handleStabilize}
                            disabled={crucibleSealed || cursedIchor < 1 || bloodShards < 125 || isRunning}
                            style={{ width: '100%' }}
                        >
                            Stabilize Ichor
                        </button>
                    </div>
                </div>

                {/* COLUMN 4: Tier-Shift */}
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
                                const canAffordShift = 
                                    bloodShards >= cost.shards && 
                                    stabilizedIchor >= cost.stabilizedIchor && 
                                    graveSteel >= cost.steel;
                                const isReadyShift = canAffordShift && !crucibleSealed && !isRunning;

                                if (!nextItem) return null;

                                return (
                                    <div key={slot} className={styles.shiftItem}>
                                        <div className={styles.shiftPreview}>
                                            <div className={styles.gearInfo}>
                                                <span className={styles.itemName} style={{ fontSize: '0.8rem' }}>{item.name} ➔</span>
                                                <span className={styles.itemName} style={{ color: '#4ade80', fontSize: '0.8rem' }}>{nextItem.name}</span>
                                            </div>
                                            <div className={styles.costArea}>
                                                <span className={`${styles.costItem} ${bloodShards >= cost.shards ? styles.affordable : styles.unaffordable}`}>
                                                    <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> {cost.shards}
                                                </span>
                                                <span className={`${styles.costItem} ${stabilizedIchor >= cost.stabilizedIchor ? styles.affordable : styles.unaffordable}`}>
                                                    <img src={iconStabilizedIchor} alt="S. Ichor" className={styles.costIcon} /> {cost.stabilizedIchor}
                                                </span>
                                                <span className={`${styles.costItem} ${graveSteel >= cost.steel ? styles.affordable : styles.unaffordable}`}>
                                                    <img src={iconGraveSteel} alt="Steel" className={styles.costIcon} /> {cost.steel}
                                                </span>
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
