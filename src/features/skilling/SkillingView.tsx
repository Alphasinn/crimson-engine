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
    iconUrl?: string;
}

export const SkillingView: React.FC<SkillingViewProps> = ({ skill, nodes, title, description, iconUrl }) => {
    const { skills, getResourceQuantity } = usePlayerStore();
    const { activeNodeId, activeSkill, isActive, progressTimer, requiredTicks, startAction, stopAction } = useSkillingStore();

    const skillLevel = skills[skill]?.level || 1;
    const isThisSkillActive = isActive && activeSkill === skill;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    {iconUrl && <img src={iconUrl} alt="" className={styles.mainIcon} />}
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
                    
                    const hasIngredients = !node.ingredients || node.ingredients.every(ing => {
                        return getResourceQuantity(ing.id) >= ing.quantity;
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
                            <div className={styles.premiumHeader}>
                                <h3 className={styles.premiumNodeName}>{node.name}</h3>
                                <div className={styles.premiumHeaderDetails}>
                                    <div className={styles.premiumLevelReq}>Level requirement: {node.levelReq}</div>
                                    <div className={styles.premiumXpTimeInfo}>
                                        {node.xp} XP / {(node.timeMs / 1000).toFixed(1)} Seconds
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardBodySplit}>
                                <div className={styles.requirementSection}>
                                    {node.ingredients && node.ingredients.length > 0 ? (
                                        node.ingredients.map(ing => {
                                            const owned = getResourceQuantity(ing.id);
                                            const isMissing = owned < ing.quantity;
                                            return (
                                                <div key={ing.id} className={styles.requirementIconContainer}>
                                                    <div className={styles.requirementQtyBadge}>{ing.quantity}</div>
                                                    {ing.icon ? (
                                                        <img src={ing.icon} alt={ing.id} className={styles.requirementIcon} />
                                                    ) : (
                                                        <span style={{fontSize: '24px', opacity: 0.3}}>?</span>
                                                    )}
                                                    <div className={`${styles.requirementStockBadge} ${isMissing ? styles.insufficient : ''}`}>
                                                        {owned}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className={styles.requirementIconContainer} style={{opacity: 0.2, borderStyle: 'dashed'}}>
                                            <span style={{fontSize: '10px'}}>NO REQS</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.resultSection}>
                                    {node.output.icon ? (
                                        <img src={node.output.icon} alt={node.output.name} className={styles.resultImage} />
                                    ) : (
                                        <div className={styles.resultImage} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <span style={{fontSize: '32px', opacity: 0.2}}>?</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isThisNodeActive ? (
                                <div className={styles.progressTrackBottom}>
                                    <div className={styles.progressBarPremium} style={{ width: `${pPct}%` }} />
                                </div>
                            ) : (
                                <div className={styles.progressTrackEmpty} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
