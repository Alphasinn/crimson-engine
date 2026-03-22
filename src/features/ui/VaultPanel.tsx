import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useCombatEngine } from '../combat/useCombatEngine';
import styles from './VaultPanel.module.scss';

import iconBloodShard from '../../assets/icons/blood_shard.png';
import iconGraveSteel from '../../assets/icons/grave_steel.png';
import iconCursedIchor from '../../assets/icons/cursed_ichor.png';

export const VaultPanel: React.FC = () => {
    const { 
        unbankedShards, unbankedSteel, unbankedIchor, 
        withdraw 
    } = usePlayerStore();
    
    // We check if combat is running so we can force a flee
    const { isRunning } = useCombatStore();
    const { fleeFromCombat } = useCombatEngine();

    const hasUnbankedLoot = unbankedShards > 0 || unbankedSteel > 0 || unbankedIchor > 0;

    const handleDeposit = () => {
        if (!hasUnbankedLoot) return;
        
        // As requested by user, banking forces a flee
        if (isRunning) {
            fleeFromCombat();
        }
        
        // Execute the actual 'banking' transfer
        withdraw();
    };

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h3>THE VAULT</h3>
                </div>
            </header>

            {!hasUnbankedLoot ? (
                <p className={styles.emptyState}>No unbanked loot to deposit.</p>
            ) : (
                <>
                    <div className={styles.lootGrid}>
                        {unbankedShards > 0 && (
                            <div className={styles.lootItem}>
                                <img src={iconBloodShard} alt="Shards" className={styles.icon} />
                                <span className={styles.amount}>+{unbankedShards}</span>
                                <span className={styles.label}>Blood Shards</span>
                            </div>
                        )}
                        {unbankedSteel > 0 && (
                            <div className={styles.lootItem}>
                                <img src={iconGraveSteel} alt="Steel" className={styles.icon} />
                                <span className={styles.amount}>+{unbankedSteel}</span>
                                <span className={styles.label}>Grave Steel</span>
                            </div>
                        )}
                        {unbankedIchor > 0 && (
                            <div className={styles.lootItem}>
                                <img src={iconCursedIchor} alt="Ichor" className={styles.icon} />
                                <span className={styles.amount}>+{unbankedIchor}</span>
                                <span className={styles.label}>Cursed Ichor</span>
                            </div>
                        )}
                    </div>
                    <button 
                        className={styles.depositBtn}
                        onClick={handleDeposit}
                    >
                        Deposit All Loot
                    </button>
                    {isRunning && (
                        <small className={styles.warningText}>
                            Warning: Depositing will force your vanguard to flee combat.
                        </small>
                    )}
                </>
            )}
        </div>
    );
};
