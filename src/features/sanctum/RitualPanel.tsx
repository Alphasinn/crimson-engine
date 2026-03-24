import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import type { RitualDefinition } from '../../engine/types';
import styles from './ritualPanel.module.scss';

const AVAILABLE_RITUALS: RitualDefinition[] = [
    {
        id: 'ritual_frenzy',
        name: 'Ritual of Frenzy',
        description: 'Increase scent gain to attract more powerful prey. Loot quality is significantly improved.',
        modifiers: {
            scentGainMultiplier: 1.5,
            lootQualityMultiplier: 1.2
        }
    },
    {
        id: 'ritual_brace',
        name: 'Ritual of Bracing',
        description: 'Trade movement speed for enhanced physical protection throughout the hunt.',
        modifiers: {
            speedMultiplier: 0.8,
            armorBonus: 15
        }
    }
];

export const RitualPanel: React.FC = () => {
    const { 
        activeRituals, 
        addRitual, 
        removeRitual, 
        nextHuntModifiers 
    } = usePlayerStore();
    const isRunning = useCombatStore(state => state.isRunning);

    const isRitualActive = (id: string) => activeRituals.some(r => r.id === id);

    const toggleRitual = (ritual: RitualDefinition) => {
        if (isRunning) return;
        if (isRitualActive(ritual.id)) {
            removeRitual(ritual.id);
        } else {
            addRitual(ritual);
        }
    };

    return (
        <div className={styles.ritualPanel}>
            <div className={styles.ritualHeader}>
                <h3>Crucible Rituals</h3>
                {isRunning && (
                    <span className={styles.combatWarning}>⚠️ Rituals Locked During Hunt</span>
                )}
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0.5rem 0' }}>
                Prepare the Crucible with dark rites to shape your next hunt. Ritually-infused effects last until the session ends.
            </p>

            <div className={styles.ritualGrid}>
                {AVAILABLE_RITUALS.map(ritual => {
                    const active = isRitualActive(ritual.id);
                    return (
                        <div key={ritual.id} className={`${styles.ritualCard} ${active ? styles.active : ''} ${isRunning ? styles.cardDisabled : ''}`}>
                            <h4>{ritual.name}</h4>
                            <p>{ritual.description}</p>
                            <button 
                                className={`${styles.ritualButton} ${active ? styles.remove : ''}`}
                                onClick={() => toggleRitual(ritual)}
                                disabled={isRunning}
                                title={isRunning ? "Rituals cannot be altered during an active hunt" : ""}
                            >
                                {active ? 'Cancel Ritual' : 'Begin Ritual'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {activeRituals.length > 0 && (
                <div className={styles.modifierSummary}>
                    <h4>Calculated Next Hunt Modifiers</h4>
                    <div className={styles.modifierList}>
                        {nextHuntModifiers.scentGainMultiplier !== 1 && (
                            <div className={styles.modItem}>
                                <span>Scent:</span> {((nextHuntModifiers.scentGainMultiplier - 1) * 100).toFixed(0)}%
                            </div>
                        )}
                        {nextHuntModifiers.lootQualityMultiplier !== 1 && (
                            <div className={styles.modItem}>
                                <span>Loot Quality:</span> +{((nextHuntModifiers.lootQualityMultiplier - 1) * 100).toFixed(0)}%
                            </div>
                        )}
                        {nextHuntModifiers.speedMultiplier !== 1 && (
                            <div className={styles.modItem}>
                                <span>Speed:</span> {((nextHuntModifiers.speedMultiplier - 1) * 100).toFixed(0)}%
                            </div>
                        )}
                        {nextHuntModifiers.maxHpMultiplier !== 1 && (
                            <div className={styles.modItem}>
                                <span>Max HP:</span> {((nextHuntModifiers.maxHpMultiplier - 1) * 100).toFixed(0)}%
                            </div>
                        )}
                        {nextHuntModifiers.armorBonus > 0 && (
                            <div className={styles.modItem}>
                                <span>Flat Armor:</span> +{nextHuntModifiers.armorBonus}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
