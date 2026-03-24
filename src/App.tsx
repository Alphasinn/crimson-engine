import { useState } from 'react';
import { CombatView } from './features/combat/CombatView';
import { InventoryView } from './features/inventory/InventoryView';
import { SanctumView } from './features/sanctum/SanctumView';
import { ProfileView } from './features/character/ProfileView';
import { SanguineExchangeView } from './features/store/SanguineExchangeView';
import { BloodlettingView } from './features/harvesting/BloodlettingView';
import { DistillationView } from './features/harvesting/DistillationView';
import { SkillingView } from './features/skilling/SkillingView';
import { GRAVE_NODES, FORAGING_NODES, FORGING_RECIPES, CORPSE_RECIPES, ALCHEMY_RECIPES } from './data/skilling';

import { ResourceHUD } from './features/ui/ResourceHUD';
import './styles/main.scss';
import iconMagic from './assets/icons/blood_magic.png';
import iconDistill from './assets/tech/test/distillation.png';
import iconBlood from './assets/tech/test/bloodletting.png';
import iconAttack from './assets/icons/attack.png';
import styles from './App.module.scss';

type Tab = 
  | 'combat' | 'sanctum' | 'profile' | 'inventory' | 'store' 
  | 'bloodletting' | 'graveHarvesting' | 'nightForaging'
  | 'distillation' | 'forging' | 'corpseHarvesting' | 'alchemy';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'combat': return <CombatView />;
      case 'sanctum': return <SanctumView />;
      case 'profile': return <ProfileView />;
      case 'inventory': return <InventoryView />;
      case 'store': return <SanguineExchangeView />;
      case 'bloodletting': return <BloodlettingView />;
      case 'graveHarvesting': return <SkillingView skill="graveHarvesting" nodes={GRAVE_NODES} title="Grave Harvesting" description="Mine the ruins of the old world for dust, ore, and ancient relics." icon="⛏️" />;
      case 'nightForaging': return <SkillingView skill="nightForaging" nodes={FORAGING_NODES} title="Night Foraging" description="Scavenge the dark woods for rare herbs and moon-touched flora." icon="🌿" />;
      case 'distillation': return <DistillationView />;
      case 'forging': return <SkillingView skill="forging" nodes={FORGING_RECIPES} title="Forging" description="Hammer raw materials into reinforced components and gear upgrades." icon="🔨" />;
      case 'corpseHarvesting': return <SkillingView skill="corpseHarvesting" nodes={CORPSE_RECIPES} title="Corpse Harvesting" description="Process enemy remains into usable crafting materials like sinew and hide." icon="🦴" />;
      case 'alchemy': return <SkillingView skill="alchemy" nodes={ALCHEMY_RECIPES} title="Alchemy" description="Transmute blood and flora into potent consumables and support oils." icon="⚗️" />;
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

          <button 
            className={`${styles.navBtn} ${activeTab === 'bloodletting' ? styles.active : ''}`}
            onClick={() => setActiveTab('bloodletting')}
          >
            <img src={iconBlood} alt="" className={styles.navIcon} />
            <span>Bloodletting</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'graveHarvesting' ? styles.active : ''}`}
            onClick={() => setActiveTab('graveHarvesting')}
          >
            <span className={styles.navEmoji}>⛏️</span>
            <span>Grave Harvesting</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'nightForaging' ? styles.active : ''}`}
            onClick={() => setActiveTab('nightForaging')}
          >
            <span className={styles.navEmoji}>🌿</span>
            <span>Night Foraging</span>
          </button>

          <div className={styles.navDivider} />

          <button 
            className={`${styles.navBtn} ${activeTab === 'distillation' ? styles.active : ''}`}
            onClick={() => setActiveTab('distillation')}
          >
            <img src={iconDistill} alt="" className={styles.navIcon} />
            <span>Distillation</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'forging' ? styles.active : ''}`}
            onClick={() => setActiveTab('forging')}
          >
            <span className={styles.navEmoji}>🔨</span>
            <span>Forging</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'corpseHarvesting' ? styles.active : ''}`}
            onClick={() => setActiveTab('corpseHarvesting')}
          >
            <span className={styles.navEmoji}>🦴</span>
            <span>Corpse Harvesting</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'alchemy' ? styles.active : ''}`}
            onClick={() => setActiveTab('alchemy')}
          >
            <span className={styles.navEmoji}>⚗️</span>
            <span>Alchemy</span>
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
