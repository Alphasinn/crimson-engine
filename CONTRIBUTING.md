# 🩸 Crimson Engine — Development Workflow

Welcome to the project! To maintain a stable experience for players while allowing for rapid experimentation, we follow a strictly tiered branching strategy.

## 🌳 Branching Strategy

### 🟢 `main` (Production)
- **Purpose**: This is the live version of the game.
- **Rules**: NEVER commit directly to `main`. It should only receive updates from `DEV` after thorough testing.
- **Stability**: Must be 100% bug-free and buildable at all times.

### 🟡 `DEV` (Staging / Integration)
- **Purpose**: This is the testing ground where different developers' work is combined.
- **Rules**: Merge your feature branches here first. Run the game, check for balance issues, and verify that new code doesn't break existing systems.

### 🔴 `tech/*` (Developer Playgrounds)
- **Current Branches**: `alpha/test`, `tech/techmage528`
- **Purpose**: These are individual developer "sandboxes." 
- **Rules**: Build, break, and experiment here. You are free to commit directly to your specific `tech` branch.

---

## 🚀 How to Contribute

1. **Get the latest code**:
   ```bash
   git fetch --all
   git checkout main
   git pull origin main
   ```

2. **Move to your sandbox**:
   ```bash
   git checkout tech/YOUR_NAME
   git merge main  # Ensure your playground is up-to-date
   ```

3. **Develop & Break**:
   Make your changes, test them locally with `npm run dev`.

4. **Promote to Testing**:
   When your feature is ready, merge it into the `DEV` branch:
   ```bash
   git checkout DEV
   git merge tech/YOUR_NAME
   git push origin DEV
   ```

5. **Final Release**:
   Once the feature is verified in `DEV`, the project lead will merge `DEV` into `main`.

---

## 🛠 Tech Stack
- **Framework**: React + Vite
- **State**: Zustand (Combat & Player stores)
- **Styling**: SCSS Modules
- **Engine**: TypeScript 
