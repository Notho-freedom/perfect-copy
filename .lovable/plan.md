

# Développement intégral de tous les outils de la page Tools

## Vue d'ensemble

Transformer les 11 cartes statiques en systèmes interactifs complets, chacun avec sa propre vue détaillée, animations de progression, et logique simulée cohérente avec le style Driver Booster.

## Architecture

Chaque outil ouvre une vue dédiée (remplacement du contenu principal) avec un bouton retour. État géré localement dans `ToolsPage.tsx` via un state `activeTool`.

## Les 11 outils

### Hot Fix Tools

**1. Backup & Restore**
- Vue avec 2 onglets : **Backup** et **Restore**
- Backup : liste les pilotes installés (réutilise `outdatedDrivers` + `upToDateDrivers`), bouton "Backup All", barre de progression animée, confirmation avec chemin fictif
- Restore : liste des backups précédents (simulés avec dates), bouton restaurer par item

**2. Fix No Sound**
- Scan automatique au lancement (3 étapes animées) : vérification service audio, vérification pilotes audio, test de sortie
- Affiche résultats avec icônes vert/orange/rouge
- Bouton "Fix Issues" qui simule la réparation avec progression

**3. Fix Device Error (PRO)**
- Badge PRO, scan des périphériques avec erreurs
- Liste les erreurs détectées (codes d'erreur Windows simulés : Code 10, Code 28, Code 43)
- Bouton "Fix All" grisé avec overlay PRO demandant l'upgrade

### Side Actions

**4. Clean Invalid Device Data**
- Scan animé détectant les entrées de registre orphelines
- Liste avec checkboxes des devices invalides (59 items simulés groupés par catégorie)
- Bouton "Clean Selected" avec barre de progression et compteur

**5. Fix Network Failure**
- Diagnostic réseau en 5 étapes : DNS, passerelle, adaptateur, TCP/IP, Winsock
- Résultats avec statut par étape
- Bouton "Repair" pour les items en échec

**6. Fix Bad Resolution**
- Détecte la résolution actuelle (via `screen.width/height` réel)
- Affiche la résolution recommandée
- Liste les résolutions disponibles, bouton "Apply" (simulé)

### Other Useful Tools

**7. Fix Incompatible Drivers**
- Scan des pilotes incompatibles (cross-reference avec OS version)
- Liste résultats avec badges de compatibilité
- Bouton "Fix" par pilote

**8. Offline Driver Updater**
- 2 modes : **Export** (créer un pack de pilotes) et **Import** (charger un pack)
- Export : sélection de pilotes, simulation de packaging avec progression
- Import : zone de drop fictive, simulation d'installation

**9. System Information**
- Vue complète reprenant les données de `detectSystemInfoAsync()`
- Onglets : OS, CPU, GPU, RAM, Stockage, Réseau, Audio, Carte mère
- Bouton "Export to TXT" simulé
- Réutilise les badges de fiabilité (Natif/Estimé) existants

**10. Free & Fast VPN**
- Page promotionnelle avec illustration
- Bouton "Install iTop VPN" (lien externe simulé)
- Features highlights : vitesse, sécurité, serveurs

**11. Screen Recorder**
- Page promotionnelle avec preview
- Bouton "Install iTop Screen Recorder"
- Features : enregistrement, webcam, édition

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/components/ToolsPage.tsx` | Refonte complète : state machine `activeTool`, rendu conditionnel des 11 sous-vues, composants internes pour chaque outil |

## Patterns techniques

- Chaque outil suit le pattern : Header avec bouton retour → Contenu avec scan/progression animé → Résultats → Action
- Animations via `setInterval` pour les barres de progression (même pattern que le scan existant dans `ScanPage`)
- Données simulées réalistes (noms de périphériques Windows réels, codes d'erreur, chemins de fichiers)
- Style cohérent avec le reste de l'app (même palette `hsl(220...)`, mêmes classes `hover-lift`, `hover-glow`)

