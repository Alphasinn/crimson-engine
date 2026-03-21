import type { NotificationItem } from '../../store/notificationStore';
import styles from './notifications.module.scss';

// Import icons for XP if needed, or use emojis for loot if generic
import iconHp from '../../assets/icons/hp.png';
import iconStrength from '../../assets/icons/strength.png';
import iconAttack from '../../assets/icons/attack.png';
import iconDefense from '../../assets/icons/defense.png';
import iconArchery from '../../assets/icons/archery.png';
import iconMagic from '../../assets/icons/blood_magic.png';

export function NotificationToast({ item }: { item: NotificationItem }) {
    const isXp = item.type === 'xp';
    const isDeath = item.type === 'death';
    
    // Simple helper to get icons for common skill names
    const getSkillIcon = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('hp') || l.includes('vitae')) return iconHp;
        if (l.includes('strength') || l.includes('force')) return iconStrength;
        if (l.includes('attack') || l.includes('fang')) return iconAttack;
        if (l.includes('defense') || l.includes('ward')) return iconDefense;
        if (l.includes('ranged') || l.includes('shadow')) return iconArchery;
        if (l.includes('magic') || l.includes('blood')) return iconMagic;
        return null;
    };

    const icon = isDeath ? '☠️' : (isXp ? getSkillIcon(item.label) : item.icon);

    return (
        <div className={`${styles.toast} ${styles[`type-${item.type}`]}`}>
            <div className={styles.iconWrap}>
                {typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:')) ? (
                    <img src={icon} alt="" />
                ) : (
                    <span>{icon || '✨'}</span>
                )}
            </div>
            
            {!isDeath && <div className={styles.amount}>+{item.amount}</div>}
            <div className={styles.label}>{item.label}</div>
        </div>
    );
}
