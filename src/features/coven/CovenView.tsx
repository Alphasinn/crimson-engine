import { useState } from 'react';
import styles from './coven.module.scss';
import { DomicileTab } from './DomicileTab';
import { CollectiveTab } from './CollectiveTab';

type Tab = 'domicile' | 'collective';

export function CovenView() {
    const [activeTab, setActiveTab] = useState<Tab>('domicile');

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <h1 className={styles.title}>Coven</h1>
                <p className={styles.subtitle}>
                    "Bind your will to the collective and shape destiny together."
                </p>
            </header>

            <nav className={styles.nav}>
                <button 
                    className={`${styles.navBtn} ${activeTab === 'domicile' ? styles.active : ''}`}
                    onClick={() => setActiveTab('domicile')}
                >
                    Domicile
                </button>
                <button 
                    className={`${styles.navBtn} ${activeTab === 'collective' ? styles.active : ''}`}
                    onClick={() => setActiveTab('collective')}
                >
                    Coven
                </button>
            </nav>

            <main className={styles.tabContent}>
                {activeTab === 'domicile' ? <DomicileTab /> : <CollectiveTab />}
            </main>
        </div>
    );
}
