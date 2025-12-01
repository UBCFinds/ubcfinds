# UBC Finds - Setup & Installation Guide

This document provides comprehensive instructions for setting up the **UBC Finds** development environment, configuring necessary cloud services (Google Maps, Supabase), and deploying the application to Vercel.

---

## 1. Prerequisites

Before starting, ensure you have the following installed and configured:

*   **Node.js** (v18.0.0 or higher recommended)
*   **npm** (Node Package Manager)
*   **Git**
*   A **Google Cloud Platform** account (for Maps API)
*   A **Supabase** account (for Database)
*   A **Vercel** account (for Deployment)

---

## 2. Local Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/ubcfinds/ubcfinds.github.io.git
    cd ubcfinds.github.io
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

---

## 3. Service Configuration

This application relies on two external services: Google Maps Platform and Supabase. You must set these up to run the app.

### A. Google Maps Platform

1.  Log in to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "UBC Finds").
3.  Navigate to **APIs & Services > Library**.
4.  Search for and enable the **Maps JavaScript API**.
5.  Navigate to **APIs & Services > Credentials**.
6.  Click **Create Credentials > API Key**.
7.  **Important:** Restrict your API key to prevent unauthorized use:
    *   Under "Application restrictions", select **HTTP referrers (web sites)**.
    *   Add `http://localhost:3000/*` for local development.
    *   Add your Vercel deployment domain (e.g., `https://ubc-finds.vercel.app/*`) once deployed.
8.  Copy the generated API Key.

### B. Supabase (Database)

1.  Log in to [Supabase](https://supabase.com/).
2.  Click **New Project**.
3.  Enter a name (e.g., "UBC Finds DB") and a secure database password.
4.  Select a region close to your users (e.g., US West).
5.  Once the project is created, go to **Project Settings > API**.
6.  Copy the **Project URL** and the **anon / public** Key.

#### Database Schema Setup
To enable the "Report Issue" functionality, you must create the `reports` table.
**Note:** This table was created manually in the Supabase Table Editor, not via a SQL script.

**Schema Definition:**
```sql
create table public.reports (
  created_at timestamp with time zone not null default now(),
  description text null,
  issue_type text null,
  util_id text null,
  util_name text null,
  constraint reports_pkey primary key (created_at)
) TABLESPACE pg_default;
```

*Ensure you also configure Row Level Security (RLS) policies to allow anonymous users to INSERT and SELECT from this table.*

---

## 4. Environment Variables

Create a file named `.env.local` in the root directory of the project. This file is ignored by Git for security.

Paste the following content, replacing the placeholders with your actual keys from Section 3:

```bash
# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

---

## 5. Running the Application

### Development Server
To start the application locally:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
To simulate a production build locally:

```bash
npm run build
npm start
```

---

## 6. Testing

We use **Jest** and **React Testing Library** for unit testing. The testing strategy focuses on separating business logic from UI components to enable robust "JUnit-style" testing.

### Test Structure
*   **Logic Extraction:** Complex logic (filtering, state toggling, marker generation) is extracted from React components into pure TypeScript files (e.g., `lib/map-logic.ts`).
*   **Unit Tests:** Tests are located in the `__tests__/` directory (e.g., `__tests__/map-logic.test.ts`) and verify logic in isolation using mock data.

### Running Tests
To execute the test suite:

```bash
npm run test
```

This command runs Jest, which picks up all files ending in `.test.ts` or `.spec.ts`.

---

## 7. Deployment (Vercel)

The easiest way to deploy this Next.js app is using Vercel. This guide assumes you want to host your own version of the application.

### Step 1: Fork the Repository
If you haven't already, fork this repository to your own GitHub account so you have full access to connect it to Vercel.

### Step 2: Connect to Vercel
1.  Log in to [Vercel](https://vercel.com/).
2.  On your dashboard, click **Add New > Project**.
3.  You will see a list of your GitHub repositories. Find your forked version of `ubcfinds.github.io` and click **Import**.

### Step 3: Configure Project
1.  **Framework Preset:** Vercel should automatically detect this as a **Next.js** project. Leave the build settings as default.
2.  **Environment Variables:** This is the most critical step. Expand the "Environment Variables" section. You must add the keys exactly as they appear in your local `.env.local` file.
    *   **Key:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | **Value:** (Your Google Maps API Key)
    *   **Key:** `NEXT_PUBLIC_SUPABASE_URL`      | **Value:** (Your Supabase Project URL)
    *   **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Value:** (Your Supabase Anon Key)

### Step 4: Deploy
1.  Click **Deploy**.
2.  Vercel will now build your application. This process usually takes 1-2 minutes.
3.  Once complete, you will be presented with a screenshot of your app and a domain (e.g., `https://your-project-name.vercel.app`).

### Step 5: Post-Deployment Configuration
1.  **Update Google Maps Restrictions:** Go back to your Google Cloud Console credentials page. Add your new Vercel domain (e.g., `https://your-project-name.vercel.app/*`) to the allowed HTTP referrers list so the map loads correctly in production.
2.  **Update Supabase URL (Optional):** If you have strict CORS policies in Supabase, ensure your new Vercel domain is added to the allowed origins.

---

## 8. User Guide

Once the application is running, here is how to use it as a consumer:

### 1. Accessing the App
*   **Web:** Open the deployed URL (or `localhost:3000`) in any modern browser.
*   **Mobile:** The app is fully responsive. Open it on your phone for an app-like experience.

### 2. Navigating the Map
*   **Pan:** Click and drag (or swipe) to move around the UBC campus.
*   **Zoom:** Use the `+` / `-` buttons or pinch-to-zoom.
*   **My Location:** Click the "Target" icon (bottom right) to center the map on your current location. *Note: You must allow location permissions in your browser.*

### 3. Finding Utilities
*   **Sidebar:** Use the sidebar on the left to toggle categories (e.g., "Water Stations", "Microwaves").
    *   **Blue Icons:** Working utilities.
    *   **Yellow Icons:** Utilities with reported issues.
*   **Search:** Type in the search bar (top left) to find specific buildings or utility types (e.g., "Nest", "Coffee").
*   **Details:** Click any marker on the map to see details, including location description and status.

### 4. Reporting Issues
If you find a broken utility (e.g., a water fountain not working):
1.  Click the utility marker on the map.
2.  In the details panel, click the **"Report Issue"** button.
3.  Select the issue type (e.g., "Broken/Damaged", "Empty").
4.  (Optional) Add a brief description.
5.  Click **Submit**. The icon will turn yellow to warn other users.

---

## 9. Troubleshooting

*   **Map shows "For Development Purposes Only" or errors:**
    *   Check that the Google Maps API Key is correct in `.env.local`.
    *   Ensure the **Maps JavaScript API** is enabled in Google Cloud Console.
    *   Check if your billing account is linked to the Google Cloud project (required by Google).

*   **Supabase connection errors:**
    *   Verify the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   Check the browser console for CORS errors; ensure your Supabase project allows requests from `localhost:3000`.

*   **"Report Issue" fails to submit:**
    *   Check the Supabase SQL Editor to ensure the `reports` table exists.
    *   Verify that the RLS (Row Level Security) policies allow `INSERT` operations for public/anon users.