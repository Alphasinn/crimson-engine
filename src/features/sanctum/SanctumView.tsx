import { useState } from 'react';
import { CruciblePanel } from '../ui/CruciblePanel';
import { VaultPanel } from '../ui/VaultPanel';
import { RitualPanel } from './RitualPanel';
import { usePlayerStore } from '../../store/playerStore';
import styles from './sanctum.module.scss';

type SanctumTab = 'crucible' | 'vault' | 'rituals' | 'summary';

export function SanctumView() {
    const [activeTab, setActiveTab] = useState<SanctumTab>('crucible');
    const { crucibleSealed, equipment } = usePlayerStore();

    // Determine dominant specialization path for ambient theme
    const specCounts = Object.values(equipment).reduce((acc, item) => {
        if (item?.specPath) acc[item.specPath]++;
        return acc;
    }, { sanguine: 0, vile: 0 } as Record<string, number>);

    const dominantPath = specCounts.sanguine > specCounts.vile ? 'sanguine' : 
                         specCounts.vile > specCounts.sanguine ? 'vile' : null;

    const themeClass = dominantPath === 'sanguine' ? styles.sanguineTheme :
                       dominantPath === 'vile' ? styles.vileTheme : '';

    return (
        <div className={`${styles.root} ${themeClass}`}>
            <header className={styles.header}>
                <h2 className={styles.title}>The Sanguine Sanctum</h2>
                <div className={styles.statusIndicator}>
                    <span className={crucibleSealed ? styles.sealed : styles.unsealed}>
                        {crucibleSealed ? 'Crucible Sealed' : 'Crucible Unsealed'}
                    </span>
                </div>
            </header>

            <nav className={styles.nav}>
                <button 
                    className={`${styles.navBtn} ${activeTab === 'crucible' ? styles.active : ''}`}
                    onClick={() => setActiveTab('crucible')}
                >
                    Crucible
                </button>
                <button 
                    className={`${styles.navBtn} ${activeTab === 'vault' ? styles.active : ''}`}
                    onClick={() => setActiveTab('vault')}
                >
                    Vault
                </button>
                <button 
                    className={`${styles.navBtn} ${activeTab === 'rituals' ? styles.active : ''}`}
                    onClick={() => setActiveTab('rituals')}
                >
                    Rituals
                </button>
                <button 
                    className={`${styles.navBtn} ${activeTab === 'summary' ? styles.active : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    Progression Summary
                </button>
            </nav>

            <main className={styles.content}>
                {activeTab === 'crucible' && <CruciblePanel />}
                {activeTab === 'vault' && <VaultPanel />}
                {activeTab === 'rituals' && <RitualPanel />}
                {activeTab === 'summary' && (
                    <div className={styles.summaryPlaceholder}>
                        <h3>Hunt Progression Summary</h3>
                        <p>Detailed performance analytics and tier mastery metrics will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
