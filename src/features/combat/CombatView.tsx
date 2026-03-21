import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useCombatStore } from '../../store/combatStore';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatEngine } from './useCombatEngine';
import { EquipmentPanel } from '../character/EquipmentPanel';
import { ConsumablePanel } from '../character/ConsumablePanel';
import { DamageSplats } from './DamageSplats';
import { EnemyRoster } from './EnemyRoster';
import { SessionReport } from './SessionReport';
import { IdleGainPanel } from '../ui/IdleGainPanel';
import { SessionSummaryModal } from '../ui/SessionSummaryModal';
import { NotificationContainer } from '../ui/NotificationContainer';
import ZONES from '../../data/zones';
import type { Zone, Enemy, TrainingMode } from '../../engine/types';
import {
    computeDerivedStats,
    calcHitChance,
    calcStyleBonus,
} from '../../engine/formulas';
import styles from './combat.module.scss';
import iconAttack from '../../assets/icons/attack.png';
import iconStrength from '../../assets/icons/strength.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconHp from '../../assets/icons/hp.png';
import iconAll from '../../assets/icons/all.png';

import { HpBar } from '../ui/HpBar';
import { AttackMeter } from '../ui/AttackMeter';

// --- Sub-components ---

function CombatLog() {
    const log = useCombatStore((s) => s.log);
    const colorMap: Record<string, string> = {
        hit: '#c41e3a', miss: '#5a5068', enemy_hit: '#ef4444', enemy_miss: '#5a5068',
        kill: '#d4af37', xp_gain: '#a855f7', level_up: '#f0cc55', auto_eat: '#22c55e',
        player_death: '#ff3355', loot: '#60a5fa', respawn: '#9a8fa0',
    };
    return (
        <div className={styles.logWrap}>
            <div className={styles.logHeader}>Combat Log</div>
            <div className={styles.logBody}>
                {log.map((e) => (
                    <div key={e.id} className={styles.logEntry} style={{ color: colorMap[e.type] ?? '#f0e6d3' }}>
                        {e.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CombatView() {
    const {
        selectedZone, activeEnemy, isRunning, isDead,
        playerHp, playerMaxHp, enemyHp, enemyMaxHp,
        playerMeter, enemyMeter, lastSession
    } = useCombatStore();
    const { 
        trainingMode, setTrainingMode, equipment, 
        autoEatEnabled, autoEatThreshold, toggleAutoEat, setAutoEatThreshold,
        unlockedUpgrades, currentVitae
    } = usePlayerStore();
    const { startCombatWithEnemy, fleeFromCombat } = useCombatEngine();

    // Derived combat stats for Hit% and Max Hit display
    const { skills } = usePlayerStore();
    const derived = useMemo(
        () => computeDerivedStats(skills, equipment),
        [skills, equipment]
    );

    // Training mode options per weapon type — icon + name only
    type ModeConfig = { mode: TrainingMode; label: React.ReactNode };
    const getModeConfigs = (): ModeConfig[] => {
        if (derived.weaponStyle === 'archery') {
            return [
                { mode: 'archery', label: <span><img src={iconArchery} className={styles.statIcon} alt="" /> Shadow</span> },
                { mode: 'warding_archery', label: <span><img src={iconDefense} className={styles.statIcon} alt="" /> Ward</span> },
            ];
        }
        if (derived.weaponStyle === 'sorcery') {
            return [
                { mode: 'sorcery', label: <span><img src={iconMagic} className={styles.statIcon} alt="" /> Blood</span> },
                { mode: 'warding_sorcery', label: <span><img src={iconDefense} className={styles.statIcon} alt="" /> Ward</span> },
            ];
        }
        // melee (default)
        return [
            { mode: 'attack',    label: <><img src={iconAttack} className={styles.statIcon} alt="" /> Fang</> },
            { mode: 'strength',  label: <><img src={iconStrength} className={styles.statIcon} alt="" /> Force</> },
            { mode: 'defense',   label: <><img src={iconDefense} className={styles.statIcon} alt="" /> Ward</> },
            { mode: 'all_melee', label: <><img src={iconAll} className={styles.statIcon} alt="" /> All</> },
        ];
    };

    // Player combat stats (update with skills/equipment)
    const playerMaxHitDisplay = derived.weaponStyle === 'melee'
        ? derived.meleeMaxHit
        : derived.weaponStyle === 'archery' ? derived.rangedMaxHit : derived.magicMaxHit;

    const modeOptions = getModeConfigs();


    // Track last active zone in a ref so it survives the flee state reset
    const lastZoneIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (selectedZone?.id) lastZoneIdRef.current = selectedZone.id;
    }, [selectedZone]);



    // Which zone card has its enemy roster expanded
    const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);

    // 'arena' = watching the fight, 'home' = zone-select screen (combat may still run)
    const [viewMode, setViewMode] = useState<'arena' | 'home'>('home');

    // Stats modals
    const [showGains, setShowGains] = useState(false);
    const [showHuntingGains, setShowHuntingGains] = useState(false);


    const handleZoneClick = useCallback((z: Zone) => {
        setExpandedZoneId(prev => prev === z.id ? null : z.id);
    }, []);

    const handleEnemySelect = useCallback((zone: Zone, enemy: Enemy) => {
        setExpandedZoneId(null);
        const fullZone = ZONES.find(z => z.id === zone.id);
        if (fullZone) {
            startCombatWithEnemy(fullZone, enemy);
            setViewMode('arena');
        }
    }, [startCombatWithEnemy]);

    // Flee — stop combat entirely, go back to zone roster
    const handleFlee = useCallback(() => {
        const zoneId = lastZoneIdRef.current;
        fleeFromCombat();
        setViewMode('home');
        if (zoneId) setExpandedZoneId(zoneId);
    }, [fleeFromCombat]);

    // Home — keep combat running, return to zone grid
    const handleHome = useCallback(() => {
        setViewMode('home');
        setExpandedZoneId(null);
    }, []);

    const hpColor = (pct: number) => pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';
    const playerHpPct = playerMaxHp > 0 ? playerHp / playerMaxHp : 0;

    // Show zone grid when: no active combat, OR player navigated home
    const showZoneGrid = viewMode === 'home' || (!isRunning && !activeEnemy);
    // Show fight arena when actively watching combat
    const showArena = !showZoneGrid && (isRunning || !!activeEnemy);

    return (
        <div className={styles.root}>
            {/* Left panel — Player */}
            <div className={styles.playerPanel}>
                <div className={styles.panelTitle}>🧛 Your Vampire</div>

                {/* Training Mode Selector */}
                <div className={styles.trainingLabel}>Training</div>
                <div className={styles.styleRow}>
                    {modeOptions.map(({ mode, label }) => (
                        <button
                            key={mode}
                            className={`${styles.styleBtn} ${trainingMode === mode ? styles.active : ''}`}
                            onClick={() => setTrainingMode(mode)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Player Hit% and Max Hit */}
                <div className={styles.combatStatRow}>
                    <span className={styles.combatStatLabel}>Hit %</span>
                    <span className={styles.combatStatValue}>
                        {activeEnemy
                            ? `${Math.round(calcHitChance(
                                derived.accuracyRating,
                                activeEnemy.stats.defense * 4,
                                calcStyleBonus(derived.weaponStyle, activeEnemy.weakness, activeEnemy.resistance)
                            ) * 100)}%`
                            : '—'}
                    </span>
                </div>
                <div className={styles.combatStatRow}>
                    <span className={styles.combatStatLabel}>Max Hit</span>
                    <span className={styles.combatStatValue}>{playerMaxHitDisplay}</span>
                </div>

                {/* Auto-Eat Control (Unlockable / Red Box placement) */}
                <div className={`${styles.autoEatControl} ${!unlockedUpgrades.includes('auto_eat') ? styles.locked : ''}`}>
                    <div className={styles.autoEatHeader}>
                        <span className={styles.autoEatLabel}>Auto-Eat</span>
                        <div 
                            className={`${styles.autoEatToggle} ${autoEatEnabled ? styles.active : ''}`}
                            onClick={() => unlockedUpgrades.includes('auto_eat') && toggleAutoEat()}
                        />
                    </div>
                    <div className={styles.autoEatSliderArea}>
                        <div className={styles.sliderValue}>{Math.round(autoEatThreshold * 100)}% HP</div>
                        <input 
                            type="range" 
                            min="10" 
                            max="90" 
                            step="5"
                            value={autoEatThreshold * 100}
                            onChange={(e) => unlockedUpgrades.includes('auto_eat') && setAutoEatThreshold(Number(e.target.value) / 100)}
                            className={styles.customSlider}
                            disabled={!unlockedUpgrades.includes('auto_eat')}
                        />
                    </div>
                    {!unlockedUpgrades.includes('auto_eat') && (
                        <div className={styles.lockedText}>Upgrade Required</div>
                    )}
                </div>

                {isDead && (
                    <div className={styles.deadBanner}>
                        <div>☠️ You have been slain</div>
                        <div className={styles.deadSubtext}>Pending loot was lost</div>
                    </div>
                )}

                {/* Persistent Vitae Bar */}
                <div className={styles.persistentHpArea}>
                    <div className={styles.persistentHpLabel}>
                        <img src={iconHp} alt="" className={styles.statIcon} style={{ width: 18, height: 18, objectFit: 'contain' }} />
                        <span>Vitae</span>
                        <span className={styles.hpNumbers}>{Math.floor(currentVitae)} / {derived.maxHp}</span>
                    </div>
                    <HpBar 
                        current={currentVitae} 
                        max={derived.maxHp} 
                        color={hpColor(currentVitae / derived.maxHp)}
                        label=""
                    />
                </div>
            </div>

            {/* Center — Zone Select or Active Fight */}
            <div className={styles.centerPanel}>

                {/* Combat-in-progress banner shown on zone grid while fighting */}
                {showZoneGrid && isRunning && activeEnemy && (
                    <div className={styles.combatBanner}>
                        <span className={styles.combatBannerText}>
                            ⚔ In combat with <strong>{activeEnemy.name}</strong>
                        </span>
                        <button className={styles.returnBtn} onClick={() => setViewMode('arena')}>
                            ▶ Return to Arena
                        </button>
                    </div>
                )}

                {showZoneGrid && (
                    <div className={styles.zoneGrid}>
                        <div className={styles.zoneGridTitle}>Select a Hunting Ground</div>
                        {ZONES.map(z => {
                            const isLocked = false;
                            const isExpanded = expandedZoneId === z.id;
                            return (
                                <div
                                    key={z.id}
                                    className={`${styles.zoneCard} ${isLocked ? styles.locked : ''} ${isExpanded ? styles.expanded : ''}`}
                                    onClick={() => !isLocked && handleZoneClick(z)}
                                >
                                    <div className={styles.zoneCardHeader}>
                                        <div className={styles.zoneCardName}>{z.name}</div>
                                        <div className={styles.zoneCardChevron}>{isExpanded ? '▲' : '▼'}</div>
                                    </div>
                                    <div className={styles.zoneCardLevel}>Lv {z.recommendedLevelMin}–{z.recommendedLevelMax}</div>
                                    <div className={styles.zoneCardTier}>{z.dropTier}</div>
                                    <div className={styles.zoneCardDesc}>{z.description}</div>

                                    {isExpanded && (
                                        <EnemyRoster
                                            zone={z}
                                            onSelect={(enemy) => handleEnemySelect(z, enemy)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {showArena && activeEnemy && (
                    <div className={styles.fightArena}>
                        <div style={{ position: 'relative' }}>
                            <EquipmentPanel 
                                hpProps={{
                                    current: playerHp,
                                    max: playerMaxHp,
                                    label: (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img src={iconHp} alt="Vitae" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                            Vitae
                                        </span>
                                    ),
                                    color: hpColor(playerHpPct)
                                }}
                                meterProps={{
                                    value: playerMeter,
                                    label: "",
                                    color: "#ff4d00"
                                }}
                            />
                            <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 50 }}>
                                <DamageSplats isPlayer={true} />
                            </div>
                        </div>
                        <div className={`${styles.enemyCard} ${activeEnemy.isElite ? styles.eliteCard : ''}`} style={{ position: 'relative' }}>
                            <div className={styles.enemyName}>
                                {activeEnemy.isElite ? '⚔️ ' : ''}{activeEnemy.name}
                            </div>
                            <div className={styles.enemyZone}>{selectedZone?.name}</div>
                            
                            {activeEnemy.spriteUrl && (
                                <div className={styles.enemySpriteContainer}>
                                    <img 
                                        src={activeEnemy.spriteUrl} 
                                        alt={activeEnemy.name} 
                                        className={styles.enemySprite} 
                                    />
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 100 }}>
                                        <DamageSplats isPlayer={false} />
                                    </div>
                                </div>
                            )}

                            <div className={styles.enemyStatusArea}>
                                <div className={styles.enemyStatsGrid}>
                                    <span><img src={iconAttack} alt="Attack" className={styles.statIcon} /> {activeEnemy.stats.attack}</span>
                                    <span><img src={iconStrength} alt="Strength" className={styles.statIcon} /> {activeEnemy.stats.strength}</span>
                                    <span><img src={iconDefense} alt="Defense" className={styles.statIcon} /> {activeEnemy.stats.defense}</span>
                                    <span><img src={iconHp} alt="HP" className={styles.statIcon} /> {activeEnemy.stats.hp}</span>
                                    <span><img src={iconArchery} alt="Ranged" className={styles.statIcon} /> {activeEnemy.stats.ranged}</span>
                                    <span><img src={iconMagic} alt="Magic" className={styles.statIcon} /> {activeEnemy.stats.magic}</span>
                                </div>
                                <div className={styles.enemyInfoColumn}>
                                    <div className={styles.tacticalHeader}>
                                         <span>Hit %: {Math.round(calcHitChance(
                                             activeEnemy.accuracy,
                                             derived.evasionRating
                                         ) * 100)}%</span>
                                         <span className={styles.headerSpacer}>|</span>
                                         <span>Max Hit: {activeEnemy.maxHit}</span>
                                     </div>

                                    <div className={styles.mainInfoStack}>
                                        <div className={styles.infoLabelText}>
                                            Weakness: <span className={styles.goldValue}>{activeEnemy.weakness}</span>
                                        </div>
                                        <div className={styles.infoLabelText}>
                                            Vitae: <span className={styles.goldValue}>{Math.max(0, enemyHp)}/{enemyMaxHp}</span>
                                        </div>
                                        
                                        <div className={styles.compactHpWrap} style={{ flexShrink: 0 }}>
                                            <HpBar
                                                current={Math.max(0, enemyHp)}
                                                max={enemyMaxHp}
                                                label=""
                                                color={hpColor(enemyMaxHp > 0 ? Math.max(0, enemyHp) / enemyMaxHp : 0)}
                                            />
                                        </div>

                                        <div className={styles.compactMeterWrap} style={{ flexShrink: 0 }}>
                                            <AttackMeter
                                                value={enemyMeter}
                                                label=""
                                                color="#ff4d00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.bottomBarArea}>
                            <div className={styles.arenaButtons}>
                                <button className={styles.homeBtn} onClick={handleHome}>
                                    🏠 Home
                                </button>
                                <button className={styles.fleeBtn} onClick={handleFlee}>
                                    🏃 Flee
                                </button>
                            </div>
                            <ConsumablePanel />
                        </div>
                    </div>
                )}
            </div>

            {/* Right panel — Combat Log & Session Report */}
            <div className={styles.rightSidebar}>
                <CombatLog />
                <SessionReport 
                    onOpenCombatGains={() => setShowGains(true)}
                    onOpenHuntingGains={() => setShowHuntingGains(true)}
                />
            </div>

            <NotificationContainer />

            {showGains && <IdleGainPanel onClose={() => setShowGains(false)} />}
            {(lastSession || showHuntingGains) && (
                <SessionSummaryModal 
                    active={showHuntingGains} 
                    onClose={() => setShowHuntingGains(false)} 
                />
            )}
        </div>
    );
}
