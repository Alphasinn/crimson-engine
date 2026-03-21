import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import styles from './loot.module.scss';

interface Props {
    onOpenCombatGains: () => void;
    onOpenHuntingGains: () => void;
}

export function SessionReport({ onOpenCombatGains, onOpenHuntingGains }: Props) {
    const { 
        autoLootEnabled, 
        unlockedUpgrades,
        toggleAutoLoot, 
        claimAllLoot,
        lootHistory
    } = usePlayerStore();
    const { isRunning } = useCombatStore();

    const isAutoLootUnlocked = unlockedUpgrades.includes('auto_loot');

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <h3>Session Report</h3>
            </header>

            <div className={styles.controls}>
                <label className={styles.autoLootToggle} title={!isAutoLootUnlocked ? "Upgrade required in Shop" : ""}>
                    <input 
                        type="checkbox" 
                        checked={autoLootEnabled} 
                        onChange={toggleAutoLoot} 
                        disabled={!isAutoLootUnlocked}
                    />
                    <span>Auto Loot</span>
                    {!isAutoLootUnlocked && <span className={styles.lockedBadge}>Locked</span>}
                </label>
                <button 
                    className={styles.claimAllBtn} 
                    onClick={claimAllLoot}
                    disabled={lootHistory.length === 0}
                >
                    Claim All
                </button>
            </div>

            <div className={styles.reportButtons}>
                <button 
                    className={styles.reportBtn}
                    onClick={onOpenCombatGains}
                    disabled={!isRunning}
                >
                    <span>📊</span> Combat Gains
                </button>
                <button 
                    className={styles.reportBtn}
                    onClick={onOpenHuntingGains}
                    disabled={!isRunning}
                >
                    <span>📜</span> Hunting Gains
                </button>
            </div>

            <div className={styles.footer}>
                <p>Detailed stats and items found during your current hunt.</p>
            </div>
        </div>
    );
}
