import { useNotificationStore } from '../../store/notificationStore';
import { NotificationToast } from './NotificationToast';
import styles from './notifications.module.scss';

export function NotificationContainer() {
    const notifications = useNotificationStore((s) => s.notifications);

    const normalNotifications = notifications.filter(n => n.type !== 'level_up');
    const levelUpNotifications = notifications.filter(n => n.type === 'level_up');

    return (
        <>
            <div className={styles.container}>
                {normalNotifications.map((n) => (
                    <NotificationToast key={n.id} item={n} />
                ))}
            </div>
            
            {levelUpNotifications.length > 0 && (
                <div className={styles.topContainer}>
                    {levelUpNotifications.map((n) => (
                        <NotificationToast key={n.id} item={n} />
                    ))}
                </div>
            )}
        </>
    );
}
