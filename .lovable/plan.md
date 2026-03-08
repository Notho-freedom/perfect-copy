

# Amélioration de la vérification de compatibilité pilotes-matériel

## Problèmes identifiés

En analysant le code actuel, plusieurs faiblesses dans la vérification de compatibilité :

1. **Le champ `os_compatibility` n'est jamais utilisé** — la table `driver_catalog` contient un champ `os_compatibility` (tableau de strings), mais l'edge function `get-driver-info` ne filtre jamais dessus. Un pilote macOS pourrait apparaître sur Windows.

2. **Matching de mots-clés trop lâche** — le matching partiel (`dk.includes(kw) || kw.includes(dk)`) génère des faux positifs. Par exemple "intel" match tout pilote Intel même si c'est un pilote réseau et que le mot-clé vient du GPU.

3. **Mots-clés génériques toujours ajoutés** — `getHardwareKeywords()` ajoute systématiquement `"realtek", "usb", "bluetooth", "network", "audio", "hid"` quel que soit le matériel réel, donc des pilotes non pertinents apparaissent.

4. **Pas de filtrage par catégorie matérielle** — si le GPU est NVIDIA, les pilotes AMD Radeon ne devraient pas apparaître, mais rien ne l'empêche actuellement.

## Plan de correction

### 1. Edge function `get-driver-info` — filtrage OS strict

Ajouter un filtre SQL sur `os_compatibility` pour ne retourner que les pilotes compatibles avec l'OS détecté :

```sql
.contains('os_compatibility', [os])
```

### 2. Edge function — scoring amélioré avec catégories

Remplacer le matching naïf par un scoring qui :
- Exclut les pilotes GPU d'un vendor concurrent (si GPU = NVIDIA, exclure les pilotes AMD display)
- Pondère les matches exacts plus fort que les matches partiels
- Utilise les catégories hardware pour filtrer (ex: ne pas montrer des pilotes "Storage controllers" si aucun SSD de ce vendor n'est détecté)

### 3. `getHardwareKeywords()` — keywords contextuels

Modifier `src/lib/systemDetection.ts` pour :
- Ne plus ajouter de mots-clés génériques systématiquement
- Extraire des keywords plus précis du renderer GPU (ex: "RTX 3060", "GeForce")
- Ajouter un champ `category_hints` qui associe chaque keyword à une catégorie matérielle

### 4. Côté client — indicateur de confiance

Afficher dans le détail du pilote si la compatibilité est confirmée (match GPU/vendor exact) ou estimée (match générique).

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `supabase/functions/get-driver-info/index.ts` | Filtrage OS, scoring amélioré, exclusion vendors concurrents |
| `src/lib/systemDetection.ts` | Keywords contextuels, suppression génériques, ajout category hints |
| `src/components/ScanPage.tsx` | Passer l'OS normalisé, afficher indicateur de confiance match |

