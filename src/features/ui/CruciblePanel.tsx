import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import styles from './CruciblePanel.module.scss';

export const CruciblePanel: React.FC = () => {
    const { 
        equipment, cursedIchor,
        crucibleSealed, refineGear, stabilizeIchor, tierShift 
    } = usePlayerStore();
    
    const { isRunning, lastSession } = useCombatStore();

    // Risk yield calculation (v1.1 design: 1 + ScentIntensity of last hunt)
    // For the UI, we'll show the potential yield based on the CURRENT hunt if running,
    // or the LAST hunt if home.
    const lastScent = lastSession?.wasSlain ? 0 : 0.20; // Stub: need to track lastScent in sessionStats
    const potentialYieldBonus = Math.round(lastScent * 100);

    const handleRefine = (slot: any) => {
        if (!crucibleSealed) refineGear(slot);
    };

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
                                    disabled={crucibleSealed || item.refinement >= 5 || isRunning}
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
                            onClick={() => !crucibleSealed && stabilizeIchor()}
                            disabled={crucibleSealed || cursedIchor <= 0 || isRunning}
                        >
                            Stabilize Ichor
                        </button>
                    </div>
                </div>

                {/* Tier-Shift Section */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Flesh (Tier-Shift)</h4>
                    <button 
                        className={styles.tierShiftBtn}
                        onClick={() => !crucibleSealed && tierShift()}
                        disabled={crucibleSealed || isRunning}
                    >
                        Prototype Tier-Shift
                    </button>
                    <p className={styles.hint}>Requires +5 gear & Catalyst</p>
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
