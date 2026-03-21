import { useNotificationStore } from '../../store/notificationStore';
import { NotificationToast } from './NotificationToast';
import styles from './notifications.module.scss';

export function NotificationContainer() {
    const notifications = useNotificationStore((s) => s.notifications);

    return (
        <div className={styles.container}>
            {notifications.map((n) => (
                <NotificationToast key={n.id} item={n} />
            ))}
        </div>
    );
}
