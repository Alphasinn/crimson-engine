import { usePlayerStore } from '../../store/playerStore';
import { useCombatEngine } from '../combat/useCombatEngine';
import styles from './equipment.module.scss'; // Share glassmorphic styling
import { ITEM_MAP } from '../../data/items';

export function ConsumablePanel() {
    const { food } = usePlayerStore();
    const { handleUseConsumable } = useCombatEngine();
    const maxSlots = 4;
    
    // Fill with empty slots if less than maxSlots
    const displaySlots = [...food.filter(f => f.type === 'food').slice(0, maxSlots)];
    while (displaySlots.length < maxSlots) {
        displaySlots.push(null as any);
    }

    return (
        <div className={styles.consumableContainer}>
            {displaySlots.map((item, idx) => (
                <div 
                    key={item ? item.id : `empty-food-${idx}`} 
                    className={`${styles.consumableSlot} ${!item ? styles.empty : ''} ${item ? styles.usable : ''}`}
                    title={item ? `${item.name} (+${item.healAmount} HP)` : "Empty Food Slot"}
                    onClick={() => item && handleUseConsumable(item)}
                >
                    {item ? (
                        <div className={styles.foodInfo}>
                            {(() => {
                                const template = ITEM_MAP.get(item.id);
                                const icon = (template as any)?.icon || item.icon;
                                if (icon) {
                                    return <img src={icon} alt={item.name} className={styles.foodIcon} />;
                                }
                                return <span className={styles.foodName}>{item.name.charAt(0)}</span>;
                            })()}
                            <span className={styles.foodQuantity}>{item.quantity}</span>
                        </div>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-4v17h2V5h-2z" opacity="0.4"/>
                        </svg>
                    )}
                </div>
            ))}
        </div>
    );
}
