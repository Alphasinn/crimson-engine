import type { StatWindowEntry, ComputedRates } from './types';

const WINDOW_SECONDS = 60;
const MS_PER_HOUR = 3600000;

/**
 * Calculate rates from a window of stats entries.
 * @param window Array of StatWindowEntry objects
 * @param timeSpanMs The actual time span of data in the window (clamped to max window size)
 */
export function calculateRates(window: StatWindowEntry[], timeSpanMs: number): ComputedRates {
    const now = Date.now();
    const activeWindow = window.filter(e => now - e.timestamp <= WINDOW_SECONDS * 1000);
    
    // Use the maximum of the provided timeSpan or the first-to-last entry gap
    // This prevents massive inflation when we only have 1 second of data.
    const effectiveSpanMs = Math.max(timeSpanMs, 5000); // Minimum 5s denominator
    const hourMult = MS_PER_HOUR / effectiveSpanMs;

    let totalXp = 0;
    let kills = 0;
    let deaths = 0;
    let lootCount = 0;
    
    // For avg kill time
    let firstKillTime = 0;
    let lastKillTime = 0;

    activeWindow.forEach(e => {
        if (e.type === 'xp') totalXp += e.value;
        if (e.type === 'kill') {
            kills++;
            if (firstKillTime === 0) firstKillTime = e.timestamp;
            lastKillTime = e.timestamp;
        }
        if (e.type === 'death') deaths++;
        if (e.type === 'loot') lootCount += e.value;
    });

    const avgKillTime = kills > 1 
        ? (lastKillTime - firstKillTime) / (kills - 1) / 1000 
        : effectiveSpanMs / Math.max(1, kills) / 1000;

    const survivalRate = kills + deaths > 0 
        ? (kills / (kills + deaths)) * 100 
        : 100;

    let confidence: 'Safe' | 'Risky' | 'Deadly' = 'Safe';
    if (survivalRate < 70) confidence = 'Deadly';
    else if (survivalRate < 95) confidence = 'Risky';

    return {
        xpPerHour: Math.floor(totalXp * hourMult),
        lootPerHour: Math.floor(lootCount * hourMult),
        killsPerHour: Math.floor(kills * hourMult),
        deathsPerHour: Math.floor(deaths * hourMult),
        survivalRate: Math.floor(survivalRate),
        avgKillTime: parseFloat(avgKillTime.toFixed(1)),
        confidence
    };
}
