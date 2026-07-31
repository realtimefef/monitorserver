# NodeVigil

Real-time infrastructure monitoring for DevOps teams, SaaS startups, and platform engineers.

NodeVigil gives you a live view of every server you run. A lightweight agent reports CPU, memory,
disk, and network metrics every five seconds, streams them to your dashboard over WebSocket, and
fires alerts the moment a threshold is crossed.

## Highlights

- **Live metrics** - CPU, memory, disk, and network updated every 5 seconds.
- **Lightweight agent** - a single Bash or PowerShell script, under 5 KB, no daemons or sidecars.
- **Custom alert rules** - per-server thresholds with INFO, WARNING, and CRITICAL severities.
- **Real-time dashboard** - metrics pushed over WebSocket and STOMP, no polling.
- **Secure by design** - JWT authentication, per-user data isolation, scoped agent keys.

## Running locally

```sh
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Building for production

```sh
npm run build
```

The production build is written to the `dist/` folder.

## Tech stack

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS

## Project layout

| Path | Purpose |
| --- | --- |
| `src/pages` | Route-level pages, including the marketing site and dashboard |
| `src/components` | Shared UI components and layout shell |
| `src/contexts` | Authentication and theme providers |
| `backend` | API service |
| `agent` | Metric collection agent scripts |
