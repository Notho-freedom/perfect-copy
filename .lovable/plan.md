

# Afficher les données système réelles et clarifier les estimations

## Problème

En mode navigateur (preview Lovable), `detectCPU()` devine le nom du processeur à partir du nombre de cœurs (`navigator.hardwareConcurrency`), produisant des noms fictifs comme "Intel Core i9 / AMD Ryzen 9". Idem pour d'autres composants. Le panneau affiche ces estimations comme si c'étaient des données réelles.

En mode Electron, les vraies données sont récupérées via `wmic` / `os.cpus()` — le code est déjà en place (`fromElectron()`). Le problème ne concerne que le fallback navigateur.

## Solution

### 1. `src/lib/systemDetection.ts` — Honnêteté des estimations browser

- **CPU** : Ne plus inventer de noms. Afficher `"Processeur ${cores} cœurs (détection limitée)"` au lieu de "Intel Core i9 / AMD Ryzen 9".
- **GPU** : Le WebGL donne déjà le vrai nom — OK, mais ajouter un fallback plus honnête si WebGL échoue.
- **RAM** : `navigator.deviceMemory` est une approximation — le préciser dans le label si source = browser.
- **Motherboard, Disks, Audio** : Déjà masqués en mode browser (conditionnels sur `isElectron`) — OK.

### 2. `src/components/ScanPage.tsx` — Indicateurs visuels de fiabilité

- Ajouter un petit badge à côté des valeurs : **"Natif"** (vert) quand source = electron, **"Estimé"** (orange) quand source = browser.
- Ajouter un message d'info en mode browser : *"Pour des informations système précises, utilisez la version desktop."*

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/lib/systemDetection.ts` | Rendre `detectCPU()` et `detectRAM()` honnêtes — pas de noms fictifs |
| `src/components/ScanPage.tsx` | Badge fiabilité + message info mode browser |

