// =============================================================================
// CRIMSON ENGINE — Combat Hook
// Bridges the CombatEngine class with React/Zustand.
// =============================================================================

import { useEffect, useCallback, useMemo } from 'react';
import { CombatEngine } from '../../engine/combatLoop';
import type { CombatCallbacks } from '../../engine/combatLoop';
import type { Zone, Enemy, InventoryItem } from '../../engine/types';
import { usePlayerStore } from '../../store/playerStore';
import { useCombatStore } from '../../store/combatStore';
import { useSkillingStore } from '../../store/skillingStore';
import { useNotificationStore } from '../../store/notificationStore';
import { computeDerivedStats, calculatePathResonance } from '../../engine/formulas';
import { getEnemiesForZone } from '../../data/enemies';

const sharedEngine = new CombatEngine({
    onPlayerAttack: () => {},
    onEnemyAttack: () => {},
    onEnemyDeath: () => {},
    onHitXp: () => {},
    onPlayerDeath: () => {},
    onRespawn: () => {},
    onTick: () => {},
    onAutoEat: () => {},
    onLog: () => {},
    onLoot: () => {},
    sanguineFinesse: () => {},
    vileReinforcement: () => {},
    getEnemyData: () => null,
});

export function useCombatEngine() {
    const {
        setEnemy, setRunning, setDead, tickUpdate, resetCombat, initPlayer,
        pruneStats, setZone, startSession, endSession,
        addSplat, removeSplat, addLogEvent,
        updateSession, recordStat, updateCombatState 
    } = useCombatStore();

    // Use specific selectors for only what we need to react to in the hook's scope.
    // Most logic can use getState() inside the callbacks to avoid re-renders.
    const gainXp = usePlayerStore(s => s.gainXp);
    const addLootLog = usePlayerStore(s => s.addLootLog);
    const setVitae = usePlayerStore(s => s.setVitae);
    const setFinesseTicks = usePlayerStore(s => s.setFinesseTicks);

    const { addNotification } = useNotificationStore();

    /** Build shared callbacks — extracted to avoid duplication */
    const buildCallbacks = useMemo<CombatCallbacks>(() => ({
        onPlayerAttack: (result) => {
            const splatType = result.blocked ? 'block' : (!result.hit ? 'miss' : 'hit');
            const id = `player-splat-${Date.now()}-${Math.random()}`;
            addSplat({
                id,
                amount: result.damage,
                isPlayer: false, // Enemy receiving damage
                type: splatType,
                isCritical: result.isCritical,
                timestamp: Date.now()
            });
            setTimeout(() => removeSplat(id), 2000);

            if (result.isCritical) {
                updateCombatState({ lastEnemyCritStamp: Date.now() });
            }
            if (result.damage > 0) recordStat('xp', Math.floor(result.damage * 0.4));
        },
        onEnemyAttack: (result) => {
            const splatType = result.blocked ? 'block' : (!result.hit ? 'miss' : 'hit');
            const id = `enemy-splat-${Date.now()}-${Math.random()}`;
            addSplat({
                id,
                amount: result.damage,
                isPlayer: true, // Player receiving damage
                type: splatType,
                isCritical: result.isCritical,
                timestamp: Date.now()
            });
            setTimeout(() => removeSplat(id), 2000);
        },
        onEnemyDeath: (_, sessionStats, loot) => {
            // XP is now per-hit; only handle loot here
            if (loot) {
                addLootLog(loot);
                addLogEvent({
                    id: `loot-${Date.now()}`,
                    type: 'loot',
                    tick: 0,
                    message: `Looted: ${loot.itemName}`,
                });
                addNotification({
                    type: 'loot',
                    label: loot.itemName,
                    amount: 1, // Loot drops are 1 at a time usually
                    icon: '🎁' // Fallback icon, logic in component handles IDs
                });
                recordStat('loot', 1);
                
                // Track session loot
                updateSession(prev => ({
                    lootCount: prev.lootCount + 1,
                    lootItems: [...prev.lootItems, {
                        itemId: loot.itemId,
                        itemName: loot.itemName,
                        quantity: 1,
                        timestamp: Date.now()
                    }]
                }));
            }
            recordStat('kill', 1);
            updateSession(prev => ({ 
                kills: prev.kills + 1,
                bossesSlain: prev.bossesSlain + (sessionStats.isBoss ? 1 : 0)
            }));
        },
        onHitXp: (gains) => {
            // Award XP per successful hit
            Object.entries(gains).forEach(([skill, data]) => {
                const xpAmount = (data as any).xp;
                if (xpAmount && xpAmount > 0) {
                    gainXp(skill as any, xpAmount);
                    
                    // Show floating notification for XP gain
                    addNotification({
                        type: 'xp',
                        label: skill.charAt(0).toUpperCase() + skill.slice(1),
                        amount: xpAmount,
                    });
                    recordStat('xp', xpAmount);
                    updateSession(prev => ({ xpGained: prev.xpGained + xpAmount }));
                }
            });
        },
        onPlayerDeath: (isBraced, isRedMist) => {
            const currentSkills = usePlayerStore.getState().skills;
            const currentEquipment = usePlayerStore.getState().equipment;
            const maxHp = computeDerivedStats(currentSkills, currentEquipment).maxHp;
            
            // 1. Restore HP
            setVitae(maxHp);
            initPlayer(maxHp);
            
            // 2. Stop UI (The engine already stopped itself)
            setRunning(false);
            setEnemy(null);

            // 3. Penalties
            usePlayerStore.getState().applyDeathPenalties(isBraced, isRedMist);
            recordStat('death', 1);

            // 3. Status
            addLogEvent({
                id: `death-${Date.now()}`,
                type: 'player_death',
                tick: 0,
                message: "☠️ SLAIN! You have been defeated and returned home.",
            });
            addNotification({
                type: 'death',
                label: 'DEFEATED!',
                amount: 0,
            });

            // 4. End session and return Home
            endSession(true, sharedEngine.tickCount, sharedEngine.redMistSurvived, sharedEngine.scentIntensity, {
                flickerTriggers: (sharedEngine as any).flickerTriggers,
                ironboundTriggers: (sharedEngine as any).ironboundTriggers,
                peakScent: (sharedEngine as any).peakScent,
                timeAbove60Scent: (sharedEngine as any).timeAbove60Scent,
                timeAbove80Scent: (sharedEngine as any).timeAbove80Scent
            }); 
            sharedEngine.stop();
            setRunning(false);
            setEnemy(null);
            setDead(false); // Reset dead flag so UI doesn't show old banner
        },

        onRespawn: (enemy) => {
            setEnemy(enemy);
            setRunning(true);
        },
        onTick: (activeCombat) => {
            const { playerMeter, enemyMeter, playerHp, enemyHp, currentTick } = activeCombat;
            tickUpdate(playerMeter, enemyMeter, playerHp, enemyHp, currentTick);
            setVitae(playerHp); // Sync to persistent store
            
            // Sync Phase 2A/2C status back to store if needed for UI
            if (activeCombat) {
                if (activeCombat.finesseTicksRemaining !== undefined) {
                    setFinesseTicks(activeCombat.finesseTicksRemaining);
                }
                // Phase 2C to Phase 4: Update the store's knowledge of events and boss status
                useCombatStore.getState().updateCombatState({
                    scentIntensity: activeCombat.scentIntensity,
                    activeEvent: activeCombat.activeEvent,
                    isBossPending: activeCombat.isBossPending,
                    isDashReady: activeCombat.isDashReady,
                    dashCooldownTicks: activeCombat.dashCooldownTicks,
                    flickerTicks: activeCombat.flickerTicks,
                    isIronbound: activeCombat.isIronbound,
                    ironboundTicks: activeCombat.ironboundTicks,
                    activeRituals: activeCombat.activeRituals,
                    // Phase 4 S4 Metrics
                    flickerTriggers: activeCombat.flickerTriggers,
                    ironboundTriggers: activeCombat.ironboundTriggers,
                    peakScent: activeCombat.peakScent,
                    timeAbove60Scent: activeCombat.timeAbove60Scent,
                    timeAbove80Scent: activeCombat.timeAbove80Scent,
                    queuedBloodEchoId: activeCombat.queuedBloodEchoId,
                    scentLockTicks: activeCombat.scentLockTicks
                });
            }

            if (currentTick % 50 === 0) pruneStats();
        },
        onAutoEat: (healed) => {
            // Find the first available food to consume in the store
            const currentFood = usePlayerStore.getState().food.find(f => f.quantity > 0);
            if (currentFood) {
                usePlayerStore.getState().consumeFood(currentFood.id);
            }

            // Show green heal splat
            const id = `heal-${Date.now()}-${Math.random()}`;
            addSplat({
                id,
                amount: healed,
                isPlayer: true,
                type: 'heal',
                timestamp: Date.now()
            });
            setTimeout(() => removeSplat(id), 2000);
        },
        onLog: (event) => addLogEvent(event),
        onLoot: (loot, isRedMist) => {
            // Check if it's a Phase 2A core resource
            if (loot.itemId === 'blood_shard' || loot.itemId === 'cursed_ichor' || loot.itemId === 'grave_steel') {
                const shards = loot.itemId === 'blood_shard' ? loot.quantity : 0;
                const ichor = loot.itemId === 'cursed_ichor' ? loot.quantity : 0;
                const steel = loot.itemId === 'grave_steel' ? loot.quantity : 0;
                
                usePlayerStore.getState().addUnbankedLoot(shards, steel, ichor, isRedMist);
                
                updateSession(prev => ({
                    bloodShardsGained: prev.bloodShardsGained + shards,
                    cursedIchorGained: prev.cursedIchorGained + ichor,
                    graveSteelGained: prev.graveSteelGained + steel
                }));

                // Phase 2A: No longer pausing on rare drops (Phase 4 Continuous Hunt)
                if (ichor > 0 || steel > 0) {
                    // sharedEngine.stop(); // REMOVED
                    // setRunning(false); // REMOVED
                }
                
                // Still show notification for major resources
                if (ichor > 0 || shards > 20) {
                    addNotification({
                        type: 'loot',
                        label: loot.itemName,
                        amount: loot.quantity,
                        icon: '💎'
                    });
                }
            } else {
                // Legacy loot logic
                addLootLog({ itemId: loot.itemId, itemName: loot.itemName });
            }
        },
        sanguineFinesse: () => usePlayerStore.getState().sanguineFinesse(),
        vileReinforcement: () => usePlayerStore.getState().vileReinforcement(),
        getEnemyData: (id) => {
            const currentZone = useCombatStore.getState().selectedZone;
            if (!currentZone) return null;
            const enemies = getEnemiesForZone(currentZone.id);
            return enemies.find(e => e.id === id) || null;
        },
    }), [
        gainXp, setDead, setRunning, setEnemy, tickUpdate, 
        addLogEvent, addLootLog, addSplat, removeSplat, 
        addNotification, recordStat, pruneStats,
        startSession, updateSession, endSession,
        // Dependencies from usePlayerStore actions called directly in callbacks
        // These are not direct state values but functions from the store,
        // so they should be stable or memoized within the store itself.
        // However, if they are passed as props or derived from props, they need to be here.
        // For now, assuming they are stable or implicitly handled by store's stability.
        // Explicitly listing those that are passed as props or are part of the hook's scope.
        // applyDeathPenalties, addUnbankedLoot, consumeFood, siphon, sanguineFinesse, vileReinforcement
        // The above are called via usePlayerStore.getState().action(), so they don't need to be in this array.
        // Only direct dependencies from the outer scope are needed.
        setFinesseTicks,
        initPlayer, // Used in onPlayerDeath
        setVitae, // Used in onPlayerDeath, onTick
        updateCombatState,
    ]);

    // Every time dependencies change, update the engine's callbacks reference
    useEffect(() => {
        sharedEngine.setCallbacks(buildCallbacks);
    }, [buildCallbacks]);

    /** Start combat from zone default (first enemy) */
    const startCombat = useCallback((zone: Zone) => {
        resetCombat();
        const enemies = getEnemiesForZone(zone.id);
        if (!enemies.length) return;

        const playerState = usePlayerStore.getState();
        const derived = computeDerivedStats(playerState.skills, playerState.equipment);
        initPlayer(derived.maxHp); 

        const firstEnemy = enemies[0];
        setZone(zone);
        sharedEngine.setEnemy(firstEnemy);
        setEnemy(firstEnemy);
        
        const combatState = useCombatStore.getState();
        const resonance = calculatePathResonance(playerState.equipment);

        useSkillingStore.getState().stopAction();

        sharedEngine.start(
            zone, playerState.skills, playerState.equipment, playerState.food, 
            playerState.autoEatEnabled, playerState.autoEatThreshold, 
            playerState.currentVitae, playerState.trainingMode,
            { 
                isBraced: playerState.isBraced, 
                permanentArmorBonus: playerState.permanentArmorBonus, 
                bloodShards: playerState.bloodShards, 
                finesseTicksRemaining: playerState.finesseTicksRemaining 
            },
            combatState.activeRitualModifiers,
            resonance,
            combatState.activeRituals
        );
        startSession();
        setRunning(true);
    }, [setEnemy, setRunning, resetCombat, initPlayer, setZone, startSession]);

    /** Start combat with a specific player-chosen enemy */
    const startCombatWithEnemy = useCallback((zone: Zone, enemy: Enemy) => {
        resetCombat();

        const playerState = usePlayerStore.getState();
        const derived = computeDerivedStats(playerState.skills, playerState.equipment);
        initPlayer(derived.maxHp);

        setZone(zone);
        
        const combatState = useCombatStore.getState();
        const resonance = calculatePathResonance(playerState.equipment);

        useSkillingStore.getState().stopAction();
        
        sharedEngine.start(
            zone, playerState.skills, playerState.equipment, playerState.food, 
            playerState.autoEatEnabled, playerState.autoEatThreshold, 
            playerState.currentVitae, playerState.trainingMode,
            { 
                isBraced: playerState.isBraced, 
                permanentArmorBonus: playerState.permanentArmorBonus, 
                bloodShards: playerState.bloodShards, 
                finesseTicksRemaining: playerState.finesseTicksRemaining 
            },
            combatState.activeRitualModifiers,
            resonance,
            combatState.activeRituals,
            enemy
        );

        setEnemy(enemy);
        
        startSession();
        setRunning(true);
    }, [setEnemy, setRunning, resetCombat, initPlayer, setZone, startSession]);

    const stopCombat = useCallback(() => {
        sharedEngine.stop();
        setRunning(false);
    }, [setRunning]);

    /** Flee: stop the engine, clear combat state, keep the log */
    const fleeFromCombat = useCallback(() => {
        const tickCount = sharedEngine.tickCount;
        const redMistSurvived = sharedEngine.redMistSurvived;
        const lastScentIntensity = sharedEngine.scentIntensity;
        
        sharedEngine.stop();
        setRunning(false);
        // Bank unbanked resources securely on Flee
        usePlayerStore.getState().withdraw();
        endSession(false, tickCount, redMistSurvived, lastScentIntensity);
        resetCombat();
    }, [setRunning, resetCombat, endSession]);

    // Keep engine in sync if any relevant state changes mid-session
    // We subscribe to specific changes to update the engine without re-rendering the hook
    useEffect(() => {
        const unsub = usePlayerStore.subscribe((state) => {
            if (sharedEngine.running) {
                const combatState = useCombatStore.getState();
                const resonance = calculatePathResonance(state.equipment);

                sharedEngine.updatePlayerState(
                    state.skills, state.equipment, state.food, state.trainingMode, 
                    state.autoEatEnabled, state.autoEatThreshold,
                    { 
                        isBraced: state.isBraced, 
                        permanentArmorBonus: state.permanentArmorBonus, 
                        bloodShards: state.bloodShards, 
                        finesseTicksRemaining: state.finesseTicksRemaining 
                    },
                    combatState.activeRitualModifiers,
                    resonance,
                    combatState.activeRituals
                );
            }
        });
        return unsub;
    }, []);

    /** Manual consumption from UI */
    const handleUseConsumable = useCallback((item: InventoryItem) => {
        if (item.type !== 'food' || !item.healAmount) return;
        if (item.quantity <= 0) return;

        let healed = 0;
        if (sharedEngine.running) {
            healed = sharedEngine.heal(item.healAmount);
        } else {
            const { playerHp, playerMaxHp, tickUpdate } = useCombatStore.getState();
            healed = Math.min(item.healAmount, playerMaxHp - playerHp);
            if (healed > 0) {
                const newHp = playerHp + healed;
                tickUpdate(
                    useCombatStore.getState().playerMeter,
                    useCombatStore.getState().enemyMeter,
                    newHp,
                    useCombatStore.getState().enemyHp,
                    useCombatStore.getState().currentTick
                );
            }
        }

        if (healed > 0) {
            usePlayerStore.getState().consumeFood(item.id);
            
            const id = `heal-manual-${Date.now()}`;
            addSplat({
                id, amount: healed, isPlayer: true, type: 'heal', timestamp: Date.now()
            });
            setTimeout(() => removeSplat(id), 2000);
        }
    }, [addSplat, removeSplat]);

    return { startCombat, startCombatWithEnemy, stopCombat, fleeFromCombat, handleUseConsumable };
}
