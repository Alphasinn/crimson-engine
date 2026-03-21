import { EquipmentPanel } from '../character/EquipmentPanel';
import styles from './inventory.module.scss';
import { usePlayerStore } from '../../store/playerStore';

const getIcon = (id: string) => {
    if (id.includes('coin')) return 'G';
    if (id.includes('cloth') || id.includes('pelt') || id.includes('fur')) return 'M';
    if (id.includes('dagger') || id.includes('sword') || id.includes('blade')) return 'W';
    if (id.includes('blood') || id.includes('vial') || id.includes('essence')) return 'B';
    if (id.includes('bone') || id.includes('fragment')) return 'X';
    return '#';
};

export function InventoryView() {
    const { inventory } = usePlayerStore();

    return (
        <div className={styles.root}>
            <div className={styles.inventoryArea}>
                <h2>Inventory</h2>
                {inventory.length === 0 ? (
                    <p className={styles.empty}>Your inventory is empty.</p>
                ) : (
                    <div className={styles.grid}>
                        {inventory.map(item => (
                            <div key={item.id} className={styles.itemCard} title={item.name}>
                                <div className={styles.itemIcon}>{getIcon(item.id)}</div>
                                <div className={styles.itemQty}>{item.quantity}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className={styles.equipmentArea}>
                <h2 style={{ marginBottom: '16px' }}>Equipment Loadout</h2>
                <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
                    <EquipmentPanel />
                </div>
            </div>
        </div>
    );
}
