import { describe, it, expect, vi } from 'vitest';
import { calculateOfflineProgress } from '../engine/offlineProgression';
import { usePlayerStore } from '../store/playerStore';
import { useCombatStore } from '../store/combatStore';
import { useSkillingStore } from '../store/skillingStore';

vi.mock('../store/playerStore', () => ({
    usePlayerStore: {
        getState: vi.fn(() => ({
            lastSessionTimestamp: Date.now() - 3600000, // 1 hour ago
            offlineProgressTiers: 0,
            skills: { fangMastery: { level: 1, xp: 0 } },
            food: [],
            inventory: [],
            getResourceQuantity: () => 0
        }))
    }
}));

vi.mock('../store/combatStore', () => ({
    useCombatStore: {
        getState: vi.fn(() => ({
            isRunning: false,
            activeEnemy: null,
            selectedZone: null
        }))
    }
}));

vi.mock('../store/skillingStore', () => ({
    useSkillingStore: {
        getState: vi.fn(() => ({
            isActive: false,
            activeNodeId: null,
            activeSkill: null
        }))
    }
}));

describe('calculateOfflineProgress', () => {
    it('returns null if time away is less than 1 minute', () => {
        const mockGetState = usePlayerStore.getState as any;
        mockGetState.mockReturnValueOnce({
            lastSessionTimestamp: Date.now() - 30000, // 30 seconds
            offlineProgressTiers: 0
        });
        
        expect(calculateOfflineProgress()).toBeNull();
    });

    it('calculates capped time correctly', () => {
        const mockGetState = usePlayerStore.getState as any;
        mockGetState.mockReturnValueOnce({
            lastSessionTimestamp: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
            offlineProgressTiers: 0 // Cap is 12 hours
        });
        
        const result = calculateOfflineProgress();
        expect(result).toBeTruthy();
        expect(result?.cappedTimeMs).toBe(12 * 60 * 60 * 1000);
    });

    it('handles skilling when active', () => {
        const mockPlayerState = usePlayerStore.getState as any;
        mockPlayerState.mockReturnValueOnce({
            lastSessionTimestamp: Date.now() - 3600000, // 1 hour ago
            offlineProgressTiers: 0
        });

        const mockSkillingState = useSkillingStore.getState as any;
        mockSkillingState.mockReturnValueOnce({
            isActive: true,
            activeNodeId: 'grave_dust_piles',
            activeSkill: 'graveHarvesting'
        });
        
        const result = calculateOfflineProgress();
        expect(result).toBeTruthy();
        expect(Object.keys(result!.skillGains).length).toBeGreaterThan(0);
    });
});
