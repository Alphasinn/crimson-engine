import { CruciblePanel } from '../ui/CruciblePanel';
import styles from './sanctum.module.scss';
import { VaultPanel } from '../ui/VaultPanel';

export function SanctumView() {
    return (
        <div className={styles.root}>
            <VaultPanel />
            <CruciblePanel />
        </div>
    );
}
