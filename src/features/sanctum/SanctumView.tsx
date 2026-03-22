import { CruciblePanel } from '../ui/CruciblePanel';
import styles from './sanctum.module.scss';

export function SanctumView() {
    return (
        <div className={styles.root}>
            <CruciblePanel />
        </div>
    );
}
