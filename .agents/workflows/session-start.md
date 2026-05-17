# Workflow — Session Start Protocol

Use this workflow at the beginning of a new session or work day to ensure the codebase is healthy and to load the correct context.

---

## Instructions for the Agent

When the user invokes `/session-start`, you must perform the following steps in order:

### 1. The Baseline Check
Run these commands to ensure we are starting from a healthy state:
- **Run `npm run build`** to check for TypeScript errors and build integrity.
- **Run `npm test`** to verify that all unit tests are green.

If either command fails, stop and report the failure to the user immediately. Do not proceed with the rest of the workflow until the baseline is green.

### 2. Context Loading
If the baseline check passes, read these files to load the project context:
- **Read `handoff.md`** (or the most recent equivalent) to see where the last session left off and what pending tasks remain.
- **Read `.agents/constitution.md`** to load the 8 Non-Negotiables into your prompt context.

### 3. Session Summary
Conclude the workflow by providing the user with a clean summary:
- **Build Status**: ✅ Pass / ❌ Fail
- **Test Status**: ✅ Pass / ❌ Fail
- **Last Session Ended With**: [1-2 sentences summarizing handoff.md]
- **Pending Tasks**: [List the top 2-3 tasks found in handoff.md]

---

## Usage
Simply type `/session-start` at the beginning of your message to trigger this protocol.
