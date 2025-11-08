<p align="center">
  <img src="https://github.com/user-attachments/assets/b25e12ac-55a2-4a61-8b27-f4a5ab9f477d" alt="Polaris Logo - Guiding Star" width="200"/>
</p>

# Project **UBC Finds** - Team Polaris

### Mission Statement 
*Simplifying navigation for utilities on campus to enhance accessibility and reduce frustration.*

### Team Roles
**Project Manager:** Adam \
**Designer:** Ahnaf \
**Developers:** Anant, Viren, Max

### Problem Statement

With UBC being such a large campus, finding individual utilities that are nearby in a timely manner can be difficult – especially for new students with little to no experience navigating campus. Spending unnecessary amounts of time searching for a bike cage or parking lot can be really frustrating, and even more so between classes. The majority of the available information for utility locations is usually scattered across static maps, outdated websites, or buried within other services. Additionally, no single source provides filtered views of different utility categories, and they do not offer user-generated feedback on the quality or state of those utilities (ie, a bike rack being blocked by construction or a clubroom that has been moved elsewhere). How can a student easily locate working utilities by category without endlessly searching through maps, or digging through pages on outdated websites?

**Consequences** \
The failure to quickly locate essential utilities, such as water refill stations, accessible washrooms safe bike lock locations, or emergency blue phones, leads to unnecessary wasted time, stress, and frustration for students, staff, and visitors. This friction can negatively impact daily logistics, particularly for users with mobility issues or those facing time constraints between classes. For new students, this difficulty contributes to an initial feeling of disorientation and reduced psychological safety on campus, hindering their ability to feel comfortable and integrated.

## Features

- Interactive Google Maps integration showing UBC campus
- Real-time utility location tracking (water fountains, bike storage, washrooms, emergency facilities, food, charging stations)
- Category filtering and search functionality
- User feedback system for reporting broken utilities
- Mobile-responsive design with collapsible sidebar

## Setup

### Google Maps API Key

This app requires a Google Maps API key to display the interactive map.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create credentials (API Key)
5. Add the API key to your environment variables:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Add these to your Vercel project or `.env` file:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Your Google Maps API key (required)

## Tech Stack

- Next.js 16.0.0
- React 18.3.1
- TypeScript
- Tailwind CSS 4.1.9
- shadcn/ui components
- Google Maps JavaScript API

## Libraries & Dependencies

- @react-google-maps/api — React wrapper for the Google Maps JavaScript API
- shadcn/ui — UI component primitives used across the app
- @supabase/supabase-js — Supabase client library