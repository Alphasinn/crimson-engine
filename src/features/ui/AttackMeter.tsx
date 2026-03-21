import { useRef, useEffect } from 'react';
import styles from '../combat/combat.module.scss'; // Reusing existing styles for now

interface AttackMeterProps {
    value: number;
    label: string;
    color: string;
}

export function AttackMeter({ value, label, color }: AttackMeterProps) {
    const safeValue = Number.isNaN(value) ? 0 : value;
    const pct = Math.min(safeValue * 100, 100);
    const prevValueRef = useRef(safeValue);
    
    // Disable transition when resetting (e.g. 100% -> 0%)
    const isIncreasing = safeValue > prevValueRef.current;
    const transition = isIncreasing ? 'width 0.1s linear' : 'none';
    
    useEffect(() => {
        prevValueRef.current = safeValue;
    }, [safeValue]);

    return (
        <div className={styles.meterWrap}>
            {label && <div className={styles.meterLabel}>{label}</div>}
            <div className={styles.meterTrack}>
                <div
                    className={styles.meterFill}
                    style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        transition
                    }}
                />
            </div>
            <div className={styles.meterPct}>{Math.floor(pct)}%</div>
        </div>
    );
}
