// =============================================================================
// CRIMSON ENGINE — EnemyRoster
// Expandable panel listing all enemies in a zone with stats and Fight! button
// =============================================================================


import React from 'react';
import { getEnemiesForZone } from '../../data/enemies';
import type { Zone, Enemy } from '../../engine/types';
import styles from './enemyRoster.module.scss';
import iconAttack from '../../assets/icons/attack.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';

const STYLE_LABELS: Record<string, React.ReactNode> = {
    melee:   <><img src={iconAttack} className={styles.statIcon} alt="" /> Melee</>,
    archery: <><img src={iconArchery} className={styles.statIcon} alt="" /> Archery</>,
    sorcery: <><img src={iconMagic} className={styles.statIcon} alt="" /> Sorcery</>,
};

const WEAKNESS_COLOR: Record<string, string> = {
    fang:    '#c41e3a',
    shadow:  '#7c3aed',
    blood:   '#60a5fa',
    archery: '#fbbf24',
    sorcery: '#a855f7',
    slash:   '#ef4444',
    stab:    '#3b82f6',
    crush:   '#10b981',
    pound:   '#065f46',
    none:    '#5a5068',
};

function StatPill({ label, value }: { label: string; value: number }) {
    return (
        <div className={styles.statPill}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value}</span>
        </div>
    );
}

function EnemyCard({ enemy, onFight }: { enemy: Enemy; onFight: (e: Enemy) => void }) {
    const topLoot = enemy.lootTable.slice(0, 3);
    const emptySlots = 3 - topLoot.length;

    return (
        <div className={`${styles.enemyCard} ${enemy.isElite ? styles.elite : ''}`}>
            {enemy.isElite && <div className={styles.eliteBadge}>⚔ ELITE</div>}

            <div className={styles.enemyName}>{enemy.name}</div>

            <div className={styles.styleBadge}>{STYLE_LABELS[enemy.attackCategory] ?? enemy.attackCategory}</div>

            <div className={styles.statsGrid}>
                <StatPill label="ATK" value={enemy.stats.attack} />
                <StatPill label="STR" value={enemy.stats.strength} />
                <StatPill label="DEF" value={enemy.stats.defense} />
                <StatPill label="RNG" value={enemy.stats.ranged} />
                <StatPill label="MAG" value={enemy.stats.magic} />
                <StatPill label="HP"  value={enemy.stats.hp} />
            </div>

            <div className={styles.badgeRow}>
                {enemy.weakness && (
                    <span
                        className={styles.weaknessBadge}
                        style={{ borderColor: WEAKNESS_COLOR[enemy.weakness] ?? '#888', color: WEAKNESS_COLOR[enemy.weakness] ?? '#888' }}
                    >
                        ▲ {enemy.weakness}
                    </span>
                )}
                {enemy.resistance && (
                    <span className={styles.resistBadge}>
                        ▼ {enemy.resistance}
                    </span>
                )}
                {!enemy.weakness && !enemy.resistance && (
                    <span className={styles.neutralBadge}>— balanced</span>
                )}
            </div>

            <div className={styles.xpRow}>
                <span className={styles.xpLabel}>XP</span>
                <span className={styles.xpValue}>{enemy.xpReward.toLocaleString()}</span>
            </div>

            <div className={styles.lootList}>
                {topLoot.map(l => (
                    <div key={l.itemId} className={styles.lootItem}>
                        <span className={styles.lootName}>{l.itemName}</span>
                        <span className={styles.lootWeight}>{l.weight}%</span>
                    </div>
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.lootItemEmpty} />
                ))}
            </div>

            <button className={styles.fightBtn} onClick={() => onFight(enemy)}>
                ⚔ Fight!
            </button>
        </div>
    );
}

interface EnemyRosterProps {
    zone: Zone;
    onSelect: (enemy: Enemy) => void;
}

export function EnemyRoster({ zone, onSelect }: EnemyRosterProps) {
    const enemies = getEnemiesForZone(zone.id);

    return (
        <div 
            className={styles.rosterPanel} 
            onClick={e => e.stopPropagation()}
            style={{ backgroundImage: zone.bgUrl ? `url(${zone.bgUrl})` : undefined }}
        >
            <div className={styles.rosterTitle}>
                <span className={styles.rosterTitleText}>Enemies in {zone.name}</span>
                <span className={styles.rosterCount}>{enemies.length} creatures</span>
            </div>
            <div className={styles.cardRow}>
                {enemies.map(enemy => (
                    <EnemyCard key={enemy.id} enemy={enemy} onFight={onSelect} />
                ))}
            </div>
        </div>
    );
}
