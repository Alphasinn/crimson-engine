import type React from 'react';
import styles from '../combat/combat.module.scss'; // Reusing existing styles for now

interface HpBarProps {
    current: number;
    max: number;
    label: React.ReactNode;
    color: string;
}

export function HpBar({ current, max, label, color }: HpBarProps) {
    const safeCurrent = Number.isNaN(current) ? 0 : Math.max(0, current);
    const safeMax = Number.isNaN(max) || max <= 0 ? 1 : max;
    const pct = Math.min((safeCurrent / safeMax) * 100, 100);

    return (
        <div className={styles.hpWrap}>
            {label && (
                <div className={styles.hpLabel}>
                    <span>{label}</span>
                    <span>{Math.floor(safeCurrent)} / {Math.floor(safeMax)}</span>
                </div>
            )}
            <div className={styles.hpTrack}>
                <div
                    className={styles.hpFill}
                    style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        transition: 'width 0.2s ease-out'
                    }}
                />
            </div>
        </div>
    );
}
