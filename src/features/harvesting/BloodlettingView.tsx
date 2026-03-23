import { useHarvestingStore } from '../../store/harvestingStore';
import { usePlayerStore } from '../../store/playerStore';
import { BLOOD_TIERS } from '../../data/harvesting';
import styles from './BloodlettingView.module.scss';
import React from 'react';

export const BloodlettingView: React.FC = () => {
    const { skills } = usePlayerStore();
    const { activeNodeId, actionType, isActive, progressTimer, requiredTicks, startAction, stopAction } = useHarvestingStore();

    const bloodlettingLevel = skills.bloodletting?.level || 1;
    const isHarvesting = isActive && actionType === 'harvesting';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h2 className={styles.title}>Bloodletting</h2>
                <div className={styles.skillBadge}>
                    <span>Level {bloodlettingLevel}</span>
                </div>
            </header>

            <p className={styles.description}>
                Harvest raw blood from the world. Each source takes time but yields materials for Distillation.
            </p>

            <div className={styles.grid}>
                {BLOOD_TIERS.map((node) => {
                    const isUnlocked = bloodlettingLevel >= node.levelReq;
                    const isThisActive = isHarvesting && activeNodeId === node.id;
                    const pPct = isThisActive && requiredTicks > 0 ? (progressTimer / requiredTicks) * 100 : 0;

                    return (
                        <div 
                            key={node.id} 
                            className={`${styles.card} ${!isUnlocked ? styles.locked : ''} ${isThisActive ? styles.active : ''}`}
                            onClick={() => {
                                if (!isUnlocked) return;
                                if (isThisActive) stopAction();
                                else startAction(node.id, 'harvesting');
                            }}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.nodeName}>{node.name}</h3>
                                {isUnlocked ? (
                                    <span className={styles.reqBadge}>Lv {node.levelReq}</span>
                                ) : (
                                    <span className={styles.lockBadge}>Requires Lv {node.levelReq}</span>
                                )}
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.rewardRow}>
                                    <span className={styles.rewardIcon}>🩸</span>
                                    <span>{node.rawItem.name}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>XP/Action</span>
                                    <span className={styles.highlight}>+{node.harvestXp}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>Time</span>
                                    <span>{(node.baseHarvestTimeMs / 1000).toFixed(1)}s</span>
                                </div>
                            </div>

                            {isThisActive && (
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{ width: `${pPct}%` }} />
                                    <div className={styles.progressLabel}>Harvesting...</div>
                                </div>
                            )}

                            {(!isThisActive && isUnlocked) && (
                                <div className={styles.cardFooter}>
                                    Click to begin
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
