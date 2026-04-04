import { useState } from 'react';
import { CombatView } from './features/combat/CombatView';
import { InventoryView } from './features/inventory/InventoryView';
import { SanctumView } from './features/sanctum/SanctumView';
import { ProfileView } from './features/character/ProfileView';
import { SanguineExchangeView } from './features/store/SanguineExchangeView';
import { BloodlettingView } from './features/harvesting/BloodlettingView';
import { DistillationView } from './features/harvesting/DistillationView';
import { SkillingView } from './features/skilling/SkillingView';
import { GRAVE_NODES, FORAGING_NODES, FORGING_RECIPES, CORPSE_RECIPES, ALCHEMY_RECIPES, BUTCHERY_NODES, RELIC_NODES, RUNECRAFT_RECIPES } from './data/skilling';

import { ResourceHUD } from './features/ui/ResourceHUD';
import './styles/main.scss';
import iconDistill from './assets/skills/distillation/distillation.png';
import iconBlood from './assets/skills/bloodletting/bloodletting.png';
import iconMagic from './assets/icons/blood_magic.png';
import iconGrave from './assets/skills/graveHarvesting/graveHarvesting.png';
import iconForaging from './assets/skills/nightForaging/nightForaging.png';
import iconForging from './assets/skills/forging/forging.png';
import iconCorpse from './assets/skills/corpseHarvesting/corpseHarvesting.png';
import iconAlchemy from './assets/skills/alchemy/alchemy.png';
import iconAttack from './assets/icons/attack.png';

// Placeholder icons for new skills
const iconButchery = iconCorpse;
const iconRelicScavenging = iconGrave;
const iconRunecraft = iconMagic;
import styles from './App.module.scss';

import { CovenView } from './features/coven/CovenView';

type Tab = 
  | 'combat' | 'sanctum' | 'profile' | 'inventory' | 'store' | 'coven'
  | 'bloodletting' | 'graveHarvesting' | 'nightForaging' | 'butchery' | 'relicScavenging'
  | 'distillation' | 'forging' | 'corpseHarvesting' | 'alchemy' | 'runecraft';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'combat': return <CombatView />;
      case 'sanctum': return <SanctumView />;
      case 'profile': return <ProfileView />;
      case 'inventory': return <InventoryView />;
      case 'store': return <SanguineExchangeView />;
      case 'coven': return <CovenView />;
      case 'bloodletting': return <BloodlettingView />;
      case 'graveHarvesting': return <SkillingView skill="graveHarvesting" nodes={GRAVE_NODES} title="Grave Harvesting" description="Mine the ruins of the old world for dust, ore, and ancient relics." iconUrl={iconGrave} />;
      case 'nightForaging': return <SkillingView skill="nightForaging" nodes={FORAGING_NODES} title="Night Foraging" description="Scavenge the dark woods for rare herbs and moon-touched flora." iconUrl={iconForaging} />;
      case 'butchery': return <SkillingView skill="butchery" nodes={BUTCHERY_NODES} title="Butchery" description="Expertly carve beast remains for prime cuts and usable materials." iconUrl={iconButchery} />;
      case 'relicScavenging': return <SkillingView skill="relicScavenging" nodes={RELIC_NODES} title="Relic Scavenging" description="Sift through ancient debris for fragments of the old world's power." iconUrl={iconRelicScavenging} />;
      case 'distillation': return <DistillationView />;
      case 'forging': return <SkillingView skill="forging" nodes={FORGING_RECIPES} title="Forging" description="Hammer raw materials into reinforced components and gear upgrades." iconUrl={iconForging} />;
      case 'corpseHarvesting': return <SkillingView skill="corpseHarvesting" nodes={CORPSE_RECIPES} title="Corpse Harvesting" description="Process enemy remains into usable crafting materials like sinew and hide." iconUrl={iconCorpse} />;
      case 'alchemy': return <SkillingView skill="alchemy" nodes={ALCHEMY_RECIPES} title="Alchemy" description="Transmute blood and flora into potent consumables and support oils." iconUrl={iconAlchemy} />;
      case 'runecraft': return <SkillingView skill="runecraft" nodes={RUNECRAFT_RECIPES} title="Runecraft" description="Inscribe potent sigils and glyphs to empower your equipment." iconUrl={iconRunecraft} />;
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
            className={`${styles.navBtn} ${activeTab === 'coven' ? styles.active : ''}`}
            onClick={() => setActiveTab('coven')}
          >
            <img src={iconMagic} alt="" className={styles.navIcon} />
            <span>Coven</span>
          </button>
          
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
            <img src={iconGrave} alt="" className={styles.navIcon} />
            <span>Grave Harvesting</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'nightForaging' ? styles.active : ''}`}
            onClick={() => setActiveTab('nightForaging')}
          >
            <img src={iconForaging} alt="" className={styles.navIcon} />
            <span>Night Foraging</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'butchery' ? styles.active : ''}`}
            onClick={() => setActiveTab('butchery')}
          >
            <img src={iconButchery} alt="" className={styles.navIcon} />
            <span>Butchery</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'relicScavenging' ? styles.active : ''}`}
            onClick={() => setActiveTab('relicScavenging')}
          >
            <img src={iconRelicScavenging} alt="" className={styles.navIcon} />
            <span>Relic Scavenging</span>
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
            <img src={iconForging} alt="" className={styles.navIcon} />
            <span>Forging</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'corpseHarvesting' ? styles.active : ''}`}
            onClick={() => setActiveTab('corpseHarvesting')}
          >
            <img src={iconCorpse} alt="" className={styles.navIcon} />
            <span>Corpse Harvesting</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'alchemy' ? styles.active : ''}`}
            onClick={() => setActiveTab('alchemy')}
          >
            <img src={iconAlchemy} alt="" className={styles.navIcon} />
            <span>Alchemy</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'runecraft' ? styles.active : ''}`}
            onClick={() => setActiveTab('runecraft')}
          >
            <img src={iconRunecraft} alt="" className={styles.navIcon} />
            <span>Runecraft</span>
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
