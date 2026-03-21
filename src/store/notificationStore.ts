import { create } from 'zustand';

export type NotificationType = 'xp' | 'loot' | 'death';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    label: string;
    amount?: number | string;
    icon?: string; // URL or emoji
    timestamp: number;
}

interface NotificationState {
    notifications: NotificationItem[];
    addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (item) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newItem: NotificationItem = {
            ...item,
            id,
            timestamp: Date.now(),
        };

        set((state) => ({
            notifications: [...state.notifications, newItem],
        }));

        // Auto-remove after animation completes
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 3000);
    },
    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },
}));
