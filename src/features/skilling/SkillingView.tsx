import React from 'react';
import { useSkillingStore } from '../../store/skillingStore';
import { usePlayerStore } from '../../store/playerStore';
import type { SkillName } from '../../engine/types';
import type { SkillingNode } from '../../data/skilling';
import styles from './SkillingView.module.scss';

interface SkillingViewProps {
    skill: SkillName;
    nodes: SkillingNode[];
    title: string;
    description: string;
    icon?: string;
}

export const SkillingView: React.FC<SkillingViewProps> = ({ skill, nodes, title, description, icon }) => {
    const { skills, inventory } = usePlayerStore();
    const { activeNodeId, activeSkill, isActive, progressTimer, requiredTicks, startAction, stopAction } = useSkillingStore();

    const skillLevel = skills[skill]?.level || 1;
    const isThisSkillActive = isActive && activeSkill === skill;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    {icon && <span className={styles.mainIcon}>{icon}</span>}
                    <h2 className={styles.title}>{title}</h2>
                </div>
                <div className={styles.skillBadge}>
                    <span>Level {skillLevel}</span>
                </div>
            </header>

            <p className={styles.description}>{description}</p>

            <div className={styles.grid}>
                {nodes.map((node) => {
                    const isUnlocked = skillLevel >= node.levelReq;
                    const isThisNodeActive = isThisSkillActive && activeNodeId === node.id;
                    const pPct = isThisNodeActive && requiredTicks > 0 ? (progressTimer / requiredTicks) * 100 : 0;
                    
                    // Ingredient check
                    const hasIngredients = !node.ingredients || node.ingredients.every(ing => {
                        const invItem = inventory.find(i => i.id === ing.id);
                        return invItem && invItem.quantity >= ing.quantity;
                    });

                    const canStart = isUnlocked && hasIngredients;

                    return (
                        <div 
                            key={node.id} 
                            className={`${styles.card} ${!isUnlocked ? styles.locked : ''} ${!hasIngredients && !isThisNodeActive ? styles.insufficient : ''} ${isThisNodeActive ? styles.active : ''}`}
                            onClick={() => {
                                if (!isUnlocked) return;
                                if (isThisNodeActive) stopAction();
                                else if (canStart) startAction(node.id, skill);
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
                                {node.ingredients && node.ingredients.length > 0 && (
                                    <div className={styles.ingredientsSection}>
                                        <div className={styles.sectionLabel}>Requires:</div>
                                        {node.ingredients.map(ing => {
                                            const invItem = inventory.find(i => i.id === ing.id);
                                            const owned = invItem?.quantity || 0;
                                            return (
                                                <div key={ing.id} className={`${styles.ingredientRow} ${owned < ing.quantity ? styles.missing : ''}`}>
                                                    <span>• {ing.id.replace(/_/g, ' ')}</span>
                                                    <span className={styles.stockCount}>{owned} / {ing.quantity}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                <div className={styles.rewardRow}>
                                    <span className={styles.rewardLabel}>Yield:</span>
                                    <span className={styles.rewardName}>{node.output.name} x{node.output.quantity}</span>
                                </div>

                                <div className={styles.statsPanel}>
                                    <div className={styles.statRow}>
                                        <span>XP</span>
                                        <span className={styles.highlight}>+{node.xp}</span>
                                    </div>
                                    <div className={styles.statRow}>
                                        <span>Time</span>
                                        <span>{(node.timeMs / 1000).toFixed(1)}s</span>
                                    </div>
                                </div>
                            </div>

                            {isThisNodeActive && (
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressBar} style={{ width: `${pPct}%` }} />
                                    <div className={styles.progressLabel}>Processing...</div>
                                </div>
                            )}

                            {(!isThisNodeActive && isUnlocked) && (
                                <div className={styles.cardFooter}>
                                    {canStart ? 'Click to start' : 'Insufficient Materials'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
