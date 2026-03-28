# Changelog & Release Notes

## About This File

Historical release data **was not found** in the repository (no `CHANGELOG.md`, no git tags, no version history file). This document provides:
1. A reconstruction of known milestones from the codebase
2. A release note template for future use

---

## Reconstructed History (Inferred from Source)

The following phases are documented inline throughout the source code. Dates are **not available**.

### Phase 1 — Foundation (Inferred: initial commit)
- Basic combat loop established
- React + Zustand + Vite scaffolding
- Initial zone and enemy definitions

### Phase 2A — Foundational Mechanics
- Scent of Fear system (evasion pressure, 4s intervals)
- Red Mist mechanic (< 30% HP → +20% damage, +10% Ichor drops)
- Siphoning system (heal 20% HP for Blood Shards)
- Death penalty system (banked vs. unbanked resources)
- Four Distill actions: Sanguine Finesse, Vile Reinforcement, Ichor Stabilization, Prototype Tier-Shift
- Resource economy: Blood Shards, Cursed Ichor, Grave Steel, Stabilized Ichor

### Phase 2B — Progression
- Gear Refinement system (0–5 levels)
- Scent Sensitivity mechanic (refinement increases scent gain rate)
- Tier Shift system (T1–T6 gear promotion)
- Specialization Paths: Sanguine and Vile

### Phase 2C — Scent Refinement
- Scent-based event thresholds: Bloodlust, Hemophilic Curse, Razor Fangs
- Boss spawn at 20% scent (this mechanism was later replaced by Blood Echoes)
- Critical strikes system (Fang Mastery-based ~24% at L120)
- Scent-based enemy stat scaling (damage ×(1+scent), HP ×(1+scent×0.5))

### Phase 3 — Specialization
- Specialization Path hooks in `getSpecializationModifiers()` (skeleton values)
- Refinement stat scaling (1% per level to primary stats)
- Trinity Lock v1.7 (CRUSH/STAB/SLASH differentiation in mitigation)
- Heavy weapon mechanics (> 2.2s interval → 35% armor pen + min damage floor)

### Phase 4 — Evolution Systems
- Path Resonance (3+ same-path items → active bonuses)
- Ritual system (pre-hunt modifiers that affect scent, loot, HP, speed, armor)
- Reactive Flicker (auto-evade with dash cooldown)
- Ironbound status (block → 2s stagger immunity for Vile Resonance)
- Blood Echo manifestations (scent reaches 100% → elite boss spawns)
- Session performance scoring for Crucible gating (survival + aggression + pressure + rituals)
- Famine Rest safety net (< 30% HP + < 5 shards → slow regen)
- Scent lock after Blood Echo (120s lockout)

### Phase 4 Sprint 4 (Current)
- Blood Echoes system completed (per-zone manifestation bosses)
- Full session metrics: peak scent, time above 60%/80% scent, flicker/ironbound trigger counts
- Skilling systems added: Grave Harvesting, Night Foraging, Forging, Corpse Harvesting, Alchemy
- Persistent Vitae (HP no longer resets between combats)
- `playerStore` schema version 6 (new skills migrated)
- Sanguine Exchange merchant shop
- Combat UI refinements (consumable bar, player card, combat log)

---

## Release Notes Template

Use this format for all future releases:

```markdown
## vX.Y.Z — YYYY-MM-DD

### 🩸 New Features
- ...

### ⚙️ Balance Changes
- ...

### 🐛 Bug Fixes
- ...

### 🔨 Technical Changes
- ...

### ⚠️ Breaking Changes / Migration Notes
- ...

### Known Issues
- ...
```

---

## Recommended Next Steps

- [ ] Add Git tags at meaningful milestones (`v0.1.0`, `v0.2.0`) — repo is at https://github.com/Alphasinn/crimson-engine
- [ ] Start committing this file with proper entries after each DEV → main merge
- [ ] Consider semantic versioning: `MAJOR.MINOR.PATCH`
  - MAJOR: fundamental game loop changes
  - MINOR: new features or systems
  - PATCH: bug fixes, balance tweaks
