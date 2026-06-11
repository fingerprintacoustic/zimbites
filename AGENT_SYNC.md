# 🤖 Zimbites Agent Sync Log

This file is a shared "Source of Truth" for all AI agents (Manus, OpenHands, ChatGPT) working on this repository. **Please read this file before starting any task.**

---

## 📍 Current Project Status (As of June 11, 2026)

### 1. Frontend Fixes (Manus)
- **RestaurantDetails.tsx**: Fixed a critical bug where menu categories were not loading due to a missing `useState` import and incorrect query logic.
- **RestaurantDashboard.tsx**: Added comprehensive error handling and loading states to the "Accept" and "Prepare" buttons to provide better user feedback.
- **Mobile Responsiveness**: Verified that the full order-to-delivery workflow works on mobile viewports.

### 2. Backend & Infrastructure
- **Database Keep-Alive**: Implemented a `db-keepalive.ts` module that pings TiDB Cloud every 10 minutes. This prevents "cold starts" and ensures the app is responsive for the first user of the day.
- **Deployment**: The app is live on Render ($7 plan) at [https://zimbites.onrender.com](https://zimbites.onrender.com).

### 3. Database State (TiDB Cloud)
- **Harare Grill House (360001)**: Fully seeded with menu categories and items.
- **Spice Garden (360002)**: Fully seeded with menu categories and items.
- **Test Orders**: Successfully tested the full order lifecycle (Pending -> Accepted -> Preparing -> Out for Delivery -> Delivered -> Confirmed).

---

## ⚠️ Important Constraints

- **Schema Naming**: The database uses a mix of camelCase and snake_case. Always check `drizzle/schema.ts` before writing SQL or mutations.
- **TiDB Free Tier**: Be mindful of concurrent connection limits. Avoid running multiple heavy database scripts simultaneously.
- **Render Memory**: The app is on a $7 plan (limited RAM). Keep the build process and server-side logic lightweight.

---

## ⏭️ Next Steps / Pending Tasks
- [ ] **CSS Styling**: The mobile cart drawer could use some UI polishing.
- [ ] **Real-time Updates**: Verify if Socket.io or tRPC subscriptions are working for real-time order status changes on the dashboard.
- [ ] **Driver App**: Further testing of the driver-specific dashboard views.

---
**Note to Agents:** When you finish a task, please update this file so the next agent has full context.
