import React, { useMemo } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useShallow } from 'zustand/react/shallow';
import styles from './combat.module.scss';

// Skill Icons for Preparation Hub
import iconAttack from '../../assets/icons/attack.png';
import iconStrength from '../../assets/icons/strength.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconHp from '../../assets/icons/hp.png';
import iconAll from '../../assets/icons/all.png';

const SKILL_ICONS: Record<string, string> = {
    fangMastery: iconAttack,
    predatorForce: iconStrength,
    obsidianWard: iconDefense,
    shadowArchery: iconArchery,
    bloodSorcery: iconMagic,
    vitae: iconHp
};

const SKILL_LABELS: Record<string, string> = {
    fangMastery: 'FANG MASTERY',
    predatorForce: 'PREDATOR FORCE',
    obsidianWard: 'OBSIDIAN WARD',
    shadowArchery: 'SHADOW ARCHERY',
    bloodSorcery: 'BLOOD SORCERY',
    vitae: 'VITAE'
};

interface PrepAreaProps {
    showZoneGrid?: boolean;
}

export const PrepArea = React.memo(({ showZoneGrid }: PrepAreaProps) => {
    const { 
        skills, trainingMode, setTrainingMode, 
        autoEatEnabled, autoEatThreshold, toggleAutoEat,
        setAutoEatThreshold, unlockedUpgrades
    } = usePlayerStore(useShallow(s => ({
        skills: s.skills,
        trainingMode: s.trainingMode,
        setTrainingMode: s.setTrainingMode,
        autoEatEnabled: s.autoEatEnabled,
        autoEatThreshold: s.autoEatThreshold,
        toggleAutoEat: s.toggleAutoEat,
        setAutoEatThreshold: s.setAutoEatThreshold,
        unlockedUpgrades: s.unlockedUpgrades
    })));

    const { scentIntensity, activeEvent, isRunning, currentTick, viewMode, setViewMode } = useCombatStore(useShallow(s => ({
        scentIntensity: s.scentIntensity,
        activeEvent: s.activeEvent,
        isRunning: s.isRunning,
        currentTick: s.currentTick,
        viewMode: s.viewMode,
        setViewMode: s.setViewMode
    })));

    const crucibleSealed = usePlayerStore(s => s.crucibleSealed);

    const getScourgeDescription = (eventName: string | null) => {
        switch (eventName) {
            case 'Bloodlust': return 'Enemy Accuracy +10%';
            case 'Hemophilic Curse': return 'Vampire Damage Taken +15%';
            case 'Razor Fangs': return 'Enemy Attack Speed +10%';
            default: return '';
        }
    };

    // Determine weapon style for training modes
    // Note: This requires equipment, but we can simplify or pass it in.
    // For now, let's keep it self-contained by picking equipment from store.
    const equipment = usePlayerStore(s => s.equipment);
    const weapon = equipment.weapon;
    const weaponStyle = weapon?.style || 'melee';

    const modeOptions = useMemo(() => {
        if (weaponStyle === 'archery') {
            return [
                { mode: 'archery' as const, label: <span><img src={iconArchery} className={styles.statIcon} alt="" /> Shadow</span> },
                { mode: 'warding_archery' as const, label: <span><img src={iconDefense} className={styles.statIcon} alt="" /> Ward</span> },
            ];
        }
        if (weaponStyle === 'sorcery') {
            return [
                { mode: 'sorcery' as const, label: <span><img src={iconMagic} className={styles.statIcon} alt="" /> Blood</span> },
                { mode: 'warding_sorcery' as const, label: <span><img src={iconDefense} className={styles.statIcon} alt="" /> Ward</span> },
            ];
        }
        return [
            { mode: 'attack' as const,    label: <><img src={iconAttack} className={styles.statIcon} alt="" /> Fang</> },
            { mode: 'strength' as const,  label: <><img src={iconStrength} className={styles.statIcon} alt="" /> Force</> },
            { mode: 'defense' as const,   label: <><img src={iconDefense} className={styles.statIcon} alt="" /> Ward</> },
            { mode: 'all_melee' as const, label: <><img src={iconAll} className={styles.statIcon} alt="" /> All</> },
        ];
    }, [weaponStyle]);

    return (
        <div className={`
            ${styles.prepArea} 
            ${!unlockedUpgrades.includes('auto_eat') ? styles.locked : ''}
            ${showZoneGrid ? styles.homeHud : ''}
        `}>
            {/* Skill Bars */}
            <div className={styles.prepSkills}>
                {Object.entries(skills)
                    .filter(([name]) => SKILL_LABELS[name] !== undefined)
                    .map(([name, data]) => (
                        <div key={name} className={styles.miniSkillBar}>
                            <img src={SKILL_ICONS[name]} alt={name} className={styles.skillBarIcon} />
                            <div className={styles.miniSkillContent}>
                                <div className={styles.miniSkillInfo}>
                                    <span className={styles.miniSkillName}>{SKILL_LABELS[name]}</span>
                                    <span className={styles.miniSkillLevel}>{data.level}</span>
                                </div>
                                <div className={styles.miniSkillProgress}>
                                    <div 
                                        className={styles.miniSkillFill} 
                                        style={{ width: `${(data.xp % 1000) / 10}%`, backgroundColor: name === 'vitae' ? '#4caf50' : '#c41e3a' }} 
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Style selector */}
            <div className={styles.miniStyleRow}>
                {modeOptions.map(({ mode, label }) => (
                    <button
                        key={mode}
                        className={`${styles.miniStyleBtn} ${trainingMode === mode ? styles.active : ''}`}
                        onClick={() => setTrainingMode(mode)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Auto-Eat Controls */}
            <div className={`${styles.autoEatControl} ${!unlockedUpgrades.includes('auto_eat') ? styles.locked : ''}`}>
                <div className={styles.autoEatToggleRow}>
                    <label className={styles.toggleLabel}>
                        <input 
                            type="checkbox" 
                            checked={autoEatEnabled}
                            onChange={() => toggleAutoEat()}
                            disabled={!unlockedUpgrades.includes('auto_eat')}
                        />
                        <span className={styles.toggleText}>AUTO-VITA {autoEatEnabled ? 'ON' : 'OFF'}</span>
                    </label>
                    <span className={styles.thresholdValue}>{Math.round(autoEatThreshold * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0.1" 
                    max="0.9" 
                    step="0.05"
                    value={autoEatThreshold}
                    onChange={(e) => setAutoEatThreshold(parseFloat(e.target.value))}
                    className={styles.prepSlider}
                    disabled={!unlockedUpgrades.includes('auto_eat')}
                />
                {!unlockedUpgrades.includes('auto_eat') && (
                    <div className={styles.lockedOverlay}>LOCKED</div>
                )}
            </div>

            {/* Scent of Fear */}
            <div className={styles.miniScentArea}>
                <div className={styles.miniScentLabel}>
                    <span className={styles.miniScentTitle}>Scent of Fear</span>
                    <span className={styles.miniScentValue}>{Math.floor(scentIntensity * 100)}%</span>
                </div>
                <div className={styles.miniScentTrack}>
                    <div 
                        className={styles.miniScentFill} 
                        style={{ width: `${Math.min(100, scentIntensity * 100)}%` }}
                    />
                </div>

                {activeEvent && (
                    <div className={styles.activeScourgeInfo}>
                        <div className={styles.scourgeHeader}>
                            <span className={styles.scourgeLabel}>ACTIVE SCOURGE:</span>
                            <span className={styles.scourgeName}>{activeEvent}</span>
                        </div>
                        <div className={styles.scourgeDesc}>
                            {getScourgeDescription(activeEvent)}
                        </div>
                    </div>
                )}

                {/* Crucible Status */}
                <div className={styles.crucibleStatusArea}>
                    <div className={`${styles.statusLabel} ${!crucibleSealed ? styles.unsealed : ''}`}>
                        <span>Sanctum Crucible</span>
                        <span>{crucibleSealed ? 'SEALED' : 'UNSEALED'}</span>
                    </div>
                    
                    {crucibleSealed && isRunning && (
                        <div className={styles.unsealProgress}>
                            <div className={styles.statusLabel}>
                                <span>Survival Progress</span>
                                <span>{Math.min(50, currentTick)} / 50</span>
                            </div>
                            <div className={styles.unsealTrack}>
                                <div 
                                    className={styles.unsealFill} 
                                    style={{ width: `${Math.min(100, (currentTick / 50) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Return to Arena Button */}
            {viewMode === 'home' && isRunning && (
                <button 
                    className={styles.returnToArenaBtn}
                    onClick={() => setViewMode('arena')}
                >
                    ⚔️ RETURN TO ARENA
                </button>
            )}
        </div>
    );
});
