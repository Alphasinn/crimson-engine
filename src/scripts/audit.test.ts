import { describe, it, expect } from 'vitest';
import { computeDerivedStats } from '../engine/formulas';
import WEAPONS from '../data/weapons';
import ARMOR from '../data/armor';
import type { PlayerSkills, PlayerEquipment, EquipmentSlot, GearTier, Zone, SessionStats } from '../engine/types';
import { CombatEngine } from '../engine/combatLoop';
import { evaluateHuntPerformance } from '../engine/progression';
import { SCENT_INCREMENT } from '../engine/constants';

const MAX_SKILLS: PlayerSkills = {
    fangMastery: { level: 120, xp: 0 },
    predatorForce: { level: 120, xp: 0 },
    obsidianWard: { level: 120, xp: 0 },
    shadowArchery: { level: 120, xp: 0 },
    bloodSorcery: { level: 120, xp: 0 },
    vitae: { level: 120, xp: 0 }
};

function getTemplate(slot: EquipmentSlot, tier: GearTier): any {
    if (slot === 'weapon') {
        return WEAPONS.find(w => w.tier === tier && w.style === 'melee' && w.subStyle === 'stab');
    }
    return ARMOR.find(a => a.slot === slot && a.tier === tier && a.style === 'melee');
}

describe('Progression Math Audit', () => {
    const tiers: GearTier[] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

    tiers.forEach(tier => {
        it(`should maintain DR cap for ${tier} +5 (Vile)`, () => {
            const equipment: PlayerEquipment = {
                weapon: getTemplate('weapon', tier),
                helmet: getTemplate('helmet', tier),
                chest: getTemplate('chest', tier),
                legs: getTemplate('legs', tier),
                gloves: getTemplate('gloves', tier),
                boots: getTemplate('boots', tier)
            };

            // Apply +5 and Vile path
            Object.values(equipment).forEach(item => {
                if (item) {
                    item.refinement = 5;
                    item.specPath = 'vile';
                }
            });

            const stats = computeDerivedStats(MAX_SKILLS, equipment);
            console.log(`[${tier} Vile +5] DR: ${(stats.damageReduction * 100).toFixed(1)}%, MaxHit: ${stats.meleeMaxHit}, Block: ${stats.blockChance * 100}%`);
            
            // Critical assertion: DR must not exceed 75%
            expect(stats.damageReduction).toBeLessThanOrEqual(0.751);
            // Verify Vile Mastery (+2% block per master item, 6 items = +12%)
            expect(stats.blockChance).toBeGreaterThanOrEqual(0.12);
        });

        it(`should scale accuracy and speed for ${tier} +5 (Sanguine)`, () => {
            const equipment: PlayerEquipment = {
                weapon: getTemplate('weapon', tier),
                helmet: getTemplate('helmet', tier),
                chest: getTemplate('chest', tier),
                legs: getTemplate('legs', tier),
                gloves: getTemplate('gloves', tier),
                boots: getTemplate('boots', tier)
            };

            // Apply +5 and Sanguine path
            Object.values(equipment).forEach(item => {
                if (item) {
                    item.refinement = 5;
                    item.specPath = 'sanguine';
                }
            });

            const stats = computeDerivedStats(MAX_SKILLS, equipment);
            console.log(`[${tier} Sanguine +5] Acc: ${stats.accuracyRating}, Speed: ${stats.attackInterval.toFixed(2)}s, LS: ${stats.lifestealPercent * 100}%`);
            
            expect(stats.attackInterval).toBeGreaterThanOrEqual(0.6); 
            // Verify Sanguine Mastery (+1% siphon per master item, 6 items = +6%)
            expect(stats.siphonAmount).toBeGreaterThanOrEqual(0.06);
        });
    });

    describe('Scent Condensation Logic', () => {
        const mockCallbacks: any = {
            onPlayerAttack: () => {},
            onEnemyAttack: () => {},
            onEnemyDeath: () => {},
            onPlayerDeath: () => {},
            onRespawn: () => {},
            onTick: () => {},
            onAutoEat: () => {},
            onHitXp: () => {},
            onLog: () => {},
            onLoot: () => {},
            onTrySiphon: () => {},
            getEnemyData: () => null,
            sanguineFinesse: () => {},
            vileReinforcement: () => {},
        };

        const dummyZone: Zone = { id: 'test', name: 'Test', description: '', recommendedLevelMin: 1, recommendedLevelMax: 10, dropTier: 'T1', respawnBase: 1, enemyPool: [] };

        it('should enforce 80% scent threshold', () => {
            const engine = new CombatEngine(mockCallbacks);
            // @ts-ignore - for access to private for testing if needed, or just use start/get
            engine.start(dummyZone, MAX_SKILLS, {}, [], false, 0.5);
            
            // @ts-ignore
            engine._scentIntensity = 0.5;
            engine.condenseScent();
            expect(engine.scentIntensity).toBe(0.5); // No change
            
            // @ts-ignore
            engine._scentIntensity = 0.85;
            engine.condenseScent();
            expect(engine.scentIntensity).toBe(0.60); // -25%
        });

        it('should apply hybrid HP cost: max(40% current, 15% max)', () => {
            const engine = new CombatEngine(mockCallbacks);
            engine.start(dummyZone, MAX_SKILLS, {}, [], false, 0.5);
            
            // Max HP with MAX_SKILLS is usually high, let's say 100 for simplicity in logic
            // @ts-ignore
            engine.playerMaxHp = 100;
            // @ts-ignore
            engine.playerHp = 100;
            // @ts-ignore
            engine._scentIntensity = 0.9;

            // Scenario 1: High HP (40% of 100 = 40, 15% of 100 = 15) -> 40 cost
            engine.condenseScent();
            expect(engine['playerHp']).toBe(60);

            // Scenario 2: Med HP (40% of 60 = 24, 15% of 100 = 15) -> 24 cost
            // @ts-ignore
            engine._scentIntensity = 0.9;
            engine.condenseScent();
            expect(engine['playerHp']).toBe(36);

            // Scenario 3: Low HP (40% of 36 = 14.4, 15% of 100 = 15) -> 15 cost
            // @ts-ignore
            engine._scentIntensity = 0.9;
            engine.condenseScent();
            expect(engine['playerHp']).toBe(21);
        });

        it('should respect 1 HP safety floor', () => {
            const engine = new CombatEngine(mockCallbacks);
            engine.start(dummyZone, MAX_SKILLS, {}, [], false, 0.5);
            // @ts-ignore
            engine.playerMaxHp = 100;
            // @ts-ignore
            engine.playerHp = 10; // Very low
            // @ts-ignore
            engine._scentIntensity = 0.9;

            engine.condenseScent(); // Cost would be max(4, 15) = 15
            expect(engine['playerHp']).toBe(1); // Clamped to 1
        });

        describe('Phase 4 Sprint 4: Analysis & Alignment', () => {
            const dummySession: SessionStats = {
                startTime: Date.now(),
                kills: 10,
                xpGained: 100,
                lootCount: 5,
                lootItems: [],
                bloodShardsGained: 0,
                cursedIchorGained: 0,
                graveSteelGained: 0,
                wasSlain: false,
                bossesSlain: 0,
                lastScentIntensity: 0.2
            };

            it('should use new SCENT_INCREMENT (0.03)', () => {
                expect(SCENT_INCREMENT).toBe(0.03);
            });

            it('should apply 25% scent reduction on Siphon (multiplier 0.75)', () => {
                const engine = new CombatEngine({ 
                    ...mockCallbacks,
                    onTrySiphon: (_cost, cb) => cb(true) // Always succeed
                });
                engine.start(dummyZone, MAX_SKILLS, {}, [], false, 0.5);
                
                // @ts-ignore
                engine._scentIntensity = 0.40;
                // @ts-ignore
                engine.playerHp = 10; // Low HP to trigger siphon
                
                // @ts-ignore
                engine.trySiphon();
                
                expect(engine.scentIntensity).toBeCloseTo(0.30, 5); // 0.40 * 0.75
            });

            it('should award Mastery Bonus in HuntEvaluation', () => {
                const sessionWithRituals: SessionStats = {
                    ...dummySession,
                    activeRitualIds: ['ritual_frenzy', 'ritual_brace', 'ritual_famine'], // 3 rituals
                    peakScent: 0.85,
                    timeAbove60Scent: 50,
                    timeAbove80Scent: 20
                };

                const evalWithMastery = evaluateHuntPerformance(sessionWithRituals, 100, false, false);
                const evalWithoutMastery = evaluateHuntPerformance(dummySession, 100, false, false);

                console.log(`[Mastery Eval] Quality: ${evalWithMastery.quality} (with rituals/pressure)`);
                console.log(`[Baseline Eval] Quality: ${evalWithoutMastery.quality} (base survival/kills)`);

                expect(evalWithMastery.quality).toBeGreaterThan(evalWithoutMastery.quality);
                
                // Ritual bonus cap check (+0.09)
                const sessionWith4Rituals: SessionStats = { ...sessionWithRituals, activeRitualIds: ['r1', 'r2', 'r3', 'r4'] };
                const eval4 = evaluateHuntPerformance(sessionWith4Rituals, 100, false, false);
                const eval3 = evaluateHuntPerformance(sessionWithRituals, 100, false, false);
                expect(eval4.quality).toBe(eval3.quality); // Capped at +0.09
            });

            it('should apply escalating Condensation penalties', () => {
                const baseEval = evaluateHuntPerformance({ ...dummySession, condensationUses: 0 }, 100, false, false);
                const use1Eval = evaluateHuntPerformance({ ...dummySession, condensationUses: 1 }, 100, false, false);
                const use2Eval = evaluateHuntPerformance({ ...dummySession, condensationUses: 2 }, 100, false, false);
                const use3Eval = evaluateHuntPerformance({ ...dummySession, condensationUses: 3 }, 100, false, false);

                expect(use1Eval.quality).toBe(baseEval.quality); // 0-1 uses: no penalty
                expect(use2Eval.quality).toBeLessThan(use1Eval.quality); // 2 uses: -0.05
                expect(use3Eval.quality).toBeLessThan(use2Eval.quality); // 3 uses: -0.15 total penalty
            });
        });
    });
});
