// =============================================================================
// CRIMSON ENGINE — Formula Unit Tests (Vitest)
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
    calcAttackInterval,
    calcHitChance,
    applyMitigation,
    calcBaseMaxHit,
    calcMaxHp,
    rollDamage,
} from '../engine/formulas';
import { MIN_ATTACK_INTERVAL, MAX_HIT_CHANCE, MIN_HIT_CHANCE } from '../engine/constants';
import { getLevelFromXp, getXpForLevel, getXpProgress } from '../engine/xpTable';
import { rollLoot } from '../engine/lootRoller';

// --- Attack Interval ---
describe('calcAttackInterval', () => {
    it('returns MIN_ATTACK_INTERVAL when result is below floor', () => {
        expect(calcAttackInterval(1.0, [0.9], 0.5)).toBe(MIN_ATTACK_INTERVAL);
    });

    it('applies multiplicative % reductions correctly', () => {
        // 3.0 * (1-0.2) * (1-0.15) = 3.0 * 0.8 * 0.85 = 2.04
        expect(calcAttackInterval(3.0, [0.20, 0.15], 0)).toBeCloseTo(2.04, 5);
    });

    it('applies flat reduction after % reductions', () => {
        // 3.0 * 0.8 * 0.85 - 0.2 = 1.84
        expect(calcAttackInterval(3.0, [0.20, 0.15], 0.2)).toBeCloseTo(1.84, 5);
    });
});

// --- Hit Chance ---
describe('calcHitChance', () => {
    it('clamps to MAX_HIT_CHANCE when accuracy >> evasion', () => {
        expect(calcHitChance(10000, 1)).toBe(MAX_HIT_CHANCE);
    });

    it('clamps to MIN_HIT_CHANCE when accuracy << evasion', () => {
        expect(calcHitChance(1, 10000)).toBe(MIN_HIT_CHANCE);
    });

    it('returns 0.5 when accuracy equals evasion (no bonus)', () => {
        expect(calcHitChance(100, 100, 0, 1, 1)).toBe(0.5);
    });
});

// --- Mitigation ---
describe('applyMitigation', () => {
    it('never reduces below 1', () => {
        expect(applyMitigation(5, 10, 0.75)).toBe(1);
        expect(applyMitigation(1, 0, 0.75)).toBe(1);
    });

    it('applies flat reduction before percentage', () => {
        // (10 - 3) * (1 - 0.20) = 7 * 0.8 = 5.6 → floor = 5
        expect(applyMitigation(10, 3, 0.20)).toBe(5);
    });

    it('respects 75% DR cap', () => {
        // DR capped at 0.75, so (10 - 0) * 0.25 = 2.5 → floor = 2
        expect(applyMitigation(10, 0, 0.99)).toBe(2);
    });
});

// --- Max Hit ---
describe('calcBaseMaxHit', () => {
    it('returns 1 at level 1', () => {
        expect(calcBaseMaxHit(1)).toBe(1);
    });

    it('returns correct value at level 20 (should be ~24)', () => {
        // floor(20 + 20^1.5 * 0.05) = floor(20 + 89.44 * 0.05) = floor(20 + 4.47) = 24
        expect(calcBaseMaxHit(20)).toBe(24);
    });

    it('returns 185 at level 120 (floor(120 + 120^1.5 * 0.05))', () => {
        // 120 + Math.pow(120, 1.5) * 0.05 = 120 + 65.76 = 185.76 → floor = 185
        expect(calcBaseMaxHit(120)).toBe(185);
    });
});

// --- Max HP ---
describe('calcMaxHp', () => {
    it('returns 10 for starting Vitae level (10)', () => {
        expect(calcMaxHp(10)).toBe(10);
    });

    it('returns 120 at max Vitae level (120)', () => {
        expect(calcMaxHp(120)).toBe(120);
    });
});

// --- Damage Roll ---
describe('rollDamage', () => {
    it('always returns at least 1', () => {
        for (let i = 0; i < 100; i++) {
            expect(rollDamage(0)).toBeGreaterThanOrEqual(1);
        }
    });

    it('never exceeds maxHit', () => {
        for (let i = 0; i < 200; i++) {
            expect(rollDamage(50)).toBeLessThanOrEqual(50);
        }
    });
});

// --- XP Table ---
describe('xpTable', () => {
    it('getXpForLevel(1) === 0', () => {
        expect(getXpForLevel(1)).toBe(0);
    });

    it('getXpForLevel(120) === 88_474_739', () => {
        expect(getXpForLevel(120)).toBe(88_474_739);
    });

    it('getLevelFromXp(988) === 10', () => {
        expect(getLevelFromXp(988)).toBe(10);
    });

    it('getLevelFromXp beyond cap returns 120', () => {
        expect(getLevelFromXp(500_000_001)).toBe(120);
    });

    it('getXpProgress is between 0 and 1', () => {
        expect(getXpProgress(500)).toBeGreaterThanOrEqual(0);
        expect(getXpProgress(500)).toBeLessThanOrEqual(1);
    });
});

// --- Loot Roller ---
describe('rollLoot', () => {
    it('returns null for empty table', () => {
        expect(rollLoot([])).toBeNull();
    });

    it('returns null for all-zero-weight table', () => {
        expect(rollLoot([{ itemId: 'x', itemName: 'X', weight: 0 }])).toBeNull();
    });

    it('returns the only item when only one entry', () => {
        expect(rollLoot([{ itemId: 'sword', itemName: 'Sword', weight: 100 }])).toBe('sword');
    });

    it('weight distribution is approximately correct over many rolls', () => {
        const table = [
            { itemId: 'common', itemName: 'Common', weight: 70 },
            { itemId: 'rare', itemName: 'Rare', weight: 30 },
        ];
        const counts: Record<string, number> = { common: 0, rare: 0 };
        const N = 10_000;
        for (let i = 0; i < N; i++) {
            const result = rollLoot(table)!;
            counts[result]++;
        }
        // common should be ~70% ± 5%
        expect(counts.common / N).toBeGreaterThan(0.65);
        expect(counts.common / N).toBeLessThan(0.75);
    });
});
