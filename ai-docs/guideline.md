# AI Context Infrastructure Guideline

## Tech Stack & Versions
- **Framework**: React Native (0.81.5) & Expo (~54.0.33)
- **Styling**: NativeWind (^4.2.2) & TailwindCSS (^3.4.19)
- **Navigation**: React Navigation v7
- **Networking**: Axios (^1.13.4)
- **Maps**: React Native MapLibre / Leaflet

## Core Business Flow
Connecting farmers with seasonal workers.
1. **Farmers** post seasonal jobs.
2. **Workers** apply, view job details, complete tasks, and submit daily reports.
3. Track job progress, handle disputes, and display earnings via wallet.

## Strict Conventions
- Max 250 lines per file.
- Always use Action-based naming (e.g., `fetchJobs`, `handleSave`).
- Strict TypeScript typing (no `any`).
- Logic separated into custom hooks or services, keeping screens focused on UI.
