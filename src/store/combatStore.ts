// =============================================================================
// CRIMSON ENGINE — Combat Store (Zustand)
// Manages real-time combat state: meters, HP, log, zone, active enemy
// This store is updated every tick by the combat engine callbacks.
// =============================================================================

import { create } from 'zustand';
import { usePlayerStore } from './playerStore';
import type { Zone, Enemy, CombatEvent, PlayerSkills, StatWindowEntry, SessionStats } from '../engine/types';

const MAX_LOG_ENTRIES = 120;
const STATS_WINDOW_MS = 60000;

export interface DamageSplat {
    id: string;
    amount: number;
    isPlayer: boolean;
    type: 'hit' | 'miss' | 'block' | 'heal';
    isCritical?: boolean;
    timestamp: number;
}

interface CombatState {
    // Zone & Enemy
    selectedZone: Zone | null;
    activeEnemy: Enemy | null;
    enemyIndex: number;

    // HP
    playerHp: number;
    playerMaxHp: number;
    enemyHp: number;
    enemyMaxHp: number;

    // Attack Meters (0.0 → 1.0)
    playerMeter: number;
    enemyMeter: number;

    // Status
    isRunning: boolean;
    isDead: boolean;
    currentTick: number;
    // Phase 2C Status
    activeEvent: string | null;
    isBossPending: boolean;
    scentIntensity: number;
    lastEnemyCritStamp: number;

    // Event Log
    log: CombatEvent[];
    splats: DamageSplat[];

    // Stats Tracking
    statsWindow: StatWindowEntry[];
    statsStartTime: number | null;

    // Session Tracking
    sessionStats: SessionStats | null;
    lastSession: SessionStats | null;

    // Actions
    setZone: (zone: Zone) => void;
    setEnemy: (enemy: Enemy | null) => void;
    setRunning: (running: boolean) => void;
    setDead: (dead: boolean) => void;
    tickUpdate: (playerMeter: number, enemyMeter: number, playerHp: number, enemyHp: number, tick: number) => void;
    applyXpGains: (gains: Partial<PlayerSkills>) => void;
    addLogEvent: (event: CombatEvent) => void;
    addSplat: (splat: DamageSplat) => void;
    removeSplat: (id: string) => void;
    resetCombat: () => void;
    fleeCombat: () => void;
    initPlayer: (maxHp: number) => void;
    updateCombatState: (updates: any) => void;

    // Stats Actions
    recordStat: (type: StatWindowEntry['type'], value: number) => void;
    pruneStats: () => void;

    // Session Actions
    startSession: () => void;
    updateSession: (patch: Partial<SessionStats> | ((prev: SessionStats) => Partial<SessionStats>)) => void;
    endSession: (wasSlain?: boolean, tickCount?: number, redMistSurvived?: boolean, lastScentIntensity?: number) => void;
    clearLastSession: () => void;
}

