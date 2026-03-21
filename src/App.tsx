import { CombatView } from './features/combat/CombatView';
import { CharacterPanel } from './features/character/CharacterPanel';
import './styles/main.scss';
import iconMagic from './assets/icons/blood_magic.png';
import styles from './App.module.scss';

function App() {
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

      {/* Main Layout */}
      <main className={styles.main}>
        {/* Left: Character Skills */}
        <aside className={styles.sidebar}>
          <CharacterPanel />
        </aside>

        {/* Center + Right: Combat */}
        <section className={styles.content}>
          <CombatView />
        </section>
      </main>
    </div>
  );
}

export default App;
