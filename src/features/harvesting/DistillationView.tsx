import { useSkillingStore } from '../../store/skillingStore';
import { usePlayerStore } from '../../store/playerStore';
import { BLOOD_TIERS } from '../../data/harvesting';
import styles from './DistillationView.module.scss';
import React from 'react';
import iconDistill from '../../assets/skills/distillation/distillation.png';

export const DistillationView: React.FC = () => {
    const { skills, inventory } = usePlayerStore();
    const { activeNodeId, activeSkill, isActive, progressTimer, requiredTicks, startAction, stopAction } = useSkillingStore();

    const distillationLevel = skills.distillation?.level || 1;
    const isDistilling = isActive && activeSkill === 'distillation';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <img src={iconDistill} alt="" className={styles.mainIcon} />
                    <h2 className={styles.title}>Distillation</h2>
                </div>
                <div className={styles.skillBadge}>
                    <span>Level {distillationLevel}</span>
                </div>
            </header>

            <p className={styles.description}>
                Refine raw blood into potent healing vials for combat. (1 Raw = 1 Vial). Fails are currently disabled.
            </p>

            <div className={styles.grid}>
                {BLOOD_TIERS.map((node) => {
                    const isUnlocked = distillationLevel >= node.levelReq;
                    const rawInv = inventory.find(i => i.id === node.rawItem.id);
                    const stock = rawInv?.quantity || 0;
                    
                    const isThisActive = isDistilling && activeNodeId === node.id;
                    const pPct = isThisActive && requiredTicks > 0 ? (progressTimer / requiredTicks) * 100 : 0;
                    const canStart = isUnlocked && stock > 0;

                    return (
                        <div 
                            key={`distill-${node.id}`} 
                            className={`${styles.card} ${!isUnlocked ? styles.locked : ''} ${stock === 0 && !isThisActive ? styles.empty : ''} ${isThisActive ? styles.active : ''}`}
                            onClick={() => {
                                if (!isUnlocked) return;
                                if (isThisActive) stopAction();
                                else if (canStart) startAction(node.id, 'distillation');
                            }}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.nodeName}>{node.distillItem.name}</h3>
                                {isUnlocked ? (
                                    <span className={styles.reqBadge}>Lv {node.levelReq}</span>
                                ) : (
                                    <span className={styles.lockBadge}>Requires Lv {node.levelReq}</span>
                                )}
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.rewardRow}>
                                    <span className={styles.rewardIcon}>⚗️</span>
                                    <span>{node.rawItem.name}</span>
                                    <span className={styles.stockCount}>({stock} owned)</span>
                                </div>
                                <div className={styles.healRow}>
                                    <span>Heals</span>
                                    <span className={styles.healHighlight}>+{node.distillItem.healAmount} HP</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>XP/Action</span>
                                    <span className={styles.highlight}>+{node.distillXp}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>Time</span>
                                    <span>{(node.baseDistillTimeMs / 1000).toFixed(1)}s</span>
                                </div>
                            </div>

                            {isThisActive && (
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{ width: `${pPct}%` }} />
                                    <div className={styles.progressLabel}>Distilling...</div>
                                </div>
                            )}

                            {(!isThisActive && isUnlocked) && (
                                <div className={styles.cardFooter}>
                                    {stock > 0 ? 'Click to distill' : 'Requires Raw Blood'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
