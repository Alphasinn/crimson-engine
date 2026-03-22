import { usePlayerStore } from '../../store/playerStore';
import { getXpProgress } from '../../engine/xpTable';
import type { SkillName } from '../../engine/types';
import styles from './character.module.scss';

import iconAttack from '../../assets/icons/attack.png';
import iconStrength from '../../assets/icons/strength.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconHp from '../../assets/icons/hp.png';

const SKILL_CONFIG: { key: SkillName; label: string; iconUrl: string; color: string }[] = [
    { key: 'fangMastery', label: 'Fang Mastery', iconUrl: iconAttack, color: '#c41e3a' },
    { key: 'predatorForce', label: 'Predator Force', iconUrl: iconStrength, color: '#ef4444' },
    { key: 'obsidianWard', label: 'Obsidian Ward', iconUrl: iconDefense, color: '#6366f1' },
    { key: 'shadowArchery', label: 'Shadow Archery', iconUrl: iconArchery, color: '#60a5fa' },
    { key: 'bloodSorcery', label: 'Blood Sorcery', iconUrl: iconMagic, color: '#c084fc' },
    { key: 'vitae', label: 'Vitae', iconUrl: iconHp, color: '#22c55e' },
];

export function CharacterPanel() {
    const { skills } = usePlayerStore();

    return (
        <div className={styles.compactPanel}>
            <div className={styles.compactSkillList}>
                {SKILL_CONFIG.map(({ key, label, iconUrl, color }) => {
                    const skill = skills[key];
                    const progress = getXpProgress(skill.xp);
                    return (
                        <div key={key} className={styles.compactSkillRow}>
                            <img src={iconUrl} alt={label} className={styles.miniIcon} />
                            <div className={styles.compactSkillInfo}>
                                <div className={styles.compactSkillTop}>
                                    <span className={styles.miniName}>{label}</span>
                                    <span className={styles.miniLevel} style={{ color }}>{skill.level}</span>
                                </div>
                                <div className={styles.miniXpTrack}>
                                    <div
                                        className={styles.miniXpFill}
                                        style={{ width: `${progress * 100}%`, background: color }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
