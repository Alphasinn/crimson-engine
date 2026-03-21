import styles from './profile.module.scss';
import { usePlayerStore } from '../../store/playerStore';
import { getXpProgress } from '../../engine/xpTable';
import type { SkillName } from '../../engine/types';

import iconAttack from '../../assets/icons/attack.png';
import iconStrength from '../../assets/icons/strength.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconHp from '../../assets/icons/hp.png';

const SKILLS_CONFIG: { key: SkillName; label: string; iconUrl: string; color: string }[] = [
    { key: 'fangMastery', label: 'Fang Mastery', iconUrl: iconAttack, color: '#c41e3a' },
    { key: 'predatorForce', label: 'Predator Force', iconUrl: iconStrength, color: '#ef4444' },
    { key: 'obsidianWard', label: 'Obsidian Ward', iconUrl: iconDefense, color: '#6366f1' },
    { key: 'shadowArchery', label: 'Shadow Archery', iconUrl: iconArchery, color: '#60a5fa' },
    { key: 'bloodSorcery', label: 'Blood Sorcery', iconUrl: iconMagic, color: '#c084fc' },
    { key: 'vitae', label: 'Vitae', iconUrl: iconHp, color: '#22c55e' },
];

export function ProfileView() {
    const { skills } = usePlayerStore();
    
    const totalLevel = Object.values(skills).reduce((sum, s) => sum + s.level, 0);
    const totalXp = Object.values(skills).reduce((sum, s) => sum + s.xp, 0);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2>Vampire Profile</h2>
                    <p>Total Level: {totalLevel} ({Math.floor(totalXp).toLocaleString()} XP)</p>
                </div>
            </div>

            <div className={styles.skillsSection}>
                <h3>Skills</h3>
                <div className={styles.skillsGrid}>
                    {SKILLS_CONFIG.map(({ key, label, iconUrl, color }) => {
                        const skill = skills[key];
                        const progress = getXpProgress(skill.xp);
                        
                        return (
                            <div key={key} className={styles.skillCard} title={`XP: ${Math.floor(skill.xp).toLocaleString()}`}>
                                <div className={styles.skillLabel}>{label}</div>
                                <img src={iconUrl} alt={label} className={styles.skillIcon} />
                                <div className={styles.levelWrap}>
                                    <span className={styles.skillLevel}>Lv. {skill.level}</span>
                                    <div className={styles.minibarContainer}>
                                        <div 
                                            className={styles.minibarFill} 
                                            style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%`, backgroundColor: color }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