export const useCombatStore = create<CombatState>()((set) => ({
    selectedZone: null,
    activeEnemy: null,
    enemyIndex: 0,

    playerHp: 10,
    playerMaxHp: 10,
    enemyHp: 0,
    enemyMaxHp: 0,

    playerMeter: 0,
    enemyMeter: 0,

    isRunning: false,
    isDead: false,
    currentTick: 0,
    activeEvent: null,
    isBossPending: false,
    scentIntensity: 0,
    lastEnemyCritStamp: 0,
    log: [],
    splats: [],
    statsWindow: [],
    statsStartTime: null,
    sessionStats: null,
    lastSession: null,

    setZone: (zone) => set({ selectedZone: zone, isRunning: false, activeEnemy: null }),

    setEnemy: (enemy) => {
        if (!enemy) {
            set({ activeEnemy: null, enemyHp: 0, enemyMaxHp: 0, playerMeter: 0, enemyMeter: 0 });
            return;
        }
        set({
            activeEnemy: enemy,
            enemyHp: enemy.stats.hp,
            enemyMaxHp: enemy.stats.hp,
            playerMeter: 0,
            enemyMeter: 0,
            isRunning: false, // Don't auto-start
        });
    },

    setRunning: (running) => set({ isRunning: running }),

    setDead: (dead) => set({ isDead: dead, isRunning: false }),

    tickUpdate: (playerMeter, enemyMeter, playerHp, enemyHp, currentTick) =>
        set({ playerMeter, enemyMeter, playerHp, enemyHp, currentTick }),

    applyXpGains: (_gains) => {
        // XP is applied directly to playerStore — this is a hook for UI effects
        // (e.g. show level-up animation). The actual XP mutation happens in playerStore.
    },

    addLogEvent: (event) =>
        set((state) => ({
            log: [event, ...state.log].slice(0, MAX_LOG_ENTRIES),
        })),

    addSplat: (splat) =>
        set((state) => ({
            splats: [...state.splats, splat]
        })),

    removeSplat: (id) =>
        set((state) => ({
            splats: state.splats.filter(s => s.id !== id)
        })),

    initPlayer: (maxHp) => set({ playerHp: maxHp, playerMaxHp: maxHp }),

    resetCombat: () =>
        set({
            activeEnemy: null,
            enemyHp: 0,
            enemyMaxHp: 0,
            playerMeter: 0,
            enemyMeter: 0,
            isRunning: false,
            isDead: false,
            currentTick: 0,
            activeEvent: null,
            isBossPending: false,
            scentIntensity: 0,
            lastEnemyCritStamp: 0,
            log: [],
            splats: [],
            statsWindow: [],
            statsStartTime: null,
        }),

    // Flee: stop combat and return to zone select, but keep the log
    fleeCombat: () =>
        set({
            activeEnemy: null,
            enemyHp: 0,
            enemyMaxHp: 0,
            playerMeter: 0,
            enemyMeter: 0,
            isRunning: false,
            isDead: false,
            splats: [],
            statsWindow: [],
            statsStartTime: null,
        }),

    recordStat: (type, value) => {
        const now = Date.now();
        set((state) => {
            const statsStartTime = state.statsStartTime === null ? now : state.statsStartTime;
            return {
                statsWindow: [...state.statsWindow, { timestamp: now, type, value }],
                statsStartTime
            };
        });
    },

    pruneStats: () => {
        const now = Date.now();
        set((state) => ({
            statsWindow: state.statsWindow.filter(e => now - e.timestamp <= STATS_WINDOW_MS)
        }));
    },

    startSession: () => set({
        sessionStats: {
            startTime: Date.now(),
            kills: 0,
            xpGained: 0,
            lootCount: 0,
            lootItems: [],
            bloodShardsGained: 0,
            cursedIchorGained: 0,
            graveSteelGained: 0,
            bossesSlain: 0
        },
        lastSession: null
    }),

    updateSession: (patch) => set((state) => {
        if (!state.sessionStats) return {};
        const patchObj = typeof patch === 'function' ? patch(state.sessionStats) : patch;
        return {
            sessionStats: { ...state.sessionStats, ...patchObj }
        };
    }),

    endSession: (wasSlain?: boolean, tickCount?: number, redMistSurvived?: boolean, lastScentIntensity?: number) => set((state) => {
        if (!state.sessionStats) return {};
        const lastSession = { 
            ...state.sessionStats, 
            endTime: Date.now(), 
            wasSlain,
            lastScentIntensity: lastScentIntensity ?? 0
        };

        // Phase 2B: Crucible Seal Reset Logic
        // 1. Never reset on death.
        // 2. Reset if 50+ ticks or Red Mist survived.
        if (!wasSlain) {
            const duration = tickCount ?? state.currentTick;
            if (duration >= 50 || redMistSurvived) {
                // Bridge to playerStore
                usePlayerStore.getState().resetCrucibleSeal();
            }
        }

        return {
            sessionStats: null,
            lastSession
        };
    }),

    clearLastSession: () => set({ lastSession: null }),

    updateCombatState: (updates) => set(() => ({
        ...updates
    })),
}));
