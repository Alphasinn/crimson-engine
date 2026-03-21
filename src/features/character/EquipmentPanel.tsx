import { usePlayerStore } from '../../store/playerStore';
import { HpBar } from '@features/ui/HpBar';
import { AttackMeter } from '@features/ui/AttackMeter';
import styles from './equipment.module.scss';
import type { EquipmentSlot } from '../../engine/types';

// Simple, dark minimalist SVGs to act as empty slot silhouettes
const SlotIcons: Record<EquipmentSlot, React.ReactNode> = {
    helmet: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a8 8 0 0 0-8 8v8h16v-8a8 8 0 0 0-8-8zm-4 8a4 4 0 1 1 8 0v2H8v-2z" opacity="0.4"/></svg>,
    amulet: <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="14" r="4"/><path d="M12 2a8 8 0 0 0-6 3l1.5 1.5A6 6 0 0 1 12 4a6 6 0 0 1 4.5 2.5L18 5a8 8 0 0 0-6-3z" opacity="0.4"/></svg>,
    cape:   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l1 16h8l1-16H7z" opacity="0.4"/></svg>,
    ammo:   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 2L11 13l-3-3L2 22l6-4 3 3L22 2z" opacity="0.4"/></svg>,
    weapon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2l6 6-10 10-4 4-2-2 4-4L18 6l-4-4z" opacity="0.4"/></svg>,
    chest:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v11l-3 3v4H9v-4l-3-3V3z" opacity="0.4"/></svg>,
    offhand:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 4v6c0 5.55-3.84 10.74-8 12-4.16-1.26-8-6.45-8-12V6l8-4z" opacity="0.4"/></svg>,
    legs:   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v7l-4 4v7H9v-7L5 10V3h1z" opacity="0.4"/></svg>,
    gloves: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7a2 2 0 0 0-2 2v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5a2 2 0 0 0-2-2z" opacity="0.4"/></svg>,
    boots:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 10v9a2 2 0 0 0 2 2h4v-3H9v-8H5zm10 0v8h-2v3h4a2 2 0 0 0 2-2v-9h-4z" opacity="0.4"/></svg>,
    ring:   <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.4"/><circle cx="12" cy="6" r="2"/></svg>,
};

interface EquipmentPanelProps {
    hpProps?: {
        current: number;
        max: number;
        label: React.ReactNode;
        color: string;
    };
    meterProps?: {
        value: number;
        label: string;
        color: string;
    };
}

export function EquipmentPanel({ hpProps, meterProps }: EquipmentPanelProps) {
    const { equipment } = usePlayerStore();

    // Map our strict 11 slots to the classic 3x5 layout
    // null signifies an empty space in the grid for layout purposes
    const layout: (EquipmentSlot | null)[] = [
        null,     'helmet', null,      // Row 1
        'cape',   'amulet', 'ammo',    // Row 2
        'weapon', 'chest',  'offhand', // Row 3
        'gloves', 'legs',   'ring',    // Row 4
        null,     'boots',  null       // Row 5
    ];

    return (
        <div className={styles.equipmentContainer}>
            <div className={styles.grid}>
                {layout.map((slotKey, idx) => {
                    if (slotKey === null) {
                        return <div key={`empty-${idx}`} className={styles.gridSpacer} />;
                    }

                    const item = equipment[slotKey];

                    return (
                        <div key={slotKey} className={styles.slot}>
                            {item ? (
                                // Real equipment would render here (imagine an image tag)
                                <div className={styles.filledSlot} title={item.name}>
                                    <span className={styles.itemInitial}>{item.name.charAt(0)}</span>
                                </div>
                            ) : (
                                // Empty Silhouette
                                <div className={styles.emptySlot} title={`Empty ${slotKey} slot`}>
                                    {SlotIcons[slotKey]}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Render Player Stats Below the Grid */}
            <div className={styles.statsContainer}>
                {hpProps && (
                    <HpBar
                        current={hpProps.current}
                        max={hpProps.max}
                        label={hpProps.label}
                        color={hpProps.color}
                    />
                )}
                {meterProps && (
                    <AttackMeter
                        value={meterProps.value}
                        label={meterProps.label}
                        color={meterProps.color}
                    />
                )}
            </div>
        </div>
    );
}
