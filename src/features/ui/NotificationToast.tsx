import type { NotificationItem } from '../../store/notificationStore';
import styles from './notifications.module.scss';

// Import icons for XP if needed, or use emojis for loot if generic
import iconHp from '../../assets/icons/hp.png';
import iconStrength from '../../assets/icons/strength.png';
import iconAttack from '../../assets/icons/attack.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';
import iconDistill from '../../assets/skills/distillation/distillation.png';
import iconBlood from '../../assets/skills/bloodletting/bloodletting.png';
import iconGrave from '../../assets/skills/graveHarvesting/graveHarvesting.png';
import iconForaging from '../../assets/skills/nightForaging/nightForaging.png';
import iconForging from '../../assets/skills/forging/forging.png';
import iconCorpse from '../../assets/skills/corpseHarvesting/corpseHarvesting.png';
import iconAlchemy from '../../assets/skills/alchemy/alchemy.png';

export function NotificationToast({ item }: { item: NotificationItem }) {
    const isXp = item.type === 'xp';
    const isDeath = item.type === 'death';
    const isLevelUp = item.type === 'level_up';
    
    // Simple helper to get icons for common skill names
    const getSkillIcon = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('hp') || l.includes('vitae')) return iconHp;
        if (l.includes('strength') || l.includes('force')) return iconStrength;
        if (l.includes('attack') || l.includes('fang')) return iconAttack;
        if (l.includes('defense') || l.includes('ward')) return iconDefense;
        if (l.includes('ranged') || l.includes('shadow')) return iconArchery;
        if (l.includes('magic') || l.includes('blood sorcery')) return iconMagic;
        
        // Skilling
        if (l.includes('bloodletting')) return iconBlood;
        if (l.includes('grave')) return iconGrave;
        if (l.includes('foraging')) return iconForaging;
        if (l.includes('distill')) return iconDistill;
        if (l.includes('forging')) return iconForging;
        if (l.includes('corpse')) return iconCorpse;
        if (l.includes('alchemy')) return iconAlchemy;
        
        // Placeholders matching ProfileView
        if (l.includes('butchery')) return iconCorpse;
        if (l.includes('relic')) return iconGrave;
        if (l.includes('runecraft')) return iconMagic;
        return null;
    };

    const icon = isDeath ? '☠️' : (isXp || isLevelUp ? getSkillIcon(item.label) : item.icon);

    return (
        <div className={`${styles.toast} ${styles[`type-${item.type}`]}`}>
            <div className={`${styles.iconWrap} ${isLevelUp ? styles.levelUpIcon : ''}`}>
                {typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:')) ? (
                    <img src={icon} alt="" />
                ) : (
                    <span>{icon || '✨'}</span>
                )}
            </div>
            
            {isLevelUp ? (
                <div className={styles.levelUpLayout}>
                    <div className={styles.levelUpHeader}>Congrats!</div>
                    <div className={styles.levelUpMessage}>
                        You leveled up from level {item.amount} in <span className={styles.levelUpLabel}>{item.label}</span>!
                    </div>
                </div>
            ) : (
                <>
                    {!isDeath && <div className={styles.amount}>+{item.amount}</div>}
                    <div className={styles.label}>{item.label}</div>
                </>
            )}
        </div>
    );
}
