import type { GearTier, SessionStats, EquipmentItem, HuntEvaluation } from './types';

/**
 * Deterministic evaluation of a combat session to determine if meta-progression
 * actions (Crucible unsealing) should be allowed.
 * 
 * MVP Rule: Survive 50+ ticks or survive a Red Mist event.
 * 
 * Performance Scoring:
 * - Survival: up to 50% (cap at 100 ticks)
 * - Aggression: up to 30% (kills)
 * - Risk: up to 20% (scent intensity)
 */
export function evaluateHuntPerformance(
    session: SessionStats, 
    tickCount: number, 
    wasSlain: boolean, 
    redMistSurvived: boolean
): HuntEvaluation {
    // 1. Rule: Never unseal on death (Locked Rule)
    if (wasSlain) {
        return { isValid: false, quality: 0, reason: 'Death seals the Crucible.' };
    }

    // 2. MVP Survival Threshold (Locked Rule)
    const thresholdMet = tickCount >= 50 || redMistSurvived;
    if (!thresholdMet) {
        return { isValid: false, quality: 0, reason: 'Survival threshold not met.' };
    }

    // 3. Performance Scoring (Phase 4 Overhaul)
    // 3a. Survival Score: up to 0.4 at 100 ticks (Reduced from 0.5 to make room for Mastery)
    const survivalScore = Math.min(0.4, (tickCount / 100) * 0.4);
    
    // 3b. Aggression Score: up to 0.25 at 15 kills (Reduced from 0.3)
    const aggressionScore = Math.min(0.25, (session.kills / 15) * 0.25);
    
    // 3c. Pressure Mastery (The "Risk" evolution)
    // Peak Scent contributes up to 0.15
    const peakScent = session.peakScent || session.lastScentIntensity || 0;
    const peakScore = Math.min(0.15, peakScent * 0.15);
    
    // Time at pressure thresholds (up to 0.10)
    const highPressureTicks = (session.timeAbove60Scent || 0) + (session.timeAbove80Scent || 0);
    const pressureTimeScore = Math.min(0.10, (highPressureTicks / 200) * 0.10);
    
    const pressureScore = peakScore + pressureTimeScore;

    // 3d. Ritual Mastery Bonus (+0.03 per ritual, cap 0.09)
    const ritualBonus = Math.min(0.09, (session.activeRitualIds?.length || 0) * 0.03);

    const totalQuality = Math.max(0, Math.min(1.0, 
        survivalScore + 
        aggressionScore + 
        pressureScore + 
        ritualBonus
    ));

    return {
        isValid: true,
        quality: Number(totalQuality.toFixed(2)),
        reason: 'Sanguine threshold met.'
    };
}

/**
 * Generalized utility to determine the next gear tier in the progression chain.
 * Supports T1 through T6.
 */
export function getNextTier(current: GearTier): GearTier | null {
    const tierMap: Record<GearTier, GearTier | null> = {
        'T1': 'T2',
        'T2': 'T3',
        'T3': 'T4',
        'T4': 'T5',
        'T5': 'T6',
        'T6': null
    };

    return tierMap[current] || null;
}

/**
 * Check if an item is eligible for Tier-Shifting.
 * Rule: must be refinement level 5 and not at T6.
 */
export function isEligibleForTierShift(item: EquipmentItem): boolean {
    if (!item) return false;
    if (item.refinement !== 5) return false;
    return getNextTier(item.tier) !== null;
}

/**
 * Calculate the cost for Tier-Shifting based on the current tier.
 * MVP: Static cost model with a simple tier-based multiplier.
 */
export function getTierShiftCost(current: GearTier) {
    const tierValue = parseInt(current.replace('T', ''), 10);
    const mult = tierValue; // T1: 1x, T2: 2x, T3: 3x, etc.

    const baseShards = 500;
    const baseIchor = 1; // Stabilized Ichor
    const components: { id: string, quantity: number }[] = [];

    // Map forged components based on tier
    if (tierValue === 1) { // T1 -> T2
        components.push({ id: 'iron_plate', quantity: 5 * mult });
        components.push({ id: 'steel_rivets', quantity: 10 * mult });
        components.push({ id: 'cursed_ingot', quantity: 2 * mult });
    } else { // T2+ (scaling placeholders)
        components.push({ id: 'iron_plate', quantity: 10 * mult });
        components.push({ id: 'steel_rivets', quantity: 20 * mult });
        components.push({ id: 'cursed_ingot', quantity: 5 * mult });
    }

    return {
        shards: Math.floor(baseShards * mult),
        stabilizedIchor: Math.floor(baseIchor * mult),
        components
    };
}

/**
 * Resolve the template for the next gear tier based on the current item.
 * This ensures the shift process pulls exact baseline stats rather than scaling.
 */
export function resolveNextTierItem(
    item: EquipmentItem,
    allEquipment: EquipmentItem[]
): EquipmentItem | null {
    const nextTier = getNextTier(item.tier);
    if (!nextTier) return null;

    // Find equivalent item in next tier by matching slot, style, subStyle, and tier
    return allEquipment.find(template => 
        template.slot === item.slot &&
        template.tier === nextTier &&
        // Weapons match by combat style AND sub-style (e.g. Melee-Stab)
        (template.slot === 'weapon' ? 
            (template.style === item.style && template.subStyle === item.subStyle) : 
            // Armor matches by style (Melee, Archery, Sorcery)
            (template.style === item.style)
        )
    ) || null;
}

/**
 * Validate the result of a Tier-Shift operation.
 */
export function validateShiftResult(oldItem: EquipmentItem, newItem: EquipmentItem): boolean {
    if (!oldItem || !newItem) return false;
    if (newItem.tier === oldItem.tier) return false;
    if (newItem.refinement !== 0) return false;
    
    const expectedTier = getNextTier(oldItem.tier);
    return newItem.tier === expectedTier;
}
