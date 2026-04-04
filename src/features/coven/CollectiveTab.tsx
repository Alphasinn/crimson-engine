import styles from './coven.module.scss';

interface Objective {
    name: string;
    progress: number;
    requirement: string;
    reward: string;
}

const OBJECTIVES: Objective[] = [
    {
        name: "Rite of Blood Accumulation",
        progress: 72,
        requirement: "Donate Blood Essence",
        reward: "+Global Health Bonus"
    },
    {
        name: "Old World Relic Hunt",
        progress: 25,
        requirement: "Participate in Relic Scavenging",
        reward: "+10% Exp Gain"
    },
    {
        name: "Essence Infusion Phase I",
        progress: 90,
        requirement: "Complete Butcher Tasks",
        reward: "+Unlocked Distillation Slots"
    }
];

const CONTRIBUTORS = [
    { name: "Sanguis_X", score: 1420 },
    { name: "BloodLord99", score: 1105 },
    { name: "You", score: 850, isPlayer: true },
    { name: "Vespera", score: 720 },
    { name: "Noctis", score: 450 }
];

const UNLOCKS = [
    { name: "Blood Efficiency I", status: "unlocked" },
    { name: "Relic Yield Boost", status: "unlocked" },
    { name: "Runic Slot +1", status: "inProgress" },
    { name: "Alchemy Boost", status: "locked" }
];

export function CollectiveTab() {
    return (
        <div className={styles.collectiveLayout}>
            {/* Panel 1: Active Objectives */}
            <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Active Objectives</h3>
                {OBJECTIVES.map((obj, i) => (
                    <div key={i} className={styles.objectiveCard}>
                        <div className={styles.objHeader}>{obj.name}</div>
                        <div className={styles.progressContainer}>
                            <div className={styles.progressBar} style={{ width: `${obj.progress}%` }} />
                        </div>
                        <div className={styles.objDesc}>{obj.requirement}</div>
                        <div className={styles.objReward}>
                            Reward: <span>{obj.reward}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Panel 2: Contributions */}
            <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Contributions</h3>
                <div className={styles.contributionsSection}>
                    <div className={styles.contributionStats}>
                        <div className={styles.statRow}>
                            <span>Blood Donated</span>
                            <span className={styles.statVal}>250</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>Relics Offered</span>
                            <span className={styles.statVal}>12</span>
                        </div>
                        <div className={styles.statRow}>
                            <span>Tasks Completed</span>
                            <span className={styles.statVal}>5</span>
                        </div>
                    </div>

                    <div className={styles.rankedList}>
                        {CONTRIBUTORS.map((c, i) => (
                            <div key={i} className={`${styles.rankItem} ${c.isPlayer ? styles.isPlayer : ''}`}>
                                <span className={styles.name}>{i + 1}. {c.name}</span>
                                <span className={styles.score}>{c.score}</span>
                            </div>
                        ))}
                    </div>

                    <button className={styles.contributeBtn}>Contribute</button>
                </div>
            </div>

            {/* Panel 3: Coven Unlocks */}
            <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Coven Unlocks</h3>
                <div className={styles.unlocksList}>
                    {UNLOCKS.map((u, i) => (
                        <div key={i} className={styles.unlockItem}>
                            <span className={styles.unlockName}>{u.name}</span>
                            <span className={`${styles.statusTag} ${styles[u.status]}`}>
                                {u.status === 'inProgress' ? 'In Progress' : u.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
