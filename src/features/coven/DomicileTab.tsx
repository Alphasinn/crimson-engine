import styles from './coven.module.scss';

export function DomicileTab() {
    const slots = Array(6).fill(null);

    const passiveEffects = [
        '+2% Bloodletting Yield',
        '+1% Max Health',
        '+3% Refinement Efficiency'
    ];

    return (
        <div className={styles.domicileGrid}>
            {/* Core Status Panel */}
            <div className={styles.statusPanel}>
                <div className={styles.statusItem}>
                    <span className={styles.label}>Domicile Level</span>
                    <span className={styles.value}>1</span>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.label}>Passive Power</span>
                    <span className={styles.value}>0</span>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.label}>Active Effects</span>
                    <span className={styles.value}>Incipient Ward</span>
                </div>
                <div className={styles.statusItem}>
                    <span className={styles.label}>Available Slots</span>
                    <span className={styles.value}>0/6</span>
                </div>
            </div>

            {/* Room / Fixture Grid */}
            <div className={styles.fixtureGrid}>
                {slots.map((_, i) => (
                    <div key={i} className={styles.fixtureSlot}>
                        <span className={styles.slotIcon}>◈</span>
                        <span>Empty Slot</span>
                    </div>
                ))}
            </div>

            {/* Passive Effects Summary */}
            <div className={styles.effectsSummary}>
                <h3>Passive Effects Summary</h3>
                <div className={styles.effectsList}>
                    {passiveEffects.map((effect, i) => (
                        <div key={i} className={styles.effectItem}>{effect}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
