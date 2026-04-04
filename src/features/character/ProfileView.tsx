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
import iconDistill from '../../assets/skills/distillation/distillation.png';
import iconBlood from '../../assets/skills/bloodletting/bloodletting.png';
import iconGrave from '../../assets/skills/graveHarvesting/graveHarvesting.png';
import iconForaging from '../../assets/skills/nightForaging/nightForaging.png';
import iconForging from '../../assets/skills/forging/forging.png';
import iconCorpse from '../../assets/skills/corpseHarvesting/corpseHarvesting.png';
import iconAlchemy from '../../assets/skills/alchemy/alchemy.png';
// Placeholder icons — replace with dedicated assets when available
const iconButchery = iconCorpse;
const iconRelicScavenging = iconGrave;
const iconRunecraft = iconMagic;

const CATEGORIES = [
    {
        name: 'Predation',
        subtext: 'Mastery of combat and survival',
        skills: ['fangMastery', 'predatorForce', 'obsidianWard', 'shadowArchery', 'bloodSorcery', 'vitae']
    },
    {
        name: 'Harvesting',
        subtext: 'Extract essence from the world',
        skills: ['bloodletting', 'graveHarvesting', 'nightForaging', 'butchery', 'relicScavenging']
    },
    {
        name: 'Refinement',
        subtext: 'Transform essence into power',
        skills: ['distillation', 'forging', 'corpseHarvesting', 'alchemy', 'runecraft']
    }
];

const SKILL_MAP: Record<SkillName, { label: string; iconUrl: string; color: string }> = {
    fangMastery: { label: 'Fang Mastery', iconUrl: iconAttack, color: '#c41e3a' },
    predatorForce: { label: 'Predator Force', iconUrl: iconStrength, color: '#ef4444' },
    obsidianWard: { label: 'Obsidian Ward', iconUrl: iconDefense, color: '#6366f1' },
    shadowArchery: { label: 'Shadow Archery', iconUrl: iconArchery, color: '#60a5fa' },
    bloodSorcery: { label: 'Blood Sorcery', iconUrl: iconMagic, color: '#c084fc' },
    vitae: { label: 'Vitae', iconUrl: iconHp, color: '#22c55e' },
    bloodletting: { label: 'Bloodletting', iconUrl: iconBlood, color: '#991b1b' },
    graveHarvesting: { label: 'Grave Harvesting', iconUrl: iconGrave, color: '#4b5563' },
    nightForaging: { label: 'Night Foraging', iconUrl: iconForaging, color: '#059669' },
    butchery: { label: 'Butchery', iconUrl: iconButchery, color: '#b91c1c' },
    relicScavenging: { label: 'Relic Scavenging', iconUrl: iconRelicScavenging, color: '#78716c' },
    distillation: { label: 'Distillation', iconUrl: iconDistill, color: '#4a90e2' },
    forging: { label: 'Forging', iconUrl: iconForging, color: '#d97706' },
    corpseHarvesting: { label: 'Corpse Harvesting', iconUrl: iconCorpse, color: '#7c3aed' },
    alchemy: { label: 'Alchemy', iconUrl: iconAlchemy, color: '#db2777' },
    runecraft: { label: 'Runecraft', iconUrl: iconRunecraft, color: '#7e22ce' },
};

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

            <div className={styles.categoriesSection}>
                {CATEGORIES.map(cat => (
                    <div key={cat.name} className={styles.categoryGroup}>
                        <div className={styles.categoryHeader}>
                            <h3 className={styles.categoryName}>{cat.name}</h3>
                            <p className={styles.categorySubtext}>{cat.subtext}</p>
                        </div>
                        <div className={styles.skillsGrid}>
                            {cat.skills.map(skillKey => {
                                const config = SKILL_MAP[skillKey as SkillName];
                                const skill = skills[skillKey as SkillName];
                                const progress = getXpProgress(skill.xp);
                                
                                return (
                                    <div key={skillKey} className={styles.skillCard} title={`XP: ${Math.floor(skill.xp).toLocaleString()}`}>
                                        <div className={styles.skillLabel}>{config.label}</div>
                                        <img src={config.iconUrl} alt={config.label} className={styles.skillIcon} />
                                        <div className={styles.levelWrap}>
                                            <span className={styles.skillLevel}>Lv. {skill.level}</span>
                                            <div className={styles.minibarContainer}>
                                                <div 
                                                    className={styles.minibarFill} 
                                                    style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%`, backgroundColor: config.color }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
