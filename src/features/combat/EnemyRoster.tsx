// =============================================================================
// CRIMSON ENGINE — EnemyRoster
// Expandable panel listing all enemies in a zone with stats and Fight! button
// =============================================================================


import React, { useState } from 'react';
import { getEnemiesForZone } from '../../data/enemies';
import type { Zone, Enemy } from '../../engine/types';
import styles from './enemyRoster.module.scss';
import combatStyles from './combat.module.scss';
import iconAttack from '../../assets/icons/attack.png';
import iconStrength from '../../assets/icons/strength.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconHp from '../../assets/icons/hp.png';
import iconLootChest from '../../assets/icons/loot_chest.png';

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

function StatBox({ icon, value, color }: { icon: string; value: number; color?: string }) {
    return (
        <div className={styles.statBox}>
            <img src={icon} className={styles.miniStatIcon} alt="" />
            <span className={styles.statValue} style={{ color }}>{value}</span>
        </div>
    );
}

function EnemyCard({ enemy, onFight, onShowLoot }: { enemy: Enemy; onFight: (e: Enemy) => void; onShowLoot: (e: Enemy) => void }) {
    return (
        <div 
            className={`${styles.enemyCard} ${enemy.isElite ? styles.elite : ''}`}
            onClick={() => onFight(enemy)}
        >
            {enemy.isElite && <div className={styles.eliteBadge}>⚔ ELITE</div>}

            <div className={styles.cardMain}>
                <div className={styles.spriteCol}>
                    <div className={styles.spriteCircle}>
                        {enemy.spriteUrl && <img src={enemy.spriteUrl} alt={enemy.name} className={styles.enemySprite} />}
                    </div>
                </div>

                <div className={styles.infoCol}>
                    <div className={styles.nameRow}>
                        <div className={styles.enemyName}>{enemy.name}</div>
                        <img 
                            src={iconLootChest} 
                            alt="Loot" 
                            className={styles.lootChestIcon} 
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowLoot(enemy);
                            }}
                            title="View Loot Table"
                        />
                    </div>
                    <div className={styles.styleRow}>
                        {STYLE_LABELS[enemy.attackCategory] ?? enemy.attackCategory}
                    </div>

                    <div className={styles.statsGrid}>
                        <StatBox icon={iconAttack} value={enemy.stats.attack} />
                        <StatBox icon={iconStrength} value={enemy.stats.strength} />
                        <StatBox icon={iconDefense} value={enemy.stats.defense} />
                        <StatBox icon={iconHp} value={enemy.stats.hp} color="#ef4444" />
                        <StatBox icon={iconArchery} value={enemy.stats.ranged} />
                        <StatBox icon={iconMagic} value={enemy.stats.magic} />
                    </div>

                    <div className={styles.cardFooter}>
                        <div className={styles.badgeRow}>
                            {enemy.weakness && (
                                <span
                                    className={styles.weaknessBadge}
                                    style={{ borderColor: WEAKNESS_COLOR[enemy.weakness] ?? '#888', color: WEAKNESS_COLOR[enemy.weakness] ?? '#888' }}
                                >
                                    ▲ {enemy.weakness}
                                </span>
                            )}
                            {!enemy.weakness && !enemy.resistance && (
                                <span className={styles.neutralBadge}>— balanced</span>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

interface EnemyRosterProps {
    zone: Zone;
    onSelect: (enemy: Enemy) => void;
}

export function EnemyRoster({ zone, onSelect }: EnemyRosterProps) {
    const enemies = getEnemiesForZone(zone.id);
    const [lootEnemy, setLootEnemy] = useState<Enemy | null>(null);

    return (
        <div 
            className={styles.rosterPanel} 
            onClick={e => e.stopPropagation()}
        >
            <div className={styles.cardRow}>
                {enemies.map(enemy => (
                    <EnemyCard key={enemy.id} enemy={enemy} onFight={onSelect} onShowLoot={setLootEnemy} />
                ))}
            </div>

            {lootEnemy && (
                <div className={combatStyles.modalOverlay} onClick={() => setLootEnemy(null)}>
                    <div className={combatStyles.modal} onClick={e => e.stopPropagation()}>
                        <div className={combatStyles.modalHeader}>
                            <h3 className={combatStyles.modalTitle}>Loot Table: {lootEnemy.name}</h3>
                            <button className={combatStyles.closeBtn} onClick={() => setLootEnemy(null)}>×</button>
                        </div>
                        <div className={combatStyles.modalBody}>
                            {lootEnemy.lootTable.map(entry => {
                                const totalWeight = lootEnemy.lootTable.reduce((sum, e) => sum + e.weight, 0);
                                const chance = (entry.weight / totalWeight) * 100;
                                return (
                                    <div key={entry.itemId} className={combatStyles.lootRow}>
                                        <span className={combatStyles.lootName}>{entry.itemName}</span>
                                        <span className={combatStyles.lootChance}>{chance.toFixed(1)}%</span>
                                    </div>
                                );
                            })}
                            {lootEnemy.lootTable.length === 0 && (
                                <div className={combatStyles.noLoot}>No drops for this enemy.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
