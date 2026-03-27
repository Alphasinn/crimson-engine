import { useState } from 'react';
import { useCombatStore } from '../../store/combatStore';
import { usePlayerStore } from '../../store/playerStore';
import { ITEM_MAP } from '../../data/items';
import styles from './sessionSummary.module.scss';
import iconHp from '../../assets/icons/hp.png';
import iconAttack from '../../assets/icons/attack.png';

interface Props {
    active?: boolean;
    onClose?: () => void;
}

export const SessionSummaryModal: React.FC<Props> = ({ active, onClose }) => {
    const { lastSession, sessionStats, clearLastSession, huntEvaluation } = useCombatStore();
    const { lootHistory, claimAllLoot } = usePlayerStore();

    const data = active ? sessionStats : lastSession;

    const [now] = useState(Date.now());

    const formattedTime = (() => {
        if (!data) return '0s';
        const end = active ? now : (data.endTime || now);
        const diff = end - data.startTime;
        const totalSec = Math.floor(diff / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    })();

    if (!data) return null;

    const handleClose = () => {
        if (active && onClose) {
            onClose();
        } else {
            clearLastSession();
        }
    };

    const handleClaimAll = () => {
        claimAllLoot();
        handleClose();
    };

    // Helper to get icon for loot (shared with LootPanel logic)
    const getIcon = (id: string, name: string) => {
        const template = ITEM_MAP.get(id);
        if (template && (template as any).icon) {
            return <img src={(template as any).icon} alt={name} style={{ width: '16px', height: '16px' }} />;
        }
        
        if (id.includes('coin')) return '🪙';
        if (id.includes('cloth') || id.includes('pelt') || id.includes('fur')) return '🧶';
        if (id.includes('dagger') || id.includes('sword') || id.includes('blade')) return '🗡️';
        if (id.includes('bone') || id.includes('fragment')) return '☠️';
        return '📦';
    };

    // Group loot items for the display
    const groupedLoot = data.lootItems.reduce((acc, item) => {
        const existing = acc.find(i => i.itemId === item.itemId);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            acc.push({ ...item });
        }
        return acc;
    }, [] as typeof data.lootItems);

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 className={`${styles.title} ${data.wasSlain ? styles.slainTitle : ''}`}>
                    {data.wasSlain ? '☠️ SLAIN IN COMBAT' : 'Hunting Gains'}
                </h2>
                <div className={styles.subtitle}>
                    {active ? '🚩 Resources At Risk' : (data.wasSlain ? '⚠️ Partially Recovered' : '✅ Secured in Bank')}
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>⌛ Time Spent</div>
                        <div className={styles.statValue}>{formattedTime}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}><img src={iconAttack} alt="" className={styles.miniIcon} /> Kills</div>
                        <div className={styles.statValue}>{data.kills}</div>
                    </div>
                    {data.bossesSlain > 0 && (
                        <div className={styles.statCard} style={{ borderColor: '#d4af37' }}>
                            <div className={styles.statLabel} style={{ color: '#d4af37' }}>🏆 Bosses Slain</div>
                            <div className={styles.statValue}>{data.bossesSlain}</div>
                        </div>
                    )}
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}><img src={iconHp} alt="" className={styles.miniIcon} /> XP Gained</div>
                        <div className={styles.statValue}>{data.xpGained.toLocaleString()}</div>
                    </div>
                    {(data.bloodShardsGained > 0 || data.cursedIchorGained > 0 || data.graveSteelGained > 0) && (
                        <>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>💎 Shards</div>
                                <div className={styles.statValue}>+{data.bloodShardsGained}</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>💧 Ichor</div>
                                <div className={styles.statValue}>+{data.cursedIchorGained}</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>🔩 Grave-Steel</div>
                                <div className={styles.statValue}>+{data.graveSteelGained}</div>
                            </div>
                        </>
                    )}
                </div>

                {huntEvaluation && (
                    <div className={styles.evaluationArea}>
                        <div className={styles.evaluationHeader}>
                            <span>Sanctum Evaluation</span>
                            <span className={huntEvaluation.isValid ? styles.evalValid : styles.evalInvalid}>
                                {huntEvaluation.isValid ? 'CRUCIBLE UNSEALED' : 'CRUCIBLE SEALED'}
                            </span>
                        </div>
                        <div className={styles.qualityRow}>
                            <div className={styles.qualityTrack}>
                                <div 
                                    className={styles.qualityFill} 
                                    style={{ 
                                        width: `${huntEvaluation.quality * 100}%`,
                                        background: huntEvaluation.isValid ? '#22c55e' : '#6b7280'
                                    }}
                                />
                            </div>
                            <span className={styles.qualityPct}>{Math.round(huntEvaluation.quality * 100)}% Quality</span>
                        </div>
                        <div className={styles.evalReason}>{huntEvaluation.reason}</div>
                    </div>
                )}

                <div className={styles.lootSection}>
                    <div className={styles.lootHeader}>Items Found ({data.lootCount})</div>
                    <div className={styles.lootGrid}>
                        {groupedLoot.length === 0 ? (
                            <div className={styles.noLoot}>No items found this session.</div>
                        ) : (
                            groupedLoot.map(item => (
                                <div key={item.itemId} className={styles.lootItem} title={item.itemName}>
                                    <span className={styles.lootIcon}>{getIcon(item.itemId, item.itemName)}</span>
                                    <span className={styles.lootQty}>x{item.quantity}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.okBtn} onClick={handleClose}>
                        {active ? 'Close' : 'Back to Hunting'}
                    </button>
                    {!active && (data.lootCount > 0 || lootHistory.length > 0) && (
                        <button className={styles.claimBtn} onClick={handleClaimAll}>
                            Claim & Bank All
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
