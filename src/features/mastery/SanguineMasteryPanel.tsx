import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import iconShard from '../../assets/icons/blood_magic.png';
import styles from './mastery.module.scss';

const MASTERY_UPGRADES = [
    {
        id: 'auto_eat',
        title: 'Auto-Vita',
        description: 'An innate reflex to draw life from your blood-orange stores when your body falters in the heat of battle.',
        cost: 500,
        icon: '🩸',
    },
    {
        id: 'auto_loot',
        title: 'Auto-Loot',
        description: 'Your vampiric spirit reaches out to claim the essence and treasures of fallen foes instantly, without a thought.',
        cost: 1500,
        icon: '💎',
    },
] as const;

export const SanguineMasteryPanel: React.FC = () => {
    const { 
        bloodShards, 
        unlockedUpgrades, 
        unlockUpgrade, 
        autoLootEnabled, 
        autoEatEnabled,
        toggleAutoLoot,
        toggleAutoEat
    } = usePlayerStore();

    const handleUnlock = (upgradeId: string, cost: number) => {
        if (bloodShards >= cost) {
            // Deduct shards
            usePlayerStore.setState((state) => ({
                bloodShards: state.bloodShards - cost
            }));
            
            // Call the store's unlock action
            unlockUpgrade(upgradeId as any);
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.altarHeader}>
                <h3 className={styles.altarTitle}>Altar of Mastery</h3>
                <p className={styles.altarDesc}>Sacrifice shards to evolve your innate vampiric senses.</p>
            </div>

            <div className={styles.masteryGrid}>
                {MASTERY_UPGRADES.map((upgrade) => {
                    const isUnlocked = unlockedUpgrades.includes(upgrade.id);
                    const canAfford = bloodShards >= upgrade.cost;
                    const isEnabled = upgrade.id === 'auto_eat' ? autoEatEnabled : autoLootEnabled;
                    const toggleFn = upgrade.id === 'auto_eat' ? toggleAutoEat : toggleAutoLoot;

                    return (
                        <div key={upgrade.id} className={`${styles.masteryCard} ${isUnlocked ? styles.unlocked : ''}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconCircle}>
                                    <span className={styles.upgradeIcon}>{upgrade.icon}</span>
                                </div>
                                <div className={styles.titleGroup}>
                                    <h4 className={styles.upgradeTitle}>{upgrade.title}</h4>
                                    <span className={styles.statusBadge}>
                                        {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                                    </span>
                                </div>
                            </div>

                            <p className={styles.upgradeDesc}>{upgrade.description}</p>

                            <div className={styles.cardAction}>
                                {!isUnlocked ? (
                                    <div className={styles.unlockArea}>
                                        <div className={styles.costBadge}>
                                            <img src={iconShard} alt="" className={styles.costIcon} />
                                            <span>{upgrade.cost}</span>
                                        </div>
                                        <button 
                                            className={styles.unlockBtn}
                                            disabled={!canAfford}
                                            onClick={() => handleUnlock(upgrade.id, upgrade.cost)}
                                        >
                                            {canAfford ? 'AWAKEN POWER' : 'INSUFFICIENT SHARDS'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.controlArea}>
                                        <div className={styles.toggleGroup}>
                                            <span className={styles.toggleLabel}>
                                                {isEnabled ? 'ENABLED' : 'DISABLED'}
                                            </span>
                                            <button 
                                                className={`${styles.toggleBtn} ${isEnabled ? styles.on : ''}`}
                                                onClick={() => toggleFn()}
                                            >
                                                <div className={styles.toggleSlider} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.footerNote}>
                <p>Mastery unlocks are permanent and persist across all hunts.</p>
            </div>
        </div>
    );
};
