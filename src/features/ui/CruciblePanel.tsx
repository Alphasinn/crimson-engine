import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useCombatEngine } from '../combat/useCombatEngine';
import styles from './CruciblePanel.module.scss';

export const CruciblePanel: React.FC = () => {
    const { 
        equipment, cursedIchor,
        crucibleSealed, refineGear, stabilizeIchor, tierShift 
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

    const handleTierShift = (slot: any, path: 'sanguine' | 'vile') => {
        if (crucibleSealed) return;
        if (isRunning) fleeFromCombat();
        tierShift(slot, path);
    };

    const handleStabilize = () => {
        if (crucibleSealed) return;
        if (isRunning) fleeFromCombat();
        stabilizeIchor();
    };

    const shiftableItems = Object.entries(equipment).filter(([_, item]) => (item.refinement ?? 0) >= 5 && item.tier === 'T1');

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
                {/* Refinement Section */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Steel (Refine)</h4>
                    <div className={styles.gearList}>
                        {Object.entries(equipment).map(([slot, item]) => (
                            <div key={slot} className={styles.gearItem}>
                                <div className={styles.gearInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.refinement}>+{item.refinement}</span>
                                </div>
                                <button 
                                    className={styles.refineBtn}
                                    onClick={() => handleRefine(slot)}
                                    disabled={crucibleSealed || item.refinement >= 5}
                                >
                                    {item.refinement >= 5 ? 'MAX' : 'Refine'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transmutation Section */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Ichor (Transmute)</h4>
                    <div className={styles.transmuteArea}>
                        <div className={styles.yieldInfo}>
                            <span>Yield Bonus: <strong className={styles.bonus}>+{potentialYieldBonus}%</strong></span>
                            <small>Based on escape intensity</small>
                        </div>
                        <button 
                            className={styles.transmuteBtn}
                            onClick={handleStabilize}
                            disabled={crucibleSealed || cursedIchor <= 0}
                        >
                            Stabilize Ichor
                        </button>
                    </div>
                </div>

                {/* Tier-Shift Section */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Flesh (Tier-Shift)</h4>
                    {shiftableItems.length === 0 ? (
                        <p className={styles.hint}>No +5 T1 gear equipped</p>
                    ) : (
                        <div className={styles.gearList}>
                            {shiftableItems.map(([slot, item]) => (
                                <div key={slot} className={styles.shiftItem}>
                                    <div className={styles.gearInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.pathMarker}>Ready to Shift</span>
                                    </div>
                                    <div className={styles.shiftActions}>
                                        <button 
                                            className={styles.sanguineBtn}
                                            onClick={() => handleTierShift(slot, 'sanguine')}
                                            disabled={crucibleSealed}
                                        >
                                            Sanguine
                                        </button>
                                        <button 
                                            className={styles.vileBtn}
                                            onClick={() => handleTierShift(slot, 'vile')}
                                            disabled={crucibleSealed}
                                        >
                                            Vile
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {crucibleSealed && (
                <div className={styles.sealOverlay}>
                    <div className={styles.sealMessage}>
                        <span>Crucible is Sealed</span>
                        <small>Survive a full Hunt (50+ ticks) to reset</small>
                    </div>
                </div>
            )}
        </div>
    );
};
