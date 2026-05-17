import React from 'react';
import styles from './OfflineSummaryModal.module.scss';
import type { OfflineProgressResult } from '../../engine/offlineProgression';

interface Props {
    result: OfflineProgressResult;
    onClose: () => void;
}

export const OfflineSummaryModal: React.FC<Props> = ({ result, onClose }) => {
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const h = hours;
        const m = minutes % 60;
        const s = seconds % 60;
        
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <header className={styles.header}>
                    <h2>Offline Progress</h2>
                    <span className={styles.timeAway}>Away for: {formatTime(result.timeAwayMs)}</span>
                    {result.cappedTimeMs < result.timeAwayMs && (
                        <span className={styles.capped}> (Capped at {formatTime(result.cappedTimeMs)})</span>
                    )}
                </header>

                <div className={styles.content}>
                    {result.defeated && (
                        <div className={styles.defeatBanner}>
                            ⚠️ You ran out of food and were defeated! Progress stopped early.
                        </div>
                    )}

                    {result.combatKills > 0 && (
                        <div className={styles.section}>
                            <h3>Combat Results</h3>
                            <p>Enemies Slain: {result.combatKills}</p>
                        </div>
                    )}

                    {Object.keys(result.skillGains).length > 0 && (
                        <div className={styles.section}>
                            <h3>Skills</h3>
                            <ul>
                                {Object.entries(result.skillGains).map(([skill, gain]) => (
                                    <li key={skill}>
                                        <span className={styles.skillName}>{skill}</span>: +{gain?.xp} XP ({gain?.actions} actions)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {Object.keys(result.itemGains).length > 0 && (
                        <div className={styles.section}>
                            <h3>Items Produced</h3>
                            <ul>
                                {Object.entries(result.itemGains).map(([itemId, quantity]) => (
                                    <li key={itemId}>
                                        {itemId}: +{quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {Object.keys(result.itemConsumed).length > 0 && (
                        <div className={styles.section}>
                            <h3>Materials Consumed</h3>
                            <ul>
                                {Object.entries(result.itemConsumed).map(([itemId, quantity]) => (
                                    <li key={itemId}>
                                        {itemId}: -{quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <footer className={styles.footer}>
                    <button className={styles.closeBtn} onClick={onClose}>Continue</button>
                </footer>
            </div>
        </div>
    );
};
