# Perfect Copy

![Electron](https://img.shields.io/badge/Electron-desktop-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-tests-6E9F18?logo=vitest&logoColor=white)

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
```text
perfect-copy/
├── electron/
│   ├── main.cjs
│   ├── preload.cjs
│   └── systemInfo.cjs
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── integrations/
├── supabase/
└── doc/
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

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