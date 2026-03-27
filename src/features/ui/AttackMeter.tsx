import { useRef, useEffect } from 'react';
import styles from '../combat/combat.module.scss';

interface AttackMeterProps {
    value: number;
    label?: string;
    color: string;
}

export function AttackMeter({ value, label, color }: AttackMeterProps) {
    const safeValue = Number.isNaN(value) ? 0 : value;
    const pct = Math.min(safeValue * 100, 100);
    
    // We use a ref to track the previous value without triggering re-renders
    const prevValueRef = useRef(safeValue);
    
    // Determine if we should animate. 
    // We don't animate when the bar resets (0.99 -> 0.0)
    const isResetting = safeValue < prevValueRef.current;
    
    useEffect(() => {
        prevValueRef.current = safeValue;
    });

    return (
        <div className={styles.meterWrap}>
            {label && <div className={styles.meterLabel}>{label}</div>}
            <div className={styles.meterTrack}>
                <div
                    className={styles.meterFill}
                    style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        transition: isResetting ? 'none' : 'width 100ms linear'
                    }}
                />
            </div>
            <div className={styles.meterPct}>{Math.floor(pct)}%</div>
        </div>
    );
}
