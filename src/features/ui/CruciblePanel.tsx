import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import styles from './crucible.module.scss';
import iconShard from '../../assets/icons/blood_shard.png';
import iconSteel from '../../assets/icons/grave_steel.png';
import iconIchor from '../../assets/icons/cursed_ichor.png';

export const CruciblePanel: React.FC = () => {
    const { 
        bloodShards, graveSteel, cursedIchor, stabilizedIchor, 
        currentVitae, skills,
        siphon, stabilizeIchor, sanguineFinesse, vileReinforcement, tierShift 
    } = usePlayerStore();
    const { isRunning, playerMaxHp } = useCombatStore();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>The Blood Crucible</h2>
                <div className={styles.info}>Transmute raw essence into vampiric power.</div>
            </div>

            <div className={styles.upgradeGrid}>
                {/* Siphon Vitae */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>💉</span>
                        <div className={styles.cardTitle}>Siphon Vitae</div>
                    </div>
                    <div className={styles.cardDesc}>Heal 20% of Max HP instantly.</div>
                    <div className={styles.costRow}>
                        <img src={iconShard} alt="" className={styles.miniIcon} />
                        <span>10 Shards</span>
                    </div>
                    <button 
                        className={styles.upgradeBtn}
                        onClick={() => siphon(playerMaxHp, 10)}
                        disabled={bloodShards < 10 || currentVitae >= playerMaxHp}
                    >
                        Consume
                    </button>
                </div>

                {/* Sanguine Finesse */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>⚡</span>
                        <div className={styles.cardTitle}>Sanguine Finesse</div>
                    </div>
                    <div className={styles.cardDesc}>+20% Attack Speed for 200 ticks.</div>
                    <div className={styles.costRow}>
                        <img src={iconShard} alt="" className={styles.miniIcon} />
                        <span>15 Shards</span>
                    </div>
                    <button 
                        className={styles.upgradeBtn}
                        onClick={sanguineFinesse}
                        disabled={bloodShards < 15}
                    >
                        Activate
                    </button>
                </div>

                {/* Vile Reinforcement */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>🛡️</span>
                        <div className={styles.cardTitle}>Vile Reinforcement</div>
                    </div>
                    <div className={styles.cardDesc}>+5 Armor & 50% Shard preservation on death.</div>
                    <div className={styles.costRow}>
                        <img src={iconShard} alt="" className={styles.miniIcon} /> 30
                        <img src={iconSteel} alt="" className={styles.miniIcon} /> 10
                    </div>
                    <button 
                        className={styles.upgradeBtn}
                        onClick={vileReinforcement}
                        disabled={bloodShards < 30 || graveSteel < 10}
                    >
                        Brace
                    </button>
                </div>

                {/* Ichor Stabilization */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>🧪</span>
                        <div className={styles.cardTitle}>Stabilize Ichor</div>
                    </div>
                    <div className={styles.cardDesc}>Transmute raw Ichor into Stabilized Ichor.</div>
                    <div className={styles.costRow}>
                        <img src={iconShard} alt="" className={styles.miniIcon} /> 125
                        <img src={iconIchor} alt="" className={styles.miniIcon} /> 1
                    </div>
                    <button 
                        className={styles.upgradeBtn}
                        onClick={stabilizeIchor}
                        disabled={bloodShards < 125 || cursedIchor < 1}
                    >
                        Distill
                    </button>
                </div>

                {/* Tier Shift */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>🔺</span>
                        <div className={styles.cardTitle}>Tier Shift</div>
                    </div>
                    <div className={styles.cardDesc}>Evolve to Tier II. (Unlock higher zones)</div>
                    <div className={styles.costRow}>
                        <img src={iconShard} alt="" className={styles.miniIcon} /> 200
                        <img src={iconIchor} alt="" className={styles.miniIcon} /> 3
                        <img src={iconSteel} alt="" className={styles.miniIcon} /> 25
                    </div>
                    <button 
                        className={styles.upgradeBtn}
                        onClick={tierShift}
                        disabled={bloodShards < 200 || stabilizedIchor < 3 || graveSteel < 25}
                    >
                        Evolve
                    </button>
                </div>
            </div>
        </div>
    );
};
