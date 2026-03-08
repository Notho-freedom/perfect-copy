

# Plan : Connecter l'app à des sources de données réelles

## Contexte

L'app utilise actuellement des données hardcodées dans `src/data/drivers.ts`. On va enrichir l'expérience avec trois types de sources réelles.

---

## 1. Détection système réelle via APIs navigateur

Utiliser les APIs du navigateur pour détecter le vrai hardware du visiteur :

- **`navigator.userAgent`** → OS, version, architecture
- **`navigator.hardwareConcurrency`** → nombre de cœurs CPU
- **`navigator.deviceMemory`** → RAM disponible
- **WebGL (`getParameter`)** → nom exact du GPU (vendor + renderer)
- **`screen.width/height`** → résolution écran
- **`navigator.connection`** → type de connexion réseau
- **`navigator.platform`** → plateforme

Créer un module `src/lib/systemDetection.ts` qui expose une fonction `detectSystemInfo()` retournant ces infos. Le widget "PC Info" dans ScanPage affichera les vraies données au lieu de valeurs statiques.

## 2. Base de données Supabase

Activer Lovable Cloud et créer les tables suivantes :

- **`driver_catalog`** — catalogue de ~200 drivers réalistes avec versions actuelles/disponibles, catégories, compatibilité OS
- **`scan_history`** — historique des scans (date, résultats, drivers trouvés)
- **`driver_updates`** — log des mises à jour effectuées (remplace le hardcodé de DriverHistoryPage)
- **`user_settings`** — préférences utilisateur persistantes

Le scan piochera dans `driver_catalog` et croisera avec les infos système détectées pour générer des résultats contextualisés (ex: si GPU NVIDIA détecté → afficher drivers NVIDIA).

## 3. API de drivers enrichie via Edge Function

Créer une edge function `get-driver-info` qui :
- Reçoit les infos hardware détectées côté client
- Interroge la table `driver_catalog` en filtrant par hardware compatible
- Retourne une liste de drivers pertinents avec statut (à jour / obsolète)

Optionnellement, utiliser **Firecrawl** (connector disponible) pour scraper périodiquement des pages de catalogues de drivers (ex: pages de téléchargement NVIDIA, Intel, Realtek) et alimenter la base.

## Modifications par fichier

| Fichier | Action |
|---|---|
| `src/lib/systemDetection.ts` | **Créer** — module de détection hardware navigateur |
| `src/data/drivers.ts` | **Modifier** — ajouter fallback + types enrichis |
| `src/components/ScanPage.tsx` | **Modifier** — utiliser détection réelle + appel Supabase |
| `src/components/DriverHistoryPage.tsx` | **Modifier** — lire depuis `scan_history` |
| `src/components/SettingsPage.tsx` | **Modifier** — persister dans `user_settings` |
| `supabase/functions/get-driver-info/index.ts` | **Créer** — edge function catalogue drivers |
| Tables Supabase | **Créer** — `driver_catalog`, `scan_history`, `driver_updates`, `user_settings` |
| Seed data | **Créer** — insérer ~200 drivers réalistes dans `driver_catalog` |

## Prérequis

- Activer **Lovable Cloud** (pour Supabase + Edge Functions)
- Optionnel : connecter **Firecrawl** pour enrichir le catalogue automatiquement

