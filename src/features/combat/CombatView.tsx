import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useCombatStore } from '../../store/combatStore';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatEngine } from './useCombatEngine';
import { EquipmentPanel } from '../character/EquipmentPanel';
import { ConsumablePanel } from '../character/ConsumablePanel';
import { HpBar } from '../ui/HpBar';
import { AttackMeter } from '../ui/AttackMeter';
import { DamageSplats } from './DamageSplats';
import { IdleGainPanel } from '../ui/IdleGainPanel';
import { SessionSummaryModal } from '../ui/SessionSummaryModal';
import { EnemyRoster } from './EnemyRoster';
import { SessionReport } from './SessionReport';
import { NotificationContainer } from '../ui/NotificationContainer';
import ZONES from '../../data/zones';
import type { Zone, Enemy, TrainingMode } from '../../engine/types';

import {
    computeDerivedStats,
    calcHitChance,
    calcStyleBonus,
} from '../../engine/formulas';
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
        selectedZone, activeEnemy, isRunning,
        enemyHp, enemyMaxHp,
        enemyMeter, playerMeter,
        activeEvent, isBossPending, scentIntensity,
        lastEnemyCritStamp, viewMode, setViewMode,
        currentTick,
        isDashReady, flickerTicks, ironboundTicks, isIronbound, activeRituals,
        dashCooldownTicks
    } = useCombatStore();
    const { 
        trainingMode, setTrainingMode, equipment, 
        autoEatEnabled, autoEatThreshold, toggleAutoEat,
        unlockedUpgrades, currentVitae, skills,
        setAutoEatThreshold,
        crucibleSealed, resetCrucibleSeal
    } = usePlayerStore();
    const { startCombatWithEnemy, fleeFromCombat } = useCombatEngine();

    const derived = useMemo(
        () => computeDerivedStats(skills, equipment),
        [skills, equipment]
    );

    // Derived combat stats for Hit% and Max Hit display

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
    
    // Track critical flash
    const [isCritFlashing, setIsCritFlashing] = useState(false);
    
    const getScourgeDescription = (eventName: string | null) => {
        switch (eventName) {
            case 'Bloodlust': return 'Enemy Accuracy +10%';
            case 'Hemophilic Curse': return 'Vampire Damage Taken +15%';
            case 'Razor Fangs': return 'Enemy Attack Speed +10%';
            default: return '';
        }
    };

    useEffect(() => {
        if (lastEnemyCritStamp > 0) {
            setIsCritFlashing(true);
            const timer = setTimeout(() => setIsCritFlashing(false), 400);
            return () => clearTimeout(timer);
        }
    }, [lastEnemyCritStamp]);

    useEffect(() => {
        if (selectedZone?.id) lastZoneIdRef.current = selectedZone.id;
    }, [selectedZone]);



    // Which zone card has its enemy roster expanded
    const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);

    // Stats modals
    const [showGains, setShowGains] = useState(false);
    const [showHuntingGains, setShowHuntingGains] = useState(false);
    const [unsealToast, setUnsealToast] = useState(false);

    // Phase 3: Unseal Detection
    // Trigger reset mid-hunt if threshold hit
    useEffect(() => {
        if (isRunning && crucibleSealed && currentTick >= 50) {
            resetCrucibleSeal();
            setUnsealToast(true);
            setTimeout(() => setUnsealToast(false), 4000);
        }
    }, [isRunning, crucibleSealed, currentTick, resetCrucibleSeal]);


    const handleZoneClick = useCallback((z: Zone) => {
        setExpandedZoneId(prev => prev === z.id ? null : z.id);
    }, []);

    const handleEnemySelect = useCallback((zone: Zone, enemy: Enemy) => {
        setExpandedZoneId(null);
        const fullZone = ZONES.find((z: Zone) => z.id === zone.id);
        if (fullZone) {
            startCombatWithEnemy(fullZone, enemy);
            setViewMode('arena');
        }
    }, [startCombatWithEnemy, setViewMode]);

    // Flee — stop combat entirely, go back to zone roster and show what we got
    const handleFlee = useCallback(() => {
        fleeFromCombat();
        setViewMode('home');
        setShowHuntingGains(true);
    }, [fleeFromCombat, setViewMode]);

    // Home — keep combat running, return to zone grid
    const handleHome = useCallback(() => {
        setViewMode('home');
    }, [setViewMode]);


    const hpColor = (pct: number) => pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';

    // --- Render Helpers ---
    const renderPrepArea = () => (
        <div className={`
            ${styles.prepArea} 
            ${!unlockedUpgrades.includes('auto_eat') ? styles.locked : ''}
            ${showZoneGrid ? styles.homeHud : ''}
        `}>
            <div className={styles.prepSkills}>
                {Object.entries(skills)
                    .filter(([name]) => name !== 'bloodletting' && name !== 'distillation')
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

            {/* Style selector - Relocated to sidebar for better tactical access */}
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

            {/* Scent of Fear — Dynamic tactical info */}
            <div className={styles.miniScentArea}>
                <div className={styles.miniScentLabel}>
                    <span className={styles.miniScentTitle}>Scent of Fear</span>
                    {isBossPending && <span className={styles.miniScentBossWarning}>BOSS!</span>}
                    <span className={styles.miniScentValue}>{Math.floor(scentIntensity * 100)}%</span>
                </div>
                <div className={styles.miniScentTrack}>
                    <div 
                        className={styles.miniScentFill} 
                        style={{ width: `${Math.min(100, scentIntensity * 100)}%` }}
                    />
                    {/* Milestones */}
                    <div className={`${styles.scentMarker} ${styles.markerBoss}`} title="Boss Threshold (20%)" style={{ left: '20%' }} />
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

                {/* Phase 3: Crucible State Feedback */}
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

            {/* Return to Arena Button (Mobile/Home context) */}
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

    const showZoneGrid = viewMode === 'home' || (!isRunning && !activeEnemy);
    // Show fight arena when actively watching combat

    return (
        <div className={styles.root}>

            {/* Center — Active Fight or Hunting Grounds */}
            {/* Center — Selection Hub or Active Fight */}
            <div className={styles.centerPanel}>
                {showZoneGrid ? (
                    /* Selection Mode: Dual Panel Management */
                    <div className={styles.selectionLayout}>
                        {/* Left: Preparation Sidebar (Static) */}
                        <div className={styles.prepSidebar}>
                            <h2 className={styles.sidebarHeader}>🧛 Preparation Hub</h2>
                            {renderPrepArea()}
                        </div>

                        {/* Right: Zone Navigation & Roster */}
                        <div className={styles.zoneTabSystem}>
                            <div className={styles.zoneNavHeader}>
                                <div className={styles.zoneTabsArea}>
                                    {ZONES.map((z: Zone) => {
                                        const isActive = expandedZoneId === z.id;
                                        return (
                                            <div 
                                                key={z.id} 
                                                className={`${styles.zoneTab} ${isActive ? styles.active : ''}`}
                                                onClick={() => handleZoneClick(z)}
                                            >
                                                <span className={styles.tabName}>{z.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={styles.zoneDisplayArea}>
                                {expandedZoneId ? (() => {
                                    const selectedZone = ZONES.find((z: Zone) => z.id === expandedZoneId);
                                    if (!selectedZone) return null;
                                    
                                    const bgMap: Record<string, string> = {
                                        'forgotten_hamlet': 'forgotten_hamlet.png',
                                        'grimwood_forest': 'grimwood_forest.png',
                                        'blackthorn_city': 'blackthorn_city.png',
                                        'catacombs': 'catacombs.png',
                                        'crimson_highlands': 'crimson_highlands.png',
                                        'night_citadel': 'night_citadel.png'
                                    };
                                    const bgImage = bgMap[selectedZone.id] || 'forgotten_hamlet.png';

                                    return (
                                        <div 
                                            className={styles.immersiveZonePanel}
                                            style={{ backgroundImage: `url(/assets/zones/${bgImage})` }}
                                        >
                                            <div className={styles.panelOverlay}>
                                                <div className={styles.zoneInfoBlock}>
                                                    <h1 className={styles.panelTitle}>{selectedZone.name}</h1>
                                                    <div className={styles.panelMeta}>
                                                        <span>LEVEL RANGE: {selectedZone.recommendedLevelMin}–{selectedZone.recommendedLevelMax}</span>
                                                        <span className={styles.separator}>•</span>
                                                        <span>DROP TIER: {selectedZone.dropTier}</span>
                                                    </div>
                                                    <p className={styles.panelDesc}>{selectedZone.description}</p>
                                                </div>

                                                <div className={styles.rosterBlock}>
                                                    <EnemyRoster
                                                        zone={selectedZone}
                                                        onSelect={(enemy) => handleEnemySelect(selectedZone, enemy)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <div className={styles.noZoneSelected}>
                                        <div className={styles.welcomeCard}>
                                            <div className={styles.welcomeIcon}>🧛</div>
                                            <h1 className={styles.welcomeTitle}>Welcome, Noble Vampire</h1>
                                            <p className={styles.welcomeSubtitle}>The night is young, and the blood is fresh.</p>
                                            <div className={styles.welcomeDivider}></div>
                                            <p className={styles.welcomeHint}>Select a hunting ground above to begin your harvest.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Combat Mode: Split Sidebars & Tactical Arena */
                    <div className={styles.combatLayout}>
                        {/* Left Side: Tactical Dashboard */}
                        <div className={styles.combatLeftSidebar}>
                            <h2 className={styles.sidebarHeader}>⚔️ Combat HUD</h2>
                            {renderPrepArea()}
                            
                            <div className={styles.arenaButtons}>
                                <button className={styles.homeBtn} onClick={handleHome}>
                                    🏠 Home
                                </button>
                                <button className={styles.fleeBtn} onClick={handleFlee}>
                                    🏃 Flee Combat
                                </button>
                            </div>
                        </div>

                        {/* Center: Immersive Tactical Arena */}
                        <div className={styles.fightArena}>

                            {activeEnemy && (
                                <div className={styles.combatantsRow}>
                                    <div className={styles.playerCardArea}>
                                        <div className={styles.playerCardHeader}>🧛 Your Vampire</div>
                                        <EquipmentPanel />
                                        <div className={styles.playerSplatAnchor}>
                                            <DamageSplats isPlayer={true} />
                                        </div>
                                        
                                        <div className={styles.playerStatsArea}>
                                            {/* Vitae (HP) — prominently shown */}
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

                                            {/* Attack meter */}
                                            <AttackMeter value={playerMeter} label="" color="#c41e3a" />

                                            {/* Phase 4: Resonance & Rituals HUD */}
                                            <div className={styles.statusAura}>
                                                {/* Dash / Flicker Status */}
                                                <div 
                                                    className={`${styles.statusBadge} ${isDashReady ? styles.dashReady : styles.dashCooldown} ${flickerTicks > 0 ? styles.flickerActive : ''}`}
                                                    title={flickerTicks > 0 ? `Flicker active for ${(flickerTicks * 20 / 1000).toFixed(1)}s` : (isDashReady ? 'Next hit will be negated' : `Recharging: ${(dashCooldownTicks * 20 / 1000).toFixed(1)}s`)}
                                                >
                                                    <span className={styles.statusIcon}>{isDashReady ? '💨' : '⌛'}</span>
                                                    <span className={styles.statusText}>
                                                        {flickerTicks > 0 ? 'FLICKER' : (isDashReady ? 'DASH READY' : 'RECHARGING')}
                                                    </span>
                                                </div>

                                                {/* Ironbound Status */}
                                                {isIronbound && (
                                                    <div className={`${styles.statusBadge} ${styles.ironbound}`} title={`Stagger Immunity: ${(ironboundTicks * 20 / 1000).toFixed(1)}s`}>
                                                        <span className={styles.statusIcon}>🛡️</span>
                                                        <span className={styles.statusText}>IRONBOUND</span>
                                                    </div>
                                                )}

                                                {/* Armor Indicator (Visible when boosted by rituals/resonance) */}
                                                {derived.flatArmor > 0 && (
                                                    <div className={`${styles.statusBadge} ${styles.armorStatus}`} title={`Flat Armor: ${derived.flatArmor} reduction per hit`}>
                                                        <span className={styles.statusIcon}>🛡️</span>
                                                        <span className={styles.statusText}>{derived.flatArmor}</span>
                                                    </div>
                                                )}

                                                {/* Active Rituals */}
                                                <div className={styles.ritualBadges}>
                                                    {activeRituals.map(ritualId => {
                                                        const isFrenzy = ritualId === 'ritual_frenzy';
                                                        
                                                        const name = isFrenzy ? 'Ritual of Frenzy' : 'Ritual of Bracing';
                                                        const desc = isFrenzy ? '+50% Scent, +20% Loot' : '+15 Armor, -20% Speed';
                                                        const emoji = isFrenzy ? '🔥' : '🛡️';

                                                        return (
                                                            <div key={ritualId} className={styles.ritualBadge} title={`${name}: ${desc}`}>
                                                                {emoji}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Combat stats: Hit% and Max Hit */}
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
                                                <div className={styles.arenaStatBox} title="Total Refinement Level across all equipment">
                                                    <span className={styles.arenaStatLabel}>Refined</span>
                                                    <span className={`${styles.arenaStatValue} ${styles.refinementText}`}>
                                                        +{Object.values(equipment).reduce((sum, item) => sum + (item?.refinement ?? 0), 0)}
                                                    </span>
                                                </div>
                                            </div>

                                            </div>
                                        </div>

                                    <div className={`${styles.enemyCard} ${activeEnemy.isElite ? styles.eliteCard : ''} ${isCritFlashing ? styles.enemyCardCrit : ''}`} style={{ position: 'relative' }}>
                                        <div className={styles.enemySplatOverlay} style={{ top: '40%', left: '50%' }}>
                                            <DamageSplats isPlayer={false} />
                                        </div>

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
                                                    <span>Hit %: {Math.round(calcHitChance(activeEnemy.accuracy, derived.evasionRating) * 100)}%</span>
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
                                </div>
                            )}

                            <div className={styles.bottomBarArea}>
                                <ConsumablePanel />
                            </div>
                        </div>

                        {/* Right Side: Battle Records */}
                        <div className={styles.combatRightSidebar}>
                            <h2 className={styles.sidebarHeader}>📜 Battle Records</h2>
                            <CombatLog />
                            <SessionReport 
                                onOpenCombatGains={() => setShowGains(true)} 
                                onOpenHuntingGains={() => setShowHuntingGains(true)} 
                            />
                        </div>
                    </div>
                )}
            </div>

            <NotificationContainer />

            {showGains && <IdleGainPanel onClose={() => setShowGains(false)} />}
            {showHuntingGains && (
                <SessionSummaryModal 
                    active={isRunning} 
                    onClose={() => setShowHuntingGains(false)} 
                />
            )}

            {unsealToast && (
                <div className={styles.unsealToast}>
                    <div className={styles.toastTitle}>Crucible Unsealed</div>
                    <div className={styles.toastBody}>The Sanctum responds to your survival</div>
                </div>
            )}
        </div>
    );
}
