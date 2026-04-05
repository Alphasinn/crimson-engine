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
                            <div className={styles.centeredHeader}>
                                <h3 className={styles.nodeName}>{node.distillItem.name}</h3>
                                <div className={styles.headerDetails}>
                                    <div className={styles.levelReq}>Level requirement: {node.levelReq}</div>
                                    <div className={styles.xpTimeInfo}>
                                        {node.distillXp} XP / {(node.baseDistillTimeMs / 1000).toFixed(1)} Seconds
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardBodySplit}>
                                <div className={styles.requirementSection}>
                                    <div className={styles.requirementIconContainer}>
                                        <div className={styles.requirementQtyBadge}>{node.rawItem.quantity || 1}</div>
                                        {node.icon ? (
                                            <img src={node.icon} alt={node.rawItem.name} className={styles.requirementIcon} />
                                        ) : (
                                            <span className={styles.placeholderIconTiny}>⚗️</span>
                                        )}
                                        <div className={styles.requirementStockBadge}>{stock}</div>
                                    </div>
                                </div>

                                <div className={styles.resultSection}>
                                    {node.distillIcon ? (
                                        <img src={node.distillIcon} alt={node.distillItem.name} className={styles.resultImage} />
                                    ) : (
                                        <div className={styles.placeholderIconLarge}>No Visual</div>
                                    )}
                                </div>
                            </div>

                            {isThisActive && (
                                <div className={styles.progressTrackCompact}>
                                    <div className={styles.progressBar} style={{ width: `${pPct}%` }} />
                                </div>
                            ) || (
                                <div className={styles.progressTrackEmpty} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
