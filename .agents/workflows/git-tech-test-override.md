---
description: How to push to tech/test (Force Override Rule)
---

# Git Force Override Workflow (tech/test)

This workflow is MANDATORY when pushing changes to the `tech/test` branch. 

**Rule**: Never pull from `tech/test` before pushing. The local state is the source of truth.

## Steps

1. **Stash Local Work (If any)**: Use `git stash` if you have uncommitted changes.
2. **Switch to tech/test**: `git checkout tech/test`
3. **Commit Your Changes**: Ensure all your local work is committed to the local `tech/test` branch.
4. **Force Push to Remote**: 
// turbo
```powershell
git push origin tech/test --force
```

**WARNING**: This will overwrite any changes on the remote `tech/test` branch. This is the intended behavior for this project tracking branch.
