import React from 'react';
import { useSkillingStore } from '../../store/skillingStore';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useCombatEngine } from '../combat/useCombatEngine';
import { getLevelFromXp, getXpForLevel, getXpProgress } from '../../engine/xpTable';
import { ITEM_DATABASE } from '../../data/items';
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

function formatNumber(num: number): string {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getItemName(itemId: string): string {
    const item = ITEM_DATABASE.find(i => i.id === itemId);
    return item ? item.name : itemId;
}

export const SkillingView: React.FC<SkillingViewProps> = ({ skill, nodes, title, description, iconUrl }) => {
    const { skills, getResourceQuantity } = usePlayerStore();
    const { activeNodeId, activeSkill, isActive, progressTimer, requiredTicks, startAction, stopAction } = useSkillingStore();
    const { fleeFromCombat } = useCombatEngine();
    const isCombatRunning = useCombatStore(s => s.isRunning);

    const currentXp = skills[skill]?.xp || 0;
    const level = getLevelFromXp(currentXp);
    const nextLevelXp = getXpForLevel(level + 1);
    const progressPct = getXpProgress(currentXp) * 100;
    const isThisSkillActive = isActive && activeSkill === skill;

    return (
        <div className={styles.container}>
            <header className={styles.premiumPillHeader}>
                <div className={styles.skillNameArea}>
                    {iconUrl && <img src={iconUrl} alt="" className={styles.pillIcon} />}
                    <span className={styles.pillSkillName}>{title}</span>
                </div>
                <div className={styles.skillLevelArea}>
                    <span>Level: {level}</span>
                </div>
                <div className={styles.skillXpArea}>
                    <span>Experience: {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()}</span>
                </div>
                <div className={styles.pillProgressTrack}>
                    <div className={styles.pillProgressBar} style={{ width: `${progressPct}%` }} />
                </div>
            </header>

            <p className={styles.description}>{description}</p>

            <div className={styles.grid}>
                {nodes.map((node) => {
                    const isUnlocked = level >= node.levelReq;
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
                                else if (canStart) {
                                    if (isCombatRunning) {
                                        fleeFromCombat();
                                    }
                                    startAction(node.id, skill);
                                }
                            }}
                        >
                            <div className={`${styles.premiumHeader} ${skill === 'alchemy' ? styles.alchemyHeader : ''}`}>
                                <div className={styles.premiumHeaderLeft}>
                                    <h3 className={styles.premiumNodeName}>{node.name}</h3>
                                    <div className={styles.premiumHeaderDetails}>
                                        <div className={styles.premiumLevelReq}>Level requirement: {node.levelReq}</div>
                                        <div className={styles.premiumXpTimeInfo}>
                                            {node.xp} XP / {(node.timeMs / 1000).toFixed(1)} Seconds
                                        </div>
                                    </div>
                                </div>
                                {skill === 'alchemy' && (
                                    <div className={styles.premiumHeaderRight}>
                                        {node.output.icon ? (
                                            <img src={node.output.icon} alt={node.output.name} className={styles.headerResultImage} />
                                        ) : (
                                            <div className={styles.headerResultImage} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <span style={{fontSize: '24px', opacity: 0.2}}>?</span>
                                            </div>
                                        )}
                                        <div className={styles.tooltip}>
                                            <div className={styles.tooltipLeft}>
                                                <img src={node.output.icon} alt={node.output.name} className={styles.tooltipImg} />
                                                <div className={styles.tooltipQty}>x{getResourceQuantity(node.output.id)}</div>
                                            </div>
                                            <div className={styles.tooltipRight}>
                                                <div className={styles.tooltipName}>{node.output.name}</div>
                                                <div className={styles.tooltipPrice}>💰 Sell: --</div>
                                                <div className={styles.tooltipMarket}>🤝 B: -- | S: --</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {node.ingredients && node.ingredients.length > 0 ? (
                                <div className={styles.cardBodySplit}>
                                    <div className={styles.requirementSection}>
                                        {node.ingredients.map(ing => {
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
                                                    
                                                    <div className={styles.tooltip}>
                                                        <div className={styles.tooltipLeft}>
                                                            <img src={ing.icon} alt={ing.id} className={styles.tooltipImg} />
                                                            <div className={styles.tooltipQty}>x{owned}</div>
                                                        </div>
                                                        <div className={styles.tooltipRight}>
                                                            <div className={styles.tooltipName}>{getItemName(ing.id)}</div>
                                                            <div className={styles.tooltipPrice}>💰 Sell: --</div>
                                                            <div className={styles.tooltipMarket}>🤝 B: -- | S: --</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className={styles.resultSection}>
                                        {skill !== 'alchemy' && (
                                            <>
                                                {node.output.icon ? (
                                                    <img src={node.output.icon} alt={node.output.name} className={styles.resultImage} />
                                                ) : (
                                                    <div className={styles.resultImage} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                        <span style={{fontSize: '32px', opacity: 0.2}}>?</span>
                                                    </div>
                                                )}

                                                <div className={styles.tooltip}>
                                                    <div className={styles.tooltipLeft}>
                                                        <img src={node.output.icon} alt={node.output.name} className={styles.tooltipImg} />
                                                        <div className={styles.tooltipQty}>x{getResourceQuantity(node.output.id)}</div>
                                                    </div>
                                                    <div className={styles.tooltipRight}>
                                                        <div className={styles.tooltipName}>{node.output.name}</div>
                                                        <div className={styles.tooltipPrice}>💰 Sell: --</div>
                                                        <div className={styles.tooltipMarket}>🤝 B: -- | S: --</div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {node.description && (
                                            <div className={styles.nodeDescription}>
                                                {node.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.resultSectionCentered}>
                                    {skill !== 'alchemy' && (
                                        <>
                                            {node.output.icon ? (
                                                <img src={node.output.icon} alt={node.output.name} className={styles.resultImage} />
                                            ) : (
                                                <div className={styles.resultImage} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <span style={{fontSize: '32px', opacity: 0.2}}>?</span>
                                                </div>
                                            )}

                                            <div className={styles.tooltip}>
                                                <div className={styles.tooltipLeft}>
                                                    <img src={node.output.icon} alt={node.output.name} className={styles.tooltipImg} />
                                                    <div className={styles.tooltipQty}>x{getResourceQuantity(node.output.id)}</div>
                                                </div>
                                                <div className={styles.tooltipRight}>
                                                    <div className={styles.tooltipName}>{node.output.name}</div>
                                                    <div className={styles.tooltipPrice}>💰 Sell: --</div>
                                                    <div className={styles.tooltipMarket}>🤝 B: -- | S: --</div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {node.description && (
                                        <div className={styles.nodeDescription}>
                                            {node.description}
                                        </div>
                                    )}
                                </div>
                            )}

                            {skill !== 'alchemy' && (
                                <div className={styles.nodeQty}>
                                    Qty: {formatNumber(getResourceQuantity(node.output.id))}
                                </div>
                            )}

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
