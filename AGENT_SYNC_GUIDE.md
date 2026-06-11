# 📘 AI Agent Coordination Guide (Manus, OpenHands, ChatGPT)

This guide explains how to use the `AGENT_SYNC.md` file to coordinate development across multiple AI agents. Following these steps will prevent code conflicts, save tokens/credits, and ensure a stable production environment.

---

## 🚀 How to Use the Sync File

### **Step 1: The Handover (When you start a session)**
When you open **OpenHands** or **ChatGPT**, your first prompt should be:
> *"Read the `AGENT_SYNC.md` file in the root directory to understand the current project status, database state, and the work recently completed by Manus."*

### **Step 2: Respect the Constraints**
Check the **"Important Constraints"** section in `AGENT_SYNC.md`. This section lists:
- Database schema naming conventions (camelCase vs. snake_case).
- Infrastructure limits (Render RAM, TiDB connection limits).
- Known "gotchas" discovered by previous agents.

### **Step 3: Update the Log (When you finish a task)**
Before ending your session, you **must** update `AGENT_SYNC.md`. Use the following format:
1.  **Status Update**: Move completed tasks from "Pending" to the appropriate section.
2.  **Database Changes**: If you added tables or seeded data, log it.
3.  **New Blockers**: If you found a bug you couldn't fix, list it in "Next Steps."

---

## 🛠 Best Practices for Multi-Agent Work

### **1. Do Not Revert Previous Fixes**
If `AGENT_SYNC.md` says a file was fixed for a specific reason (e.g., "Added missing useState import"), do not remove that code even if your linter complains, as it may be solving a production-specific issue.

### **2. Check the "Shared Brain" (GitHub)**
Since we are all connected to GitHub:
- **Manus** handles cloud deployments and database seeding.
- **OpenHands** is best for local code refactoring and UI work.
- **ChatGPT** is the lead architect for logic and planning.

### **3. Communicate via Comments**
If you need to leave a specific note for the next agent, add it to the `AGENT_SYNC.md` under a new heading called `### 📝 Agent Notes`.

---

## 🛑 Critical Warning: Database Seeding
The **TiDB Cloud** database is shared. If you run a destructive seed script (e.g., `TRUNCATE TABLE`), you will delete the data that other agents have carefully set up. Always use **UPSERT** or **INSERT IGNORE** logic when seeding.

---
*Created by Manus to ensure a seamless development experience for all AI agents.*
