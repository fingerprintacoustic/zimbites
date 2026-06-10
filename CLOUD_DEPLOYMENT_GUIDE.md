# Zimbites Cloud Deployment Guide

This guide will help you deploy the Zimbites app to the cloud using **TiDB Cloud** and **Render**.

## 1. Database Setup (TiDB Cloud)
1.  Go to [TiDB Cloud](https://pingcap.com/tidb-cloud) and create a free account.
2.  Create a new **Serverless Cluster**.
3.  Click **Connect** and choose **Node.js (Prisma/Drizzle)**.
4.  Copy the connection string (it should look like `mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}`).

## 2. App Deployment (Render)
1.  Go to [Render](https://render.com) and create a free account.
2.  Connect your GitHub repository (**fingerprintacoustic/zimbites**).
3.  Render should automatically detect the `render.yaml` file. If not, create a new **Web Service**.
4.  Set the following Environment Variables in Render:
    *   `DATABASE_URL`: The connection string you got from TiDB.
    *   `BETA_ACCESS_CODE`: A secret code for your testers (e.g., `zimbites-2024`).
    *   `JWT_SECRET`: Any random long string (or let Render generate one).

## 3. Database Initialization
Once the app is deployed, you need to push the database schema:
1.  Open the **Shell** tab in your Render service.
2.  Run the command: `pnpm db:push`
3.  (Optional) To add demo data, run: `node seed-demo-data.mjs`

## 4. Accessing the App
*   Go to your Render URL (e.g., `https://zimbites-app.onrender.com`).
*   You will be asked for the **Beta Access Code**.
*   Use the **OpenID** for the role you want to test:
    *   Admin: `admin-demo-001`
    *   Customer: `customer-demo-001`
    *   Restaurant: `restaurant-demo-001`
    *   Driver: `driver-demo-001`
