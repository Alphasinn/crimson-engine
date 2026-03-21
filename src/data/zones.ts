// =============================================================================
// CRIMSON ENGINE — Zone Definitions (6 Zones)
// =============================================================================

import type { Zone } from '../engine/types';

const ZONES: Zone[] = [
    {
        id: 'forgotten_hamlet',
        name: 'The Forgotten Hamlet',
        description: 'A dying village on the edge of civilization where frightened humans begin organizing resistance.',
        recommendedLevelMin: 1,
        recommendedLevelMax: 20,
        dropTier: 'T1',
        respawnBase: 2.0,
        enemyPool: [
            'peasant_defender',
            'torchbearer',
            'village_militia',
            'crossbow_watchman',
            'church_acolyte',
            'novice_vampire_hunter',
        ],
        bgUrl: '/assets/locations/forgotten_hamlet.png',
    },
    {
        id: 'grimwood_forest',
        name: 'Grimwood Forest',
        description: 'A cursed forest where the moon never seems to fade and ancient predators stalk the shadows.',
        recommendedLevelMin: 21,
        recommendedLevelMax: 40,
        dropTier: 'T2',
        respawnBase: 2.5,
        enemyPool: [
            'bloodstarved_wolf',
            'forest_stalker',
            'grave_robber',
            'moon_cursed_hunter',
            'young_werewolf',
            'pack_alpha',
        ],
        bgUrl: '/assets/locations/grimwood_forest.png',
    },
    {
        id: 'blackthorn_city',
        name: 'Blackthorn City',
        description: 'A gothic city where vampire influence clashes with organized hunter guilds in open war.',
        recommendedLevelMin: 41,
        recommendedLevelMax: 60,
        dropTier: 'T3',
        respawnBase: 3.0,
        enemyPool: [
            'hunter_recruit',
            'silverblade_duelist',
            'sanctified_archer',
            'night_inquisitor',
            'rogue_vampire',
            'hunter_captain',
        ],
        bgUrl: '/assets/locations/blackthorn_city.png',
    },
    {
        id: 'catacombs',
        name: 'Catacombs of the Old Empire',
        description: 'Ancient burial tunnels beneath a fallen empire where dark things have awakened.',
        recommendedLevelMin: 61,
        recommendedLevelMax: 80,
        dropTier: 'T4',
        respawnBase: 3.5,
        enemyPool: [
            'restless_skeleton',
            'crypt_ghoul',
            'bone_knight',
            'death_cultist',
            'ancient_vampire_thrall',
            'catacomb_warden',
        ],
        bgUrl: '/assets/locations/catacombs.png',
    },
    {
        id: 'crimson_highlands',
        name: 'The Crimson Highlands',
        description: 'Mist-shrouded mountains ruled by rival vampire houses and monstrous warbands.',
        recommendedLevelMin: 81,
        recommendedLevelMax: 100,
        dropTier: 'T5',
        respawnBase: 4.0,
        enemyPool: [
            'clan_outcast',
            'blood_duelist',
            'night_stalker',
            'crimson_warlock',
            'elder_werewolf',
            'clan_bloodlord',
        ],
        bgUrl: '/assets/locations/crimson_highlands.png',
    },
    {
        id: 'eternal_night_citadel',
        name: 'The Eternal Night Citadel',
        description: 'The seat of the oldest vampire dynasties — a fortress untouched by sunlight for a thousand years.',
        recommendedLevelMin: 101,
        recommendedLevelMax: 120,
        dropTier: 'T6',
        respawnBase: 4.5,
        enemyPool: [
            'night_sentinel',
            'ancient_thrall_knight',
            'blood_priestess',
            'shadow_reaver',
            'elder_vampire_lord',
            'crimson_patriarch',
        ],
        bgUrl: '/assets/locations/night_citadel.png',
    },
];

export const ZONE_MAP = new Map<string, Zone>(ZONES.map(z => [z.id, z]));

export default ZONES;
