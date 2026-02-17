<p align="center">
  <img src="https://github.com/user-attachments/assets/b25e12ac-55a2-4a61-8b27-f4a5ab9f477d" alt="Polaris Logo - Guiding Star" width="200"/>
</p>

# 🌲 UBC Finds
> **"So you don't get left behind."**
> A real-time, community-driven utility tracker for the University of British Columbia.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 📍 Overview
UBC Finds is a web application designed to help students locate essential campus utilities such as microwaves, water fountains, bike racks, and charging stations. Unlike static maps, UBC Finds features a **real-time reporting system**, allowing students to see if a utility is "working," "under maintenance," or "recently reported" by peers.
**Live Site:** [ubcfinds.vercel.app](https://ubcfinds.vercel.app)


With UBC being such a large campus, finding individual utilities that are nearby in a timely manner can be difficult – especially for new students with little to no experience navigating campus. Spending unnecessary amounts of time searching for a bike cage or parking lot can be really frustrating, and even more so between classes. The majority of the available information for utility locations is usually scattered across static maps, outdated websites, or buried within other services. Additionally, no single source provides filtered views of different utility categories, and they do not offer user-generated feedback on the quality or state of those utilities (ie, a bike rack being blocked by construction or a clubroom that has been moved elsewhere). How can a student easily locate working utilities by category without endlessly searching through maps, or digging through pages on outdated websites?

The failure to quickly locate essential utilities, such as water refill stations, accessible washrooms safe bike lock locations, or emergency blue phones, leads to unnecessary wasted time, stress, and frustration for students, staff, and visitors. This friction can negatively impact daily logistics, particularly for users with mobility issues or those facing time constraints between classes. For new students, this difficulty contributes to an initial feeling of disorientation and reduced psychological safety on campus, hindering their ability to feel comfortable and integrated.


---

## ✨ Key Features
* **Interactive Campus Map:** Custom Google Maps integration restricted to UBC Vancouver boundaries with "Greedy" one-finger gesture handling.
* **Real-time Status Tracking:** Backend synchronization via **Supabase** to track utility uptime and crowdsourced user reports.
* **Mobile-Optimized UI:** A premium "Zinc" dark theme featuring a responsive non-modal bottom drawer for seamless map interaction.
* **Coordinate Offset Engine:** Proprietary logic to center markers in the viewport "Safe Zone" based on dynamic zoom levels and device type.
* **Guided Onboarding:** Interactive user tour powered by `react-joyride` to bridge the gap between map navigation and utility reporting.

---

## 🛠️ Tech Stack
* **Framework:** Next.js 16 (App Router & Turbopack)
* **Frontend:** React 19, Tailwind CSS
* **UI Components:** Shadcn/UI (Radix Primitives)
* **Database:** Supabase (PostgreSQL)
* **Maps API:** Google Maps Platform API

---

## 📊 Data Processing Pipeline

UBC Finds includes a robust data processing pipeline for integrating external datasets into the application. This infrastructure was built to safely import and validate TransLink's GTFS (General Transit Feed Specification) data for bus stop locations across campus.

### Data Sources
* **TransLink GTFS Data:** Downloaded from [TransLink's Developer Resources](https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources/gtfs/gtfs-data) (google_transit.zip)
* **Manual Collection:** Water fountains, emergency services, and other utilities manually surveyed across campus

### Processing Infrastructure
The `data-processing/` directory contains scripts and source data organized for repeatable data imports:

```
data-processing/
├── scripts/
│   ├── import-bus-stops.ts        # GTFS parser and UBC boundary filter
│   ├── import-bus-stops-output.ts # Generated output (review before import)
│   └── export-to-csv.ts           # Export utilities to CSV format
└── source-data/
    ├── google_transit/            # TransLink GTFS files
    └── utilities.csv              # Exported utility data
```

### Safety-First Approach
Rather than directly modifying `components/utility-list.ts`, the import scripts generate intermediate output files for manual review. This two-step process:
1. **Generates** validated TypeScript code in `import-bus-stops-output.ts`
2. **Allows review** of the data before integration
3. **Prevents errors** from corrupting the production utility database

This pattern makes the data processing pipeline **repeatable and auditable** for future dataset imports (e.g., updated GTFS feeds, new utility categories).

---
