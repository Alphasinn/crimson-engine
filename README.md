# Crimson Engine v1.1 (Phase 2A)

**Crimson Engine** is a dark fantasy, tick-based idle RPG engine focusing on automated combat, deep resource management, and high-tension decision loops. 

Phase 2A (The Foundational Prototype) establishes the core "Hunt → Harvest → Evaluate → Distill" loop, featuring the **Scent of Fear** and **Red Mist** mechanics.

---

## 🩸 Core Gameplay Loop

The engine operates on a continuous, automated cycle:
1. **Hunt**: Automatic combat against enemies in various zones.
2. **Harvest**: Loot resources like Blood Shards, Cursed Ichor, and Grave-Steel.
3. **Evaluate**: Monitor your HP and current "Scent" to decide when to retreat.
4. **Distill**: Use accumulated resources in the Sanctum to empower your character for the next hunt.

---

## ⚙️ Key Mechanics

### 🧬 Scent of Fear (Evasion Pressure)
The longer you avoid damage, the more "Scent of Fear" you build.
- **Buildup**: +0.01 enemy accuracy bonus every 4 seconds (40 ticks).
- **Reset**: Scent resets to 0 instantly when you take damage.
- **Siphoning**: Reduces your current scent by 50% (multiplicative).
- **Goal**: Keeps evasion-heavy builds from becoming untouchable.

### 🌫️ Red Mist (Risk & Reward)
When your health falls below **30%**, you enter the Red Mist.
- **Bonus**: +20% Damage dealt.
- **Loot**: +10% Cursed Ichor drop rate.
- **Danger**: You are one miscalculated hit away from a heavy death penalty.

### 💉 Siphoning (Sustainable Attrition)
Allows you to heal mid-combat using Blood Shards.
- **Heal**: 20% of Max HP.
- **Cost**: Starts at 10 Shards and scales exponentially per use during a single hunt.
- **Strategy**: Deciding whether to use your last shards to stay in the Red Mist or retreat to safety.

---

## 💎 Resource System

| Resource | Purpose | Penalty on Death |
| :--- | :--- | :--- |
| **Blood Shards** | Main currency; used for siphoning and distilling. | 50% Lost (Unbanked) |
| **Cursed Ichor** | Rare reagent; used for stabilization. | 100% Lost (Unbanked) |
| **Grave-Steel** | Durable material; used for armor and gear. | **Retained** |
| **Stabilized Ichor** | High-tier material for progression. | **Retained** |

---

## 🛠️ Distill Actions (Sanctum)

Invest your hard-earned resources into permanent or tactical advantages:
- **Sanguine Finesse**: Costs 15 Shards. Grants +5% Accuracy Rating and double lifesteal (if <50% HP) for 200 attack ticks.
- **Vile Reinforcement**: Costs 30 Shards + 10 Steel. Grants permanent +5 Flat Armor and the **Braced** status.
- **Ichor Stabilization**: Costs 125 Shards + 1 Cursed Ichor. Produces 1 Stabilized Ichor.
- **Prototype Tier-Shift**: Costs 200 Shards + 3 Stabilized Ichor + 25 Steel. Unlocks Tier 2 Weapon Frames.

---

## 🚀 Development & Setup

### Requirements
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 🏗️ Architecture
- **Engine**: Pure TypeScript, tick-based (100ms heartbeat).
- **State**: Managed via [Zustand](https://github.com/pmndrs/zustand) for high-performance reactivity.
- **UI**: React components styled with modern Vanilla CSS.
- **Formulas**: Centralized in `formulas.ts` for deterministic combat math.

---

## 📜 License
MIT
