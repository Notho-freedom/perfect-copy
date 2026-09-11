# Perfect Copy

![Perfect Copy Screenshot](screenshots/homepage.png)

## Overview
Perfect Copy is an Electron desktop application built with React, Vite, TypeScript, and Supabase. It provides a modern desktop experience with system detection, driver management, and real-time data synchronization.

## Features
- Electron desktop shell with native window controls
- Real-time data synchronization via Supabase
- Driver history tracking and management
- Scan page for data inspection
- System detection and information
- Settings and tools pages
- Auto-update mechanism
- Modern UI with shadcn/ui components

## Technology Stack
- **Electron** - Desktop application framework
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Supabase** - Backend, database, and real-time subscriptions
- **Vitest** - Testing framework

## Project Structure
```
perfect-copy/
├── electron/           # Electron main process
│   ├── main.cjs       # Main entry point
│   ├── preload.cjs    # Preload script
│   └── systemInfo.cjs # System information gathering
├── src/
│   ├── components/    # React components
│   │   ├── ui/       # shadcn/ui components
│   │   ├── BoostPage.tsx
│   │   ├── ChatOverlay.tsx
│   │   ├── DriverHistoryPanel.tsx
│   │   ├── ScanPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ToolsPage.tsx
│   │   └── WhatsNewPage.tsx
│   ├── pages/        # Page components
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities
│   └── integrations/ # Third-party integrations
├── supabase/         # Supabase config and migrations
└── doc/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Electron

### Installation
```bash
git clone <repository-url>
cd perfect-copy
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
npm run build:electron
```

## Screenshots
![Homepage](screenshots/homepage.png)

## License
MIT