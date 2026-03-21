import { useCombatStore } from '../../store/combatStore';
import styles from './combat.module.scss';

export function DamageSplats({ isPlayer }: { isPlayer: boolean }) {
    const allSplats = useCombatStore(s => s.splats);
    const splats = allSplats.filter(splat => splat.isPlayer === isPlayer);

    return (
        <div className={styles.splatContainer}>
            {splats.map((splat) => (
                <div
                    key={splat.id}
                    className={`${styles.splat} ${
                        splat.type === 'miss' ? styles.splatMiss :
                        splat.type === 'block' ? styles.splatBlock :
                        splat.type === 'heal' ? styles.splatHeal :
                        styles.splatHit
                    }`}
                >
                    {splat.type === 'miss' ? 'MISS' : 
                     splat.type === 'block' ? 'BLOCK' : 
                     splat.amount}
                </div>
            ))}
        </div>
    );
}
