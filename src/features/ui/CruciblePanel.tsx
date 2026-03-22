import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useCombatEngine } from '../combat/useCombatEngine';
import iconBloodShard from '../../assets/icons/blood_shard.png';
import iconGraveSteel from '../../assets/icons/grave_steel.png';
import iconCursedIchor from '../../assets/icons/cursed_ichor.png';
import iconStabilizedIchor from '../../assets/icons/stabilized_ichor.png';
import styles from './CruciblePanel.module.scss';

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
                        {Object.entries(equipment).map(([slot, item]) => {
                            const shardCost = 25 * ((item.refinement || 0) + 1);
                            const steelCost = 5 * ((item.refinement || 0) + 1);
                            const canAfford = bloodShards >= shardCost && graveSteel >= steelCost;
                            const isReady = canAfford && !crucibleSealed && !isRunning && (item.refinement ?? 0) < 5;

                            return (
                            <div key={slot} className={styles.gearItem}>
                                <div>
                                    <div className={styles.gearInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
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
                                >
                                    {(item.refinement ?? 0) >= 5 ? 'MAX' : 'Refine'}
                                </button>
                            </div>
                        )})}
                    </div>
                </div>

                {/* Enhancement Section */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Blood (Enhance)</h4>
                    <div className={styles.gearList}>
                        {/* Sanguine Finesse */}
                        <div className={styles.gearItem}>
                            <div>
                                <div className={styles.gearInfo}>
                                    <span className={styles.itemName}>Sanguine Finesse</span>
                                </div>
                                <div className={styles.yieldInfo} style={{ marginTop: '2px', marginBottom: '2px' }}>
                                    <small>Gain 200 ticks of Finesse</small>
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
                            >
                                Craft
                            </button>
                        </div>

                        {/* Vile Reinforcement */}
                        <div className={styles.gearItem}>
                            <div>
                                <div className={styles.gearInfo}>
                                    <span className={styles.itemName}>Vile Reinforcement</span>
                                </div>
                                <div className={styles.yieldInfo} style={{ marginTop: '2px', marginBottom: '2px' }}>
                                    <small>Gain +5 Permanent Armor & Braced</small>
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
                            >
                                Craft
                            </button>
                        </div>
                    </div>
                </div>

                {/* Transmutation Section */}
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Altar of Ichor (Transmute)</h4>
                    <div className={styles.transmuteArea}>
                        <div>
                            <div className={styles.yieldInfo}>
                                <span>Yield Bonus: <strong className={styles.bonus}>+{potentialYieldBonus}%</strong></span>
                                <small>Based on escape intensity</small>
                            </div>
                            <div className={styles.costArea}>
                                <span className={`${styles.costItem} ${bloodShards >= 125 ? styles.affordable : styles.unaffordable}`}>
                                    <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> 125
                                </span>
                                <span className={`${styles.costItem} ${cursedIchor >= 1 ? styles.affordable : styles.unaffordable}`}>
                                    <img src={iconCursedIchor} alt="C. Ichor" className={styles.costIcon} /> 1
                                </span>
                            </div>
                        </div>
                        <button 
                            className={`${styles.transmuteBtn} ${(!crucibleSealed && !isRunning && bloodShards >= 125 && cursedIchor >= 1) ? styles.readyGreen : ''}`}
                            onClick={handleStabilize}
                            disabled={crucibleSealed || cursedIchor < 1 || bloodShards < 125 || isRunning}
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
                            {shiftableItems.map(([slot, item]) => {
                                const canAffordShift = bloodShards >= 200 && stabilizedIchor >= 3 && graveSteel >= 25;
                                const isReadyShift = canAffordShift && !crucibleSealed && !isRunning;
                                return (
                                <div key={slot} className={styles.shiftItem}>
                                    <div>
                                        <div className={styles.gearInfo}>
                                            <span className={styles.itemName}>{item.name}</span>
                                            <span className={styles.pathMarker}>Ready to Shift</span>
                                        </div>
                                        <div className={styles.costArea}>
                                            <span className={`${styles.costItem} ${bloodShards >= 200 ? styles.affordable : styles.unaffordable}`}>
                                                <img src={iconBloodShard} alt="Shards" className={styles.costIcon} /> 200
                                            </span>
                                            <span className={`${styles.costItem} ${stabilizedIchor >= 3 ? styles.affordable : styles.unaffordable}`}>
                                                <img src={iconStabilizedIchor} alt="S. Ichor" className={styles.costIcon} /> 3
                                            </span>
                                            <span className={`${styles.costItem} ${graveSteel >= 25 ? styles.affordable : styles.unaffordable}`}>
                                                <img src={iconGraveSteel} alt="Steel" className={styles.costIcon} /> 25
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.shiftActions}>
                                        <button 
                                            className={`${styles.sanguineBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                            onClick={() => handleTierShift(slot, 'sanguine')}
                                            disabled={crucibleSealed || !isReadyShift}
                                        >
                                            Sanguine
                                        </button>
                                        <button 
                                            className={`${styles.vileBtn} ${isReadyShift ? styles.readyGreen : ''}`}
                                            onClick={() => handleTierShift(slot, 'vile')}
                                            disabled={crucibleSealed || !isReadyShift}
                                        >
                                            Vile
                                        </button>
                                    </div>
                                </div>
                            )})}
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
