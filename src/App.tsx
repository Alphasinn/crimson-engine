import { useState } from 'react';
import { CombatView } from './features/combat/CombatView';
import { InventoryView } from './features/inventory/InventoryView';
import { SanctumView } from './features/sanctum/SanctumView';
import { ProfileView } from './features/character/ProfileView';
import { SanguineExchangeView } from './features/store/SanguineExchangeView';

import { ResourceHUD } from './features/ui/ResourceHUD';
import './styles/main.scss';
import iconMagic from './assets/icons/blood_magic.png';
import iconAttack from './assets/icons/attack.png';
import styles from './App.module.scss';

type Tab = 'combat' | 'sanctum' | 'profile' | 'inventory' | 'store';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('combat');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'combat': return <CombatView />;
      case 'sanctum': return <SanctumView />;
      case 'profile': return <ProfileView />;
      case 'inventory': return <InventoryView />;
      case 'store': return <SanguineExchangeView />;
      default: return <CombatView />;
    }
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <img src={iconMagic} alt="Blood" className={styles.logoBlood} />
          <span className={styles.logoTitle}>Crimson Engine</span>
        </div>
        <div className={styles.headerSub}>Vampire Idle Combat System — v0.1</div>
      </header>

      {/* Persistent Resource HUD */}
      <ResourceHUD />

      {/* Main Layout */}
      <main className={styles.main}>
        {/* Left Side Navigation (Idle Clans Style) */}
        <nav className={styles.sideNav}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>Profile</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'inventory' ? styles.active : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <span>Inventory</span>
          </button>

          <div className={styles.navDivider} />
          
          <button 
            className={`${styles.navBtn} ${activeTab === 'store' ? styles.active : ''}`}
            onClick={() => setActiveTab('store')}
          >
            <img src={iconMagic} alt="" className={styles.navIcon} />
            <span>Sanguine Exchange</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'sanctum' ? styles.active : ''}`}
            onClick={() => setActiveTab('sanctum')}
          >
            <img src={iconMagic} alt="" className={styles.navIcon} />
            <span>Sanctum</span>
          </button>

          <div className={styles.navDivider} />

          <button 
            className={`${styles.navBtn} ${activeTab === 'combat' ? styles.active : ''}`}
            onClick={() => setActiveTab('combat')}
          >
            <img src={iconAttack} alt="" className={styles.navIcon} />
            <span>Combat</span>
          </button>
        </nav>

        {/* Dynamic Center Content */}
        <section className={styles.content}>
          {renderActiveView()}
        </section>
      </main>
    </div>
  );
}

export default App;
