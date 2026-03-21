import React, { useMemo } from 'react';
import { useCombatStore } from '../../store/combatStore';
import styles from './sessionSummary.module.scss';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconHp from '../../assets/icons/hp.png';
import iconAttack from '../../assets/icons/attack.png';

interface Props {
    active?: boolean;
    onClose?: () => void;
}

export const SessionSummaryModal: React.FC<Props> = ({ active, onClose }) => {
    const { lastSession, sessionStats, clearLastSession } = useCombatStore();

    const data = active ? sessionStats : lastSession;

    const formattedTime = useMemo(() => {
        if (!data) return '0s';
        const end = active ? Date.now() : (data.endTime || Date.now());
        const diff = end - data.startTime;
        const totalSec = Math.floor(diff / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }, [data, active]);

    if (!data) return null;

    const handleClose = () => {
        if (active && onClose) {
            onClose();
        } else {
            clearLastSession();
        }
    };

    // Helper to get icon for loot (shared with LootPanel logic)
    const getIcon = (id: string) => {
        if (id.includes('coin')) return '🪙';
        if (id.includes('cloth') || id.includes('pelt') || id.includes('fur')) return '🧶';
        if (id.includes('dagger') || id.includes('sword') || id.includes('blade')) return '🗡️';
        if (id.includes('blood') || id.includes('vial') || id.includes('essence')) return <img src={iconMagic} alt="Blood" style={{ width: '16px', height: '16px' }} />;
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
                    {active ? 'Current Hunt' : (data.wasSlain ? 'DEFEATED' : 'Session Complete')}
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
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}><img src={iconHp} alt="" className={styles.miniIcon} /> XP Gained</div>
                        <div className={styles.statValue}>{data.xpGained.toLocaleString()}</div>
                    </div>
                </div>

                <div className={styles.lootSection}>
                    <div className={styles.lootHeader}>Items Found ({data.lootCount})</div>
                    <div className={styles.lootGrid}>
                        {groupedLoot.length === 0 ? (
                            <div className={styles.noLoot}>No items found this session.</div>
                        ) : (
                            groupedLoot.map(item => (
                                <div key={item.itemId} className={styles.lootItem} title={item.itemName}>
                                    <span className={styles.lootIcon}>{getIcon(item.itemId)}</span>
                                    <span className={styles.lootQty}>x{item.quantity}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <button className={styles.okBtn} onClick={handleClose}>
                    {active ? 'Close' : 'Back to Hunting'}
                </button>
            </div>
        </div>
    );
};
