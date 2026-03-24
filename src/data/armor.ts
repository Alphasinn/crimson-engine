// =============================================================================
// CRIMSON ENGINE — Armor Data (90 pieces across T1–T6)
// =============================================================================

import type { EquipmentItem } from '../engine/types';

const ARMOR: EquipmentItem[] = [
    // ==========================================
    // 1. MELEE ARMOR SETS (T1-T6)
    // ==========================================

    // --- T1: Rustborn Plate ---
    {
        id: 'rustborn_helm', name: 'Rustborn Helm', slot: 'helmet', tier: 'T1', levelRequirement: 1, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 0, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'rustborn_chest', name: 'Rustborn Chest', slot: 'chest', tier: 'T1', levelRequirement: 1, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 0, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'rustborn_legs', name: 'Rustborn Legs', slot: 'legs', tier: 'T1', levelRequirement: 1, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 0, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'rustborn_gloves', name: 'Rustborn Gloves', slot: 'gloves', tier: 'T1', levelRequirement: 1, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 0, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'rustborn_boots', name: 'Rustborn Boots', slot: 'boots', tier: 'T1', levelRequirement: 1, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 0, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T2: Iron Guard ---
    {
        id: 'iron_guard_helm', name: 'Iron Guard Helm', slot: 'helmet', tier: 'T2', levelRequirement: 20, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 0, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'iron_guard_chest', name: 'Iron Guard Chest', slot: 'chest', tier: 'T2', levelRequirement: 20, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 0, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'iron_guard_legs', name: 'Iron Guard Legs', slot: 'legs', tier: 'T2', levelRequirement: 20, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 0, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'iron_guard_gloves', name: 'Iron Guard Gloves', slot: 'gloves', tier: 'T2', levelRequirement: 20, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 0, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'iron_guard_boots', name: 'Iron Guard Boots', slot: 'boots', tier: 'T2', levelRequirement: 20, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 0, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T3: Blackthorn Bulwark ---
    {
        id: 'blackthorn_helm', name: 'Blackthorn Helm', slot: 'helmet', tier: 'T3', levelRequirement: 40, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 0, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'blackthorn_chest', name: 'Blackthorn Chest', slot: 'chest', tier: 'T3', levelRequirement: 40, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.065, evasionBonus: 0, blockChance: 0.05, flatArmor: 6,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'blackthorn_legs', name: 'Blackthorn Legs', slot: 'legs', tier: 'T3', levelRequirement: 40, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 0, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'blackthorn_gloves', name: 'Blackthorn Gloves', slot: 'gloves', tier: 'T3', levelRequirement: 40, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 0, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'blackthorn_boots', name: 'Blackthorn Boots', slot: 'boots', tier: 'T3', levelRequirement: 40, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 0, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T4: Ancient Sentinel ---
    {
        id: 'sentinel_helm', name: 'Sentinel Helm', slot: 'helmet', tier: 'T4', levelRequirement: 60, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.035, evasionBonus: 0, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'sentinel_chest', name: 'Sentinel Chest', slot: 'chest', tier: 'T4', levelRequirement: 60, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.095, evasionBonus: 0, blockChance: 0.08, flatArmor: 11,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'sentinel_legs', name: 'Sentinel Legs', slot: 'legs', tier: 'T4', levelRequirement: 60, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.06, evasionBonus: 0, blockChance: 0, flatArmor: 7,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'sentinel_gloves', name: 'Sentinel Gloves', slot: 'gloves', tier: 'T4', levelRequirement: 60, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 0, blockChance: 0, flatArmor: 3,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'sentinel_boots', name: 'Sentinel Boots', slot: 'boots', tier: 'T4', levelRequirement: 60, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 0, blockChance: 0, flatArmor: 3,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T5: Highland Warden ---
    {
        id: 'warden_helm', name: 'Warden Helm', slot: 'helmet', tier: 'T5', levelRequirement: 80, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.05, evasionBonus: 0, blockChance: 0, flatArmor: 6,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'warden_chest', name: 'Warden Chest', slot: 'chest', tier: 'T5', levelRequirement: 80, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.13, evasionBonus: 0, blockChance: 0.10, flatArmor: 17,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'warden_legs', name: 'Warden Legs', slot: 'legs', tier: 'T5', levelRequirement: 80, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.08, evasionBonus: 0, blockChance: 0, flatArmor: 11,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'warden_gloves', name: 'Warden Gloves', slot: 'gloves', tier: 'T5', levelRequirement: 80, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.03, evasionBonus: 0, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'warden_boots', name: 'Warden Boots', slot: 'boots', tier: 'T5', levelRequirement: 80, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.03, evasionBonus: 0, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T6: Eternal Patriarch ---
    {
        id: 'patriarch_crown', name: 'Patriarch Crown', slot: 'helmet', tier: 'T6', levelRequirement: 100, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.06, evasionBonus: 0, blockChance: 0, flatArmor: 9,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'patriarch_hauberk', name: 'Patriarch Hauberk', slot: 'chest', tier: 'T6', levelRequirement: 100, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.16, evasionBonus: 0, blockChance: 0.15, flatArmor: 24,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'patriarch_cuisses', name: 'Patriarch Cuisses', slot: 'legs', tier: 'T6', levelRequirement: 100, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.10, evasionBonus: 0, blockChance: 0, flatArmor: 15,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'patriarch_mittens', name: 'Patriarch Mittens', slot: 'gloves', tier: 'T6', levelRequirement: 100, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 0, blockChance: 0, flatArmor: 6,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'patriarch_sollerets', name: 'Patriarch Sollerets', slot: 'boots', tier: 'T6', levelRequirement: 100, style: 'melee',
        accuracyBonus: 0, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 0, blockChance: 0, flatArmor: 6,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // ==========================================
    // 2. ARCHERY ARMOR SETS (T1-T6)
    // ==========================================

    // --- T1: Scout Leathers ---
    {
        id: 'scout_helm', name: 'Scout Helm', slot: 'helmet', tier: 'T1', levelRequirement: 1, style: 'archery',
        accuracyBonus: 5, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 6, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'scout_chest', name: 'Scout Chest', slot: 'chest', tier: 'T1', levelRequirement: 1, style: 'archery',
        accuracyBonus: 10, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 16, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'scout_legs', name: 'Scout Legs', slot: 'legs', tier: 'T1', levelRequirement: 1, style: 'archery',
        accuracyBonus: 8, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 10, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'scout_gloves', name: 'Scout Gloves', slot: 'gloves', tier: 'T1', levelRequirement: 1, style: 'archery',
        accuracyBonus: 4, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0, evasionBonus: 4, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'scout_boots', name: 'Scout Boots', slot: 'boots', tier: 'T1', levelRequirement: 1, style: 'archery',
        accuracyBonus: 4, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 4, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T2: Nightstrider ---
    {
        id: 'nightstrider_helm', name: 'Nightstrider Helm', slot: 'helmet', tier: 'T2', levelRequirement: 20, style: 'archery',
        accuracyBonus: 12, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 13, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'nightstrider_chest', name: 'Nightstrider Chest', slot: 'chest', tier: 'T2', levelRequirement: 20, style: 'archery',
        accuracyBonus: 25, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 34, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'nightstrider_legs', name: 'Nightstrider Legs', slot: 'legs', tier: 'T2', levelRequirement: 20, style: 'archery',
        accuracyBonus: 18, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 21, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'nightstrider_gloves', name: 'Nightstrider Gloves', slot: 'gloves', tier: 'T2', levelRequirement: 20, style: 'archery',
        accuracyBonus: 8, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 8, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'nightstrider_boots', name: 'Nightstrider Boots', slot: 'boots', tier: 'T2', levelRequirement: 20, style: 'archery',
        accuracyBonus: 8, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 9, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T3: Veilstalker ---
    {
        id: 'veilstalker_helm', name: 'Veilstalker Helm', slot: 'helmet', tier: 'T3', levelRequirement: 40, style: 'archery',
        accuracyBonus: 25, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 27, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'veilstalker_chest', name: 'Veilstalker Chest', slot: 'chest', tier: 'T3', levelRequirement: 40, style: 'archery',
        accuracyBonus: 50, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 72, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'veilstalker_legs', name: 'Veilstalker Legs', slot: 'legs', tier: 'T3', levelRequirement: 40, style: 'archery',
        accuracyBonus: 35, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 45, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'veilstalker_gloves', name: 'Veilstalker Gloves', slot: 'gloves', tier: 'T3', levelRequirement: 40, style: 'archery',
        accuracyBonus: 15, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 18, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'veilstalker_boots', name: 'Veilstalker Boots', slot: 'boots', tier: 'T3', levelRequirement: 40, style: 'archery',
        accuracyBonus: 15, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 18, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T4: Gravewalker ---
    {
        id: 'gravewalker_helm', name: 'Gravewalker Helm', slot: 'helmet', tier: 'T4', levelRequirement: 60, style: 'archery',
        accuracyBonus: 45, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 48, blockChance: 0, flatArmor: 3,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'gravewalker_chest', name: 'Gravewalker Chest', slot: 'chest', tier: 'T4', levelRequirement: 60, style: 'archery',
        accuracyBonus: 90, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.065, evasionBonus: 128, blockChance: 0, flatArmor: 7,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'gravewalker_legs', name: 'Gravewalker Legs', slot: 'legs', tier: 'T4', levelRequirement: 60, style: 'archery',
        accuracyBonus: 65, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 80, blockChance: 0, flatArmor: 5,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'gravewalker_gloves', name: 'Gravewalker Gloves', slot: 'gloves', tier: 'T4', levelRequirement: 60, style: 'archery',
        accuracyBonus: 30, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 32, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'gravewalker_boots', name: 'Gravewalker Boots', slot: 'boots', tier: 'T4', levelRequirement: 60, style: 'archery',
        accuracyBonus: 30, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 32, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T5: Shadow-Weave ---
    {
        id: 'shadowweave_helm', name: 'Shadow-Weave Helm', slot: 'helmet', tier: 'T5', levelRequirement: 80, style: 'archery',
        accuracyBonus: 70, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.035, evasionBonus: 68, blockChance: 0, flatArmor: 5,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'shadowweave_chest', name: 'Shadow-Weave Chest', slot: 'chest', tier: 'T5', levelRequirement: 80, style: 'archery',
        accuracyBonus: 140, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0.05,
        drPercent: 0.09, evasionBonus: 180, blockChance: 0, flatArmor: 12,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'shadowweave_legs', name: 'Shadow-Weave Legs', slot: 'legs', tier: 'T5', levelRequirement: 80, style: 'archery',
        accuracyBonus: 100, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.055, evasionBonus: 112, blockChance: 0, flatArmor: 7,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'shadowweave_gloves', name: 'Shadow-Weave Gloves', slot: 'gloves', tier: 'T5', levelRequirement: 80, style: 'archery',
        accuracyBonus: 45, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 45, blockChance: 0, flatArmor: 3,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'shadowweave_boots', name: 'Shadow-Weave Boots', slot: 'boots', tier: 'T5', levelRequirement: 80, style: 'archery',
        accuracyBonus: 45, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 45, blockChance: 0, flatArmor: 3,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T6: Phantom Rain ---
    {
        id: 'phantom_helm', name: 'Phantom Helm', slot: 'helmet', tier: 'T6', levelRequirement: 100, style: 'archery',
        accuracyBonus: 100, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.045, evasionBonus: 90, blockChance: 0, flatArmor: 7,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'phantom_chest', name: 'Phantom Chest', slot: 'chest', tier: 'T6', levelRequirement: 100, style: 'archery',
        accuracyBonus: 200, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0.10,
        drPercent: 0.12, evasionBonus: 240, blockChance: 0, flatArmor: 18,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'phantom_legs', name: 'Phantom Legs', slot: 'legs', tier: 'T6', levelRequirement: 100, style: 'archery',
        accuracyBonus: 150, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.075, evasionBonus: 150, blockChance: 0, flatArmor: 11,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'phantom_gloves', name: 'Phantom Gloves', slot: 'gloves', tier: 'T6', levelRequirement: 100, style: 'archery',
        accuracyBonus: 60, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.03, evasionBonus: 60, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'phantom_boots', name: 'Phantom Boots', slot: 'boots', tier: 'T6', levelRequirement: 100, style: 'archery',
        accuracyBonus: 60, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.03, evasionBonus: 60, blockChance: 0, flatArmor: 5,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // ==========================================
    // 3. SORCERY ARMOR SETS (T1-T6)
    // ==========================================

    // --- T1: Acolyte Rags ---
    {
        id: 'acolyte_helm', name: 'Acolyte Helm', slot: 'helmet', tier: 'T1', levelRequirement: 1, style: 'sorcery',
        accuracyBonus: 5, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.0025, evasionBonus: 5, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'acolyte_chest', name: 'Acolyte Chest', slot: 'chest', tier: 'T1', levelRequirement: 1, style: 'sorcery',
        accuracyBonus: 12, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.0025, evasionBonus: 10, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 1%', specialTraitValue: 0.01, refinement: 0,
    },
    {
        id: 'acolyte_legs', name: 'Acolyte Legs', slot: 'legs', tier: 'T1', levelRequirement: 1, style: 'sorcery',
        accuracyBonus: 8, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.0025, evasionBonus: 8, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'acolyte_gloves', name: 'Acolyte Gloves', slot: 'gloves', tier: 'T1', levelRequirement: 1, style: 'sorcery',
        accuracyBonus: 4, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.001, evasionBonus: 4, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'acolyte_boots', name: 'Acolyte Boots', slot: 'boots', tier: 'T1', levelRequirement: 1, style: 'sorcery',
        accuracyBonus: 4, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.0015, evasionBonus: 4, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T2: Hemomancer Finery ---
    {
        id: 'hemomancer_helm', name: 'Hemomancer Helm', slot: 'helmet', tier: 'T2', levelRequirement: 20, style: 'sorcery',
        accuracyBonus: 15, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 12, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'hemomancer_chest', name: 'Hemomancer Chest', slot: 'chest', tier: 'T2', levelRequirement: 20, style: 'sorcery',
        accuracyBonus: 30, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 24, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 4%', specialTraitValue: 0.04, refinement: 0,
    },
    {
        id: 'hemomancer_legs', name: 'Hemomancer Legs', slot: 'legs', tier: 'T2', levelRequirement: 20, style: 'sorcery',
        accuracyBonus: 20, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 18, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 1%', specialTraitValue: 0.01, refinement: 0,
    },
    {
        id: 'hemomancer_gloves', name: 'Hemomancer Gloves', slot: 'gloves', tier: 'T2', levelRequirement: 20, style: 'sorcery',
        accuracyBonus: 10, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.0025, evasionBonus: 8, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'hemomancer_boots', name: 'Hemomancer Boots', slot: 'boots', tier: 'T2', levelRequirement: 20, style: 'sorcery',
        accuracyBonus: 10, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.0025, evasionBonus: 8, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },

    // --- T3: Sanguine Shrouds ---
    {
        id: 'sanguine_helm', name: 'Sanguine Helm', slot: 'helmet', tier: 'T3', levelRequirement: 40, style: 'sorcery',
        accuracyBonus: 30, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 25, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'sanguine_shroud', name: 'Sanguine Shroud', slot: 'chest', tier: 'T3', levelRequirement: 40, style: 'sorcery',
        accuracyBonus: 60, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 50, blockChance: 0, flatArmor: 2,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 3%', specialTraitValue: 0.03, refinement: 0,
    },
    {
        id: 'sanguine_leggings', name: 'Sanguine Leggings', slot: 'legs', tier: 'T3', levelRequirement: 40, style: 'sorcery',
        accuracyBonus: 40, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.02, evasionBonus: 35, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 4%', specialTraitValue: 0.04, refinement: 0,
    },
    {
        id: 'sanguine_gloves', name: 'Sanguine Gloves', slot: 'gloves', tier: 'T3', levelRequirement: 40, style: 'sorcery',
        accuracyBonus: 20, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 15, blockChance: 0, flatArmor: 0,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'sanguine_boots', name: 'Sanguine Boots', slot: 'boots', tier: 'T3', levelRequirement: 40, style: 'sorcery',
        accuracyBonus: 20, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.005, evasionBonus: 15, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Spectral Regen +0.25 HP/s', specialTraitValue: 0.25, refinement: 0,
    },

    // --- T4: Soulbound Silks ---
    {
        id: 'soulbound_helm', name: 'Soulbound Helm', slot: 'helmet', tier: 'T4', levelRequirement: 60, style: 'sorcery',
        accuracyBonus: 50, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 40, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 1%', specialTraitValue: 0.01, refinement: 0,
    },
    {
        id: 'soulbound_vestments', name: 'Soulbound Vestments', slot: 'chest', tier: 'T4', levelRequirement: 60, style: 'sorcery',
        accuracyBonus: 100, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 85, blockChance: 0, flatArmor: 4,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 6%', specialTraitValue: 0.06, refinement: 0,
    },
    {
        id: 'soulbound_leggings', name: 'Soulbound Leggings', slot: 'legs', tier: 'T4', levelRequirement: 60, style: 'sorcery',
        accuracyBonus: 70, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 60, blockChance: 0, flatArmor: 3,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 4%', specialTraitValue: 0.04, refinement: 0,
    },
    {
        id: 'soulbound_gloves', name: 'Soulbound Gloves', slot: 'gloves', tier: 'T4', levelRequirement: 60, style: 'sorcery',
        accuracyBonus: 35, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 30, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: '', specialTraitValue: 0, refinement: 0,
    },
    {
        id: 'soulbound_boots', name: 'Soulbound Boots', slot: 'boots', tier: 'T4', levelRequirement: 60, style: 'sorcery',
        accuracyBonus: 35, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.01, evasionBonus: 30, blockChance: 0, flatArmor: 1,
        siphonAmount: 0,
        armPen: 0, minDamagePct: 0, specialTrait: 'Regen +0.5 HP/s', specialTraitValue: 0.5, refinement: 0,
    },

    // --- T5: Blood-Prince Garb ---
    {
        id: 'blood_prince_helm', name: 'Blood-Prince Helm', slot: 'helmet', tier: 'T5', levelRequirement: 80, style: 'sorcery',
        accuracyBonus: 80, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 60, blockChance: 0, flatArmor: 3,
        siphonAmount: 0.20,
        armPen: 0, minDamagePct: 0, specialTrait: 'Set Bonus: Siphon Trigger', specialTraitValue: 0.02, refinement: 0,
    },
    {
        id: 'blood_prince_robe', name: 'Blood-Prince Robe', slot: 'chest', tier: 'T5', levelRequirement: 80, style: 'sorcery',
        accuracyBonus: 160, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.065, evasionBonus: 120, blockChance: 0, flatArmor: 7,
        siphonAmount: 0.20,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 6%', specialTraitValue: 0.06, refinement: 0,
    },
    {
        id: 'blood_prince_hose', name: 'Blood-Prince Hose', slot: 'legs', tier: 'T5', levelRequirement: 80, style: 'sorcery',
        accuracyBonus: 110, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 85, blockChance: 0, flatArmor: 4,
        siphonAmount: 0.20,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 4%', specialTraitValue: 0.04, refinement: 0,
    },
    {
        id: 'blood_prince_gloves', name: 'Blood-Prince Gloves', slot: 'gloves', tier: 'T5', levelRequirement: 80, style: 'sorcery',
        accuracyBonus: 50, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 40, blockChance: 0, flatArmor: 2,
        siphonAmount: 0.20,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 1%', specialTraitValue: 0.01, refinement: 0,
    },
    {
        id: 'blood_prince_boots', name: 'Blood-Prince Boots', slot: 'boots', tier: 'T5', levelRequirement: 80, style: 'sorcery',
        accuracyBonus: 50, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.015, evasionBonus: 40, blockChance: 0, flatArmor: 2,
        siphonAmount: 0.20,
        armPen: 0, minDamagePct: 0, specialTrait: 'Regen +0.5 HP/s', specialTraitValue: 0.5, refinement: 0,
    },

    // --- T6: Void-Conduit ---
    {
        id: 'void_conduit_helm', name: 'Void-Conduit Helm', slot: 'helmet', tier: 'T6', levelRequirement: 100, style: 'sorcery',
        accuracyBonus: 120, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.04, evasionBonus: 100, blockChance: 0, flatArmor: 5,
        siphonAmount: 0.25,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 1%', specialTraitValue: 0.01, refinement: 0,
    },
    {
        id: 'void_conduit_chest', name: 'Void-Conduit Chest', slot: 'chest', tier: 'T6', levelRequirement: 100, style: 'sorcery',
        accuracyBonus: 240, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.10, evasionBonus: 200, blockChance: 0, flatArmor: 12,
        siphonAmount: 0.25,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 8%', specialTraitValue: 0.08, refinement: 0,
    },
    {
        id: 'void_conduit_legs', name: 'Void-Conduit Legs', slot: 'legs', tier: 'T6', levelRequirement: 100, style: 'sorcery',
        accuracyBonus: 160, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.06, evasionBonus: 140, blockChance: 0, flatArmor: 7,
        siphonAmount: 0.25,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 5%', specialTraitValue: 0.05, refinement: 0,
    },
    {
        id: 'void_conduit_gloves', name: 'Void-Conduit Gloves', slot: 'gloves', tier: 'T6', levelRequirement: 100, style: 'sorcery',
        accuracyBonus: 80, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 60, blockChance: 0, flatArmor: 3,
        siphonAmount: 0.25,
        armPen: 0, minDamagePct: 0, specialTrait: 'Lifesteal 1%', specialTraitValue: 0.01, refinement: 0,
    },
    {
        id: 'void_conduit_boots', name: 'Void-Conduit Boots', slot: 'boots', tier: 'T6', levelRequirement: 100, style: 'sorcery',
        accuracyBonus: 80, powerModifier: 1.0, attackIntervalFlat: 0, attackIntervalPct: 0,
        drPercent: 0.025, evasionBonus: 60, blockChance: 0, flatArmor: 3,
        siphonAmount: 0.25,
        armPen: 0, minDamagePct: 0, specialTrait: 'Regen +1.0 HP/s', specialTraitValue: 1.0, refinement: 0,
    },
];

export const ARMOR_MAP = new Map<string, EquipmentItem>(ARMOR.map(a => [a.id, a]));
export default ARMOR;
