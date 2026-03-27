import React, { useMemo, useState, useEffect } from 'react';
import { useCombatStore } from '../../store/combatStore';
import { calculateRates } from '../../engine/statsUtils';
import styles from './idleGain.module.scss';

interface Props {
    onClose: () => void;
}

export const IdleGainPanel: React.FC<Props> = ({ onClose }) => {
    const { statsWindow, statsStartTime, isRunning, selectedZone } = useCombatStore();

    const [now, setNow] = useState(Date.now());
    
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const rates = useMemo(() => {
        if (!statsStartTime) return null;
        const timeSpanMs = now - statsStartTime;
        return calculateRates(statsWindow, timeSpanMs);
    }, [statsWindow, statsStartTime, now]);

    if (!isRunning || !rates || !selectedZone) {
        return null;
    }

    const getConfidenceColor = (conf: typeof rates.confidence) => {
        switch (conf) {
            case 'Safe': return '#4caf50';
            case 'Risky': return '#ff9800';
            case 'Deadly': return '#f44336';
            default: return '#ccc';
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                <div className={styles.header}>
                    <span className={styles.zoneName}>{selectedZone.name}</span>
                    <span 
                        className={styles.confidence} 
                        style={{ color: getConfidenceColor(rates.confidence) }}
                    >
                        {rates.confidence}
                    </span>
                </div>
                
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span className={styles.label}>XP/hr</span>
                        <span className={styles.value}>{rates.xpPerHour.toLocaleString()}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.label}>Loot/hr</span>
                        <span className={styles.value}>{rates.lootPerHour.toLocaleString()}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.label}>Kills/hr</span>
                        <span className={styles.value}>{rates.killsPerHour.toLocaleString()}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.label}>Avg Kill</span>
                        <span className={styles.value}>{rates.avgKillTime}s</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.label}>Survival</span>
                        <span className={styles.value}>{rates.survivalRate}%</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.label}>Deaths/hr</span>
                        <span className={styles.value}>{rates.deathsPerHour}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
