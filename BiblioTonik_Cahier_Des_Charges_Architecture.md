# 📚 BiblioTonik — Cahier des Charges & Architecture Système

> **Plateforme de Numérisation, Préservation et Dépôt Académique Numérique**  
> *Écosystème Blessed Wing Technology (BWT) & Passerelle PressTonik*  
> **Version :** 1.0.0 — Document de Référence et d'Architecture

---

## 1. Vision et Objectifs Stratégiques

### 1.1 Contexte et Vocation
**BiblioTonik** est conçu pour être le **dépôt numérique de référence, souverain et accessible** pour le patrimoine intellectuel, universitaire et historique, en premier lieu pour Haïti, la Caraïbe et sa diaspora, mais ouvert au monde académique international.

Il résout trois défis historiques :
1. **La perte irrémédiable d'archives papier** (dégradation physique, intempéries, sinistres).
2. **L'invisibilité des travaux universitaires** (mémoires de licence, thèses de master/doctorat stockés sur papier dans des placards d'universités et inaccessibles aux nouveaux étudiants).
3. **L'absence d'une source documentaire vérifiée et citable** pour les chercheurs, journalistes et étudiants.

### 1.2 Piliers Fondamentaux
- **Fiabilité & Déontologie :** Modération et validation des écrits par un comité académique/éditorial.
- **Accessibilité Universelle :** Numérisation simplifiée par smartphone pour les étudiants et chercheurs disposant de peu de matériel.
- **Efficience du Stockage :** Pipeline automatique de compression extrême des PDF et images (WebP / Ghostscript / PDF-lib / OCR) pour limiter l'empreinte disque et accélérer la consultation sur connexions mobiles lentes.
- **Synergie BWT :** Compte unique (SSO) interconnecté avec **PressTonik** (presse d'investigation), BitTonik, ShopTonik et MemoTonik.

---

## 2. Typologie des Documents et Catalogage

| Catégorie | Description & Public Cible | Format de Dépôt |
| :--- | :--- | :--- |
| **Thèses & Mémoires** | Travaux de fin d'études universitaires (Licence, Master, Doctorat, Spécialisations médicales/juridiques). | PDF textuel original ou scans reliés. |
| **Essais & Livres d'Auteurs** | Livres complets, extraits autorisés, monographies, traités scientifiques, poésie et littérature. | PDF / ePub. |
| **Archives Historiques & Patrimoine** | Décrets anciens, journaux d'époque, manuscrits rares, traités bilatéraux, cartes géographiques. | Scans haute fidélité (Smartphone / Scanner à plat). |
| **Rapports & Études d'Experts** | Rapports de recherche, publications d'ONG, analyses économiques, diagnostics sectoriels. | PDF avec tableaux et métadonnées. |
| **Revues Scientifiques & Articles de Recherche** | Papiers de recherche évalués, communications académiques. | PDF avec abstract bilingue. |

---

## 3. Parcours et Fonctionnalités Clés

### 3.1 Module de Numérisation Intelligente (Mobile & Desktop)
1. **Numérisation Smartphone (Caméra native via WebRTC / File API) :**
   - L'auteur peut photographier page par page son document papier depuis son smartphone.
   - **Détection des contours et redressement automatique (Perspective Crop)** : rognage des marges inutiles pour un document net.
   - **Filtres d'optimisation documentaire** : conversion en niveaux de gris ou noir & blanc haute lisibilité pour éliminer les ombres de prise de vue.
2. **Import de Fichiers Existants :**
   - Téléversement direct de documents PDF natifs ou d'archives scannées.

### 3.2 Pipeline de Compression et Optimisation des Fichiers (Clé de Voûte)
Pour éviter de saturer l'infrastructure et permettre un affichage fluide sur mobile en 3G/4G :
- **Compression PDF dynamique à 3 niveaux :**
  - *Mode Archive (Haute Qualité - 300 DPI)* : pour manuscrits rares et œuvres illustrées.
  - *Mode Équilibre (Qualité Universitaire - 150 DPI)* : pour livres et thèses standard (réduction de 60 à 80% du poids initial).
  - *Mode Éco / Mobile (Lecture Rapide - 72 à 96 DPI)* : génération d'une version allégée pour streaming instantané.
- **Génération automatique de couvertures** : extraction de la première page convertie en WebP haute définition (formats miniature et aperçu).
- **Extraction OCR (Reconnaissance Optique de Caractères)** : indexation du texte contenu dans les images pour rendre le document scanné entièrement interrogeable par le moteur de recherche.

### 3.3 Moteur de Recherche et Découverte
- Recherche plein texte dans le titre, le résumé, la bibliographie, et le contenu OCR.
- Filtres multicritères :
  - Par discipline (Droit, Économie, Sciences Médicales, Histoire, Littérature, Agronomie, Technologies).
  - Par institution académique (ex. UEH, Quisqueya, Écoles Normales, Universités internationales).
  - Par niveau d'études (Licence, Master, Doctorat, Archive).
  - Par langue (Kreyòl, Français, Anglais, Espagnol).
  - Par type d'accès (Libre accès Open Access / Accès Réservé / VIP).

### 3.4 Visionneuse de Documents Interactive (Lecteur Universitaire)
- Lecteur PDF intégré fluide, sans téléchargement obligatoire.
- Mode plein écran et mode nuit/sépia pour confort de lecture prolongée.
- **Outil de Citation Automatique** : génération instantanée de la référence aux normes académiques (APA, MLA, Chicago, Harvard, ISO 690) avec bouton "Copier la citation".
- Téléchargement du fichier complet (selon autorisations accordées par l'auteur).

### 3.5 Espace Auteur & Dépôt Sécurisé
- Tableau de bord dédié pour l'intellectuel ou l'étudiant.
- Formulaire de soumission avec validation des droits (déclaration sur l'honneur d'originalité).
- Suivi du statut de la soumission : `En révision`, `Accepté`, `Modifications demandées`, `Publié`.
- Statistiques de consultation : nombre de vues, nombre de lectures complètes, nombre de citations générées.

### 3.6 Modération & Conseil Scientifique
- Interface d'administration pour les modérateurs et réviseurs académiques.
- Vérification anti-plagiat et validation de l'authenticité des métadonnées avant publication officielle.

---

## 4. Passerelle Intelligente avec PressTonik

1. **Compte & Session Unifiés (NextAuth SSO)** :
   - Tout utilisateur connecté sur PressTonik est immédiatement reconnu sur BiblioTonik via un cookie racine commun (`.bittonik.com`).
2. **Sélecteur d'Écosystème BWT** :
   - Dans la barre de navigation supérieure de PressTonik et de BiblioTonik, présence d'un bouton menu d'applications permettant de basculer en 1 clic entre Presse et Bibliothèque.
3. **Widget d'Ancrage Réciproque :**
   - Sur PressTonik : lors de la lecture d'un article d'investigation ou d'actualité, encart contextuel *« 📖 Documents de référence sur ce sujet dans BiblioTonik »*.
   - Sur BiblioTonik : sur la fiche d'un document, encart *« 📰 Enquêtes et actualités associées sur PressTonik »*.

---

## 5. Architecture Technique Recommandée

```
                     [ Utilisateurs & Chercheurs ]
                                   │
                                   ▼
                       [ Reverse Proxy Nginx ]
                        (SSL, Caching, Routing)
                       ┌───────────┴───────────┐
                       ▼                       ▼
            [ press.bittonik.com ]   [ biblio.bittonik.com ]
                (PressTonik)              (BiblioTonik)
                 Next.js App               Next.js App
                       │                       │
                       └───────────┬───────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     [ PostgreSQL DB ]   [ Cloudflare R2 ]     [ Worker / Queues ]
    (Users partagés,     (Stockage PDF,      (Compression Ghostscript,
     Métadonnées Biblio)  Covers WebP)        OCR Tesseract, Thumbnails)
```

- **Framework :** Next.js 14+ (App Router, Server Actions, SSR pour le SEO académique).
- **Base de données :** PostgreSQL avec Prisma ORM (partage de la table `User` et schéma dédié pour `Document`, `Institution`, `Subject`, `Citation`).
- **Stockage Objets :** Cloudflare R2 (zéro frais d'egress pour les téléchargements de gros PDF).
- **Traitement PDF & Compression :** `pdf-lib` + `ghostscript` / `sharp` pour le redimensionnement et l'optimisation des images scannées.
- **Visionneuse :** PDF.js customisée ou React-PDF avec virtualisation pour charger 500 pages sans ralentir le navigateur.
