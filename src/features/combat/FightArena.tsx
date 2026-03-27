import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useCombatStore } from '../../store/combatStore';
import { usePlayerStore } from '../../store/playerStore';
import { useShallow } from 'zustand/react/shallow';
import { EquipmentPanel } from '../character/EquipmentPanel';
import { ConsumablePanel } from '../character/ConsumablePanel';
import { HpBar } from '../ui/HpBar';
import { AttackMeter } from '../ui/AttackMeter';
import { DamageSplats } from './DamageSplats';
import {
    computeDerivedStats,
    calcHitChance,
    calcStyleBonus,
} from '../../engine/formulas';
import styles from './combat.module.scss';

// Skill Icons for stats
import iconAttack from '../../assets/icons/attack.png';
import iconStrength from '../../assets/icons/strength.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconHp from '../../assets/icons/hp.png';


export const FightArena = React.memo(() => {
    // We only pick what we need to render the arena.
    // Meter values update every 100ms, so this component will re-render frequently.
    // But it's better than re-rendering the whole CombatView.
    const {
        activeEnemy,
        enemyHp, enemyMaxHp,
        enemyMeter, playerMeter,
        lastEnemyCritStamp,
        isDashReady, flickerTicks, isIronbound, activeRituals,
        selectedZone
    } = useCombatStore(useShallow(s => ({
        activeEnemy: s.activeEnemy,
        enemyHp: s.enemyHp,
        enemyMaxHp: s.enemyMaxHp,
        enemyMeter: s.enemyMeter,
        playerMeter: s.playerMeter,
        lastEnemyCritStamp: s.lastEnemyCritStamp,
        isDashReady: s.isDashReady,
        flickerTicks: s.flickerTicks,
        isIronbound: s.isIronbound,
        activeRituals: s.activeRituals,
        selectedZone: s.selectedZone
    })));

    const { equipment, skills, currentVitae } = usePlayerStore(useShallow(s => ({
        equipment: s.equipment,
        skills: s.skills,
        currentVitae: s.currentVitae
    })));

    // Memoize derived stats since skills update every hit
    const derived = useMemo(
        () => computeDerivedStats(skills, equipment),
        [skills, equipment]
    );

    const playerMaxHitDisplay = derived.weaponStyle === 'melee'
        ? derived.meleeMaxHit
        : derived.weaponStyle === 'archery' ? derived.rangedMaxHit : derived.magicMaxHit;

    const hpColor = (pct: number) => pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';

    // Track critical flash
    const [isCritFlashing, setIsCritFlashing] = useState(false);
    const lastHandledCritStamp = useRef(0);
    useEffect(() => {
        if (lastEnemyCritStamp > lastHandledCritStamp.current) {
            lastHandledCritStamp.current = lastEnemyCritStamp;
            setIsCritFlashing(true);
            const timer = setTimeout(() => setIsCritFlashing(false), 400);
            return () => clearTimeout(timer);
        }
    }, [lastEnemyCritStamp]);

    if (!activeEnemy) return null;

    return (
        <div className={styles.fightArena}>
            <div className={styles.combatantsRow}>
                <div className={styles.playerCardArea}>
                    <div className={styles.playerCardHeader}>🧛 Your Vampire</div>
                    <EquipmentPanel />
                    <div className={styles.playerSplatAnchor}>
                        <DamageSplats isPlayer={true} />
                    </div>
                    
                    <div className={styles.playerStatsArea}>
                    <div className={styles.playerStatsGroup}>
                        <div className={styles.vitaeRow}>
                            <div className={styles.vitaeLabel}>
                                <span className={styles.vitaeLabelText}>🩸 Vitae</span>
                                <span className={styles.vitaeValue}>{Math.max(0, currentVitae)}&nbsp;/&nbsp;{derived.maxHp}</span>
                            </div>
                            <HpBar
                                current={Math.max(0, currentVitae)}
                                max={derived.maxHp}
                                label=""
                                color={hpColor(currentVitae / derived.maxHp)}
                            />
                        </div>
                    </div>

                    <AttackMeter value={playerMeter} label="" color="#c41e3a" />

                        <div className={styles.statusAura}>
                            <div 
                                className={`${styles.statusBadge} ${isDashReady ? styles.dashReady : styles.dashCooldown} ${flickerTicks > 0 ? styles.flickerActive : ''}`}
                            >
                                <span className={styles.statusIcon}>{isDashReady ? '💨' : '⌛'}</span>
                                <span className={styles.statusText}>
                                    {flickerTicks > 0 ? 'FLICKER' : (isDashReady ? 'DASH READY' : 'RECHARGING')}
                                </span>
                            </div>

                            {isIronbound && (
                                <div className={`${styles.statusBadge} ${styles.ironbound}`}>
                                    <span className={styles.statusIcon}>🛡️</span>
                                    <span className={styles.statusText}>IRONBOUND</span>
                                </div>
                            )}

                            {derived.flatArmor > 0 && (
                                <div className={`${styles.statusBadge} ${styles.armorStatus}`}>
                                    <span className={styles.statusIcon}>🛡️</span>
                                    <span className={styles.statusText}>{derived.flatArmor}</span>
                                </div>
                            )}

                            <div className={styles.ritualBadges}>
                                {activeRituals.map(ritualId => (
                                    <div key={ritualId} className={styles.ritualBadge}>
                                        {ritualId === 'ritual_frenzy' ? '🔥' : '🛡️'}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.arenaStatGrid}>
                            <div className={styles.arenaStatBox}>
                                <span className={styles.arenaStatLabel}>Hit %</span>
                                <span className={styles.arenaStatValue}>
                                    {Math.round(calcHitChance(
                                        derived.accuracyRating,
                                        activeEnemy.stats.defense * 4,
                                        calcStyleBonus(derived.weaponStyle, activeEnemy.weakness, activeEnemy.resistance)
                                    ) * 100)}%
                                </span>
                            </div>
                            <div className={styles.arenaStatBox}>
                                <span className={styles.arenaStatLabel}>Max Hit</span>
                                <span className={styles.arenaStatValue}>{playerMaxHitDisplay}</span>
                            </div>
                            <div className={styles.arenaStatBox}>
                                <span className={styles.arenaStatLabel}>Refined</span>
                                <span className={`${styles.arenaStatValue} ${styles.refinementText}`}>
                                    +{Object.values(equipment).reduce((sum, item) => sum + (item?.refinement ?? 0), 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${styles.enemyCard} ${activeEnemy.isElite ? styles.eliteCard : ''} ${isCritFlashing ? styles.enemyCardCrit : ''}`}>
                    <div className={styles.enemySplatOverlay}>
                        <DamageSplats isPlayer={false} />
                    </div>

                    <div className={styles.enemyName}>
                        {activeEnemy.isElite ? '⚔️ ' : ''}{activeEnemy.name}
                    </div>
                    <div className={styles.enemyZone}>{selectedZone?.name}</div>
                    
                    {activeEnemy.spriteUrl && (
                        <div className={styles.enemySpriteContainer}>
                            <img src={activeEnemy.spriteUrl} alt={activeEnemy.name} className={styles.enemySprite} />
                        </div>
                    )}

                    <div className={styles.enemyStatusArea}>
                        <div className={styles.enemyStatsGrid}>
                            <span><img src={iconAttack} alt="" className={styles.statIcon} /> {activeEnemy.stats.attack}</span>
                            <span><img src={iconStrength} alt="" className={styles.statIcon} /> {activeEnemy.stats.strength}</span>
                            <span><img src={iconDefense} alt="" className={styles.statIcon} /> {activeEnemy.stats.defense}</span>
                            <span><img src={iconHp} alt="" className={styles.statIcon} /> {activeEnemy.stats.hp}</span>
                            <span><img src={iconArchery} alt="" className={styles.statIcon} /> {activeEnemy.stats.ranged}</span>
                            <span><img src={iconMagic} alt="" className={styles.statIcon} /> {activeEnemy.stats.magic}</span>
                        </div>
                        <div className={styles.enemyInfoColumn}>
                            <div className={styles.tacticalHeader}>
                                <span>Hit %: {Math.round(calcHitChance(activeEnemy.accuracy, derived.evasionRating) * 100)}%</span>
                                <span className={styles.headerSpacer}>|</span>
                                <span>Max Hit: {activeEnemy.maxHit}</span>
                            </div>

                            <div className={styles.mainInfoStack}>
                                <div className={styles.infoLabelText}>
                                    Vitae: <span className={styles.goldValue}>{Math.max(0, enemyHp)}/{enemyMaxHp}</span>
                                </div>
                                <HpBar
                                    current={Math.max(0, enemyHp)}
                                    max={enemyMaxHp}
                                    label=""
                                    color={hpColor(enemyMaxHp > 0 ? Math.max(0, enemyHp) / enemyMaxHp : 0)}
                                />
                                <AttackMeter value={enemyMeter} label="" color="#ff4d00" />
                            </div>
                        </div>
                    </div>
                {/* End of enemyCardInner */}
                </div>
            </div>

            <div className={styles.bottomConsumableBar}>
                <ConsumablePanel />
            </div>
        </div>
    );
});
