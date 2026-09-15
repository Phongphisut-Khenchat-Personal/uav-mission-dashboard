# UAV Mission Dashboard

A mock front-end dashboard for reviewing UAV missions. It lists 40 sample flights, shows mission detail with waypoints and battery history, simulates live telemetry for in-progress flights, and provides create/edit forms. Data comes from a delayed mock API and is not stored on a server.

## Features

- Mission list with search, filters, sorting, and pagination
- Mission details and waypoints
- Battery chart
- Simulated real-time telemetry
- Create and edit mission forms
- Responsive design

## Screenshots

### Mission list

Search, status filters, sortable flight date, and pagination.

<img width="1278" height="719" alt="Mission list" src="https://github.com/user-attachments/assets/228569af-25fe-4cfe-8e2c-398e17b540e5" />

### Mission details

Notes, battery chart, and waypoints.

<img width="1280" height="719" alt="Mission details" src="https://github.com/user-attachments/assets/5adfbd7f-5b24-4974-b6d0-2c5a0b09ba29" />

### Create and edit form

Shared form with validation, notes counter, and dynamic waypoints.

<img width="1265" height="719" alt="Create and edit mission form" src="https://github.com/user-attachments/assets/ad0f831f-fd3e-48c1-a005-ea99e660ae5f" />

### Responsive layout

On small screens the list switches from a table to cards.

<img width="271" height="577" alt="Responsive mission list on a small screen" src="https://github.com/user-attachments/assets/ab8cdb0d-1c46-4e08-9871-9d40b50e1e7e" />

## Requirements

- Node.js 20.9 or later
- npm

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run dev`
4. Open [http://localhost:3000/missions](http://localhost:3000/missions)

## Available Scripts

- `npm run dev` — start the Next.js development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — serve the production build

## Mock API

Routes live under `src/app/api/missions` and read from `src/data/missions.ts`. There is no database.

**`GET /api/missions`**

- Waits 500 ms, then returns `{ data, total }` for all 40 missions.
- Add `?error=true` to simulate a failure: HTTP 500 with `{ message: "Unable to load missions" }`.

**`GET /api/missions/[id]`**

- Waits 500 ms, then returns `{ data }` for that mission.
- Unknown ids return HTTP 404 with `{ message: "Mission not found" }`.

The list page uses the collection endpoint. Detail and edit pages use the `[id]` endpoint. Search, status filters, sort, and pagination run in the browser after the full list is loaded.

## Known Limitations

Create and edit are front-end only. Save validates the form, waits 700 ms, and shows a success message. New or changed missions are not written to the mock data, so a refresh returns the original 40 missions.

Live telemetry exists only on in-progress missions. It updates in the browser every 1.5 seconds and is discarded when you leave the detail page.
