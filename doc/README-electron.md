# Electron Setup — Driver Booster Clone

## Installation locale

```bash
# 1. Installer les dépendances web
npm install

# 2. Installer les dépendances Electron
npm install --save-dev electron electron-builder concurrently wait-on cross-env

# 3. Lancer en mode développement
npm run electron:dev

# 4. Builder l'app (exécutable)
npm run electron:build
```

## Configuration electron-builder (optionnelle)

Ajouter dans `package.json` :

```json
{
  "build": {
    "appId": "com.driverbooster.clone",
    "productName": "Driver Booster 13.1",
    "directories": { "output": "electron-dist" },
    "files": ["dist/**/*", "electron/**/*"],
    "win": {
      "target": "nsis",
      "icon": "public/favicon.ico"
    }
  }
}
```

## Architecture

- `electron/main.js` — Processus principal, crée la fenêtre frameless
- `electron/preload.js` — Bridge sécurisé vers le renderer (minimize/maximize/close)
- `electron/windowControls.js` — Handlers IPC pour les contrôles de fenêtre
- `src/types/electron.d.ts` — Types TypeScript pour `window.electronAPI`

## Notes

- La title bar est draggable (`-webkit-app-region: drag`)
- Les boutons min/max/close utilisent IPC via `window.electronAPI`
- En web, les boutons ne font rien (graceful fallback)
