import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import styles from './resourceHUD.module.scss';

// Icons with background removed (Phase 2B)
import iconShard from '../../assets/icons/blood_shard.png';
import iconIchor from '../../assets/icons/cursed_ichor.png';
import iconSteel from '../../assets/icons/grave_steel.png';

export const ResourceHUD: React.FC = () => {
    const { 
        bloodShards, 
        cursedIchor, 
        graveSteel,
        unbankedShards,
        unbankedIchor,
        unbankedSteel
    } = usePlayerStore();

    return (
        <div className={styles.hudContainer}>
            <div className={styles.resourceItem} title="Blood Shards (Banked / Unbanked)">
                <img src={iconShard} alt="Shards" className={styles.resourceIcon} />
                <div className={styles.statStack}>
                    <span className={styles.bankedValue}>{bloodShards}</span>
                    {unbankedShards > 0 && <span className={styles.unbankedValue}>+{unbankedShards}</span>}
                </div>
            </div>

            <div className={styles.resourceItem} title="Cursed Ichor (Banked / Unbanked)">
                <img src={iconIchor} alt="Ichor" className={styles.resourceIcon} />
                <div className={styles.statStack}>
                    <span className={styles.bankedValue}>{cursedIchor}</span>
                    {unbankedIchor > 0 && <span className={styles.unbankedValue}>+{unbankedIchor}</span>}
                </div>
            </div>

            <div className={styles.resourceItem} title="Grave-Steel (Banked / Unbanked)">
                <img src={iconSteel} alt="Steel" className={styles.resourceIcon} />
                <div className={styles.statStack}>
                    <span className={styles.bankedValue}>{graveSteel}</span>
                    {unbankedSteel > 0 && <span className={styles.unbankedValue}>+{unbankedSteel}</span>}
                </div>
            </div>
        </div>
    );
};
