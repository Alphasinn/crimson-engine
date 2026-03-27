import { useCallback, useState, useRef, useEffect } from 'react';
import { useCombatStore } from '../../store/combatStore';
import { usePlayerStore } from '../../store/playerStore';
import { useShallow } from 'zustand/react/shallow';
import { useCombatEngine } from './useCombatEngine';
import { PrepArea } from './PrepArea';
import { FightArena } from './FightArena';
import { IdleGainPanel } from '../ui/IdleGainPanel';
import { SessionSummaryModal } from '../ui/SessionSummaryModal';
import { EnemyRoster } from './EnemyRoster';
import { SessionReport } from './SessionReport';
import { NotificationContainer } from '../ui/NotificationContainer';
import ZONES from '../../data/zones';
import type { Zone, Enemy } from '../../engine/types';

import styles from './combat.module.scss';

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
    // High-level layout state only
    const {
        selectedZone, activeEnemy, isRunning,
        viewMode, setViewMode, currentTick
    } = useCombatStore(useShallow(s => ({
        selectedZone: s.selectedZone,
        activeEnemy: s.activeEnemy,
        isRunning: s.isRunning,
        viewMode: s.viewMode,
        setViewMode: s.setViewMode,
        currentTick: s.currentTick
    })));

    const { 
        crucibleSealed, resetCrucibleSeal
    } = usePlayerStore(useShallow(s => ({
        crucibleSealed: s.crucibleSealed,
        resetCrucibleSeal: s.resetCrucibleSeal
    })));

    const { startCombatWithEnemy, fleeFromCombat } = useCombatEngine();

    // Track last active zone in a ref so it survives the flee state reset
    const lastZoneIdRef = useRef<string | null>(null);
    
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
    const lastHandledUnsealTick = useRef(-1);
    useEffect(() => {
        if (isRunning && crucibleSealed && currentTick >= 50 && currentTick > lastHandledUnsealTick.current) {
            lastHandledUnsealTick.current = currentTick;
            resetCrucibleSeal();
            setUnsealToast(true);
            const timer = setTimeout(() => setUnsealToast(false), 4000);
            return () => clearTimeout(timer);
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

    const handleFlee = useCallback(() => {
        fleeFromCombat();
        setViewMode('home');
        setShowHuntingGains(true);
    }, [fleeFromCombat, setViewMode]);

    const handleHome = useCallback(() => {
        setViewMode('home');
    }, [setViewMode]);

    const showZoneGrid = viewMode === 'home' || (!isRunning && !activeEnemy);

    return (
        <div className={styles.root}>
            <div className={styles.centerPanel}>
                {showZoneGrid ? (
                    <div className={styles.selectionLayout}>
                        <div className={styles.prepSidebar}>
                            <h2 className={styles.sidebarHeader}>🧛 Preparation Hub</h2>
                            <PrepArea showZoneGrid={true} />
                        </div>

                        <div className={styles.zoneTabSystem}>
                            <div className={styles.zoneNavHeader}>
                                <div className={styles.zoneTabsArea}>
                                    {ZONES.map((z: Zone) => (
                                        <div 
                                            key={z.id} 
                                            className={`${styles.zoneTab} ${expandedZoneId === z.id ? styles.active : ''}`}
                                            onClick={() => handleZoneClick(z)}
                                        >
                                            <span className={styles.tabName}>{z.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.zoneDisplayArea}>
                                {expandedZoneId ? (() => {
                                    const selectedZoneObj = ZONES.find((z: Zone) => z.id === expandedZoneId);
                                    if (!selectedZoneObj) return null;
                                    
                                    const bgMap: Record<string, string> = {
                                        'forgotten_hamlet': 'forgotten_hamlet.png',
                                        'grimwood_forest': 'grimwood_forest.png',
                                        'blackthorn_city': 'blackthorn_city.png',
                                        'catacombs': 'catacombs.png',
                                        'crimson_highlands': 'crimson_highlands.png',
                                        'night_citadel': 'night_citadel.png'
                                    };
                                    const bgImage = bgMap[selectedZoneObj.id] || 'forgotten_hamlet.png';

                                    return (
                                        <div 
                                            className={styles.immersiveZonePanel}
                                            style={{ backgroundImage: `url(/assets/zones/${bgImage})` }}
                                        >
                                            <div className={styles.panelOverlay}>
                                                <div className={styles.zoneInfoBlock}>
                                                    <h1 className={styles.panelTitle}>{selectedZoneObj.name}</h1>
                                                    <div className={styles.panelMeta}>
                                                        <span>LEVEL RANGE: {selectedZoneObj.recommendedLevelMin}–{selectedZoneObj.recommendedLevelMax}</span>
                                                        <span className={styles.separator}>•</span>
                                                        <span>DROP TIER: {selectedZoneObj.dropTier}</span>
                                                    </div>
                                                    <p className={styles.panelDesc}>{selectedZoneObj.description}</p>
                                                </div>

                                                <div className={styles.rosterBlock}>
                                                    <EnemyRoster
                                                        zone={selectedZoneObj}
                                                        onSelect={(enemy) => handleEnemySelect(selectedZoneObj, enemy)}
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
                    <div className={styles.combatLayout}>
                        <div className={styles.combatLeftSidebar}>
                            <h2 className={styles.sidebarHeader}>⚔️ Combat HUD</h2>
                            <PrepArea />
                            
                            <div className={styles.arenaButtons}>
                                <button className={styles.homeBtn} onClick={handleHome}>
                                    🏠 Home
                                </button>
                                <button className={styles.fleeBtn} onClick={handleFlee}>
                                    🏃 Flee Combat
                                </button>
                            </div>
                        </div>

                        <FightArena />

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
