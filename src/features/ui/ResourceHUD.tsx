import React from 'react';
import { usePlayerStore } from '../../store/playerStore';
import styles from './ResourceHUD.module.scss';

import iconShard from '../../assets/icons/blood_shard.png';
import iconSteel from '../../assets/icons/grave_steel.png';
import iconIchor from '../../assets/icons/cursed_ichor.png';
import iconStabilized from '../../assets/icons/stabilized_ichor.png';

export const ResourceHUD: React.FC = () => {
    const { 
        bloodShards, unbankedShards,
        graveSteel, unbankedSteel,
        cursedIchor, unbankedIchor,
        stabilizedIchor
    } = usePlayerStore();

    return (
        <div className={styles.hud}>
            <div className={styles.resourceGroup}>
                <div className={styles.resource} title="Banked Blood Shards (Used for survival & refinement)">
                    <img src={iconShard} alt="" className={styles.resourceIcon} />
                    <span className={styles.value}>{bloodShards.toLocaleString()}</span>
                    {unbankedShards > 0 && (
                        <span className={styles.unbanked} title="Unbanked (Lose 50% on death)">
                            +{unbankedShards.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className={styles.resource} title="Banked Grave-Steel (Structural material for gear)">
                    <img src={iconSteel} alt="" className={styles.resourceIcon} />
                    <span className={styles.value}>{graveSteel.toLocaleString()}</span>
                    {unbankedSteel > 0 && (
                        <span className={styles.unbanked} title="Unbanked (Persistent if escaped)">
                            +{unbankedSteel.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className={styles.resource} title="Banked Cursed Ichor (Essence for transmutation)">
                    <img src={iconIchor} alt="" className={styles.resourceIcon} />
                    <span className={styles.value}>{cursedIchor.toLocaleString()}</span>
                    {unbankedIchor > 0 && (
                        <span className={styles.unbanked} title="Unbanked (Lose 100% on death)">
                            +{unbankedIchor.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className={styles.resource} title="Stabilized Ichor (Final Tier-Shift reagent)">
                    <img src={iconStabilized} alt="" className={styles.resourceIcon} />
                    <span className={styles.value}>{stabilizedIchor.toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
};
