import { useSkillingStore } from '../../store/skillingStore';
import { usePlayerStore } from '../../store/playerStore';
import { BLOOD_TIERS } from '../../data/harvesting';
import styles from './BloodlettingView.module.scss';
import React from 'react';

export const BloodlettingView: React.FC = () => {
    const { skills, inventory } = usePlayerStore();
    const { activeNodeId, activeSkill, isActive, progressTimer, requiredTicks, startAction, stopAction } = useSkillingStore();

    const bloodlettingLevel = skills.bloodletting?.level || 1;
    const isHarvesting = isActive && activeSkill === 'bloodletting';

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
                    
                    const qty = inventory.find(i => i.id === node.rawItem.id)?.quantity || 0;

                    return (
                        <div 
                            key={node.id} 
                            className={`${styles.card} ${!isUnlocked ? styles.locked : ''} ${isThisActive ? styles.active : ''}`}
                            onClick={() => {
                                if (!isUnlocked) return;
                                if (isThisActive) stopAction();
                                else startAction(node.id, 'bloodletting');
                            }}
                        >
                            <div className={styles.topInfo}>
                                <h3 className={styles.nodeName}>{node.name}</h3>
                                <div className={styles.reqText}>
                                    Level requirement: {node.levelReq}
                                </div>
                                <div className={styles.statText}>
                                    {node.harvestXp} XP / {(node.baseHarvestTimeMs / 1000).toFixed(1)} Seconds
                                </div>
                            </div>

                            <div className={styles.centerIcon}>
                                {node.icon ? (
                                    <img src={node.icon} alt={node.name} className={styles.sprite} />
                                ) : (
                                    <span className={styles.emojiFallback}>🩸</span>
                                )}
                            </div>

                            <div className={styles.bottomInfo}>
                                <div className={styles.qtyText}>
                                    Qty: {qty.toLocaleString()}
                                </div>
                            </div>

                            {isThisActive && (
                                <div className={styles.progressOverlay}>
                                    <div className={styles.progressFill} style={{ width: `${pPct}%` }} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
