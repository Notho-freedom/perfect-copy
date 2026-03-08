

# Optimisation du scan par filtrage vendor basé sur le matériel détecté

## Concept

Actuellement, l'edge function `get-driver-info` récupère **tous** les pilotes compatibles avec l'OS, puis les score côté serveur. L'idée est de **pré-filtrer par vendors détectés** : si le matériel détecté inclut NVIDIA, Realtek, Intel — on ne requête que les pilotes de ces vendors. Les autres sont exclus dès la requête SQL.

## Changements

### 1. Client — Extraire les vendors détectés (`src/lib/systemDetection.ts`)

Ajouter une fonction `getDetectedVendors(info: SystemInfo): string[]` qui retourne la liste des vendors pertinents extraits du matériel :
- GPU vendor (nvidia, amd, intel)
- Audio vendor (realtek, creative)
- Network vendor (intel, qualcomm, broadcom, realtek, mediatek)
- Storage vendor (samsung, western digital, seagate, crucial, kingston)
- Motherboard vendor (asus, msi, gigabyte, asrock)
- Toujours inclure "microsoft" (pilotes système génériques)

### 2. Client — Passer les vendors au scan (`src/components/ScanPage.tsx`)

Dans `startScan`, appeler `getDetectedVendors()` et envoyer `detected_vendors` dans le body de l'appel à `get-driver-info`.

### 3. Edge function — Filtrer par vendor (`get-driver-info/index.ts`)

- Recevoir `detected_vendors` dans le payload
- Si la liste est non-vide, ajouter un filtre SQL `.in('vendor', detected_vendors)` pour ne récupérer que les pilotes des vendors détectés
- Garder le scoring existant pour affiner parmi les pilotes filtrés
- Supprimer le fallback qui ajoute des pilotes "génériques" quand peu de résultats (plus nécessaire car on cible précisément)

### 4. Utiliser `detectSystemInfoAsync` au lieu de `detectSystemInfo`

Le scan utilise encore `detectSystemInfo()` (synchrone, browser-only). Passer à `detectSystemInfoAsync()` pour bénéficier des données Electron natives plus précises quand disponible.

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/lib/systemDetection.ts` | Nouvelle fonction `getDetectedVendors()` |
| `src/components/ScanPage.tsx` | Passer `detected_vendors` + utiliser `detectSystemInfoAsync` |
| `supabase/functions/get-driver-info/index.ts` | Filtrage SQL `.in('vendor', ...)` + suppression fallback générique |

