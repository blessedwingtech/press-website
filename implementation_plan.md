# Plan d'implémentation - Système de Notation Fluide, Vues, Partage, Flux 24h et Audit Admin

Ce plan intègre les fonctionnalités d'évaluation ultra-fluide (style like TikTok), le compteur de vues des articles, la restriction du flux principal aux 24 dernières heures avec tri par popularité cumulée du média/journaliste, et le journal d'audit administratif.

---

## User Review Required

> [!IMPORTANT]
> **Modifications de la Base de Données (Prisma) :**
> Nous devons modifier le schéma Prisma pour ajouter :
> 1. `Article.views` (Int, valeur par défaut 0) : Compteur de vues individuel propre à chaque publication.
> 2. `Rating` (Modèle) : Pour enregistrer les évaluations 0-5 de façon unique par article et session (prévention de la fraude). Les étoiles cumulées sur l'ensemble des articles d'un auteur définissent la réputation/le score global du compte du journal (journaliste).
> 3. `AuditLog` (Modèle) : Pour le panneau d'audit réservé à l'administrateur.
> 
> Une migration Prisma (`npx prisma migrate dev`) sera exécutée.

---

## Proposed Changes

### 1. Schéma de Données (Prisma)

#### [MODIFY] [schema.prisma](file:///c:/Users/bless/Downloads/ben_pro/news-platform-1/prisma/schema.prisma)
- Ajouter `views Int @default(0)` sur le modèle `Article`.
- Ajouter le modèle `Rating` :
  ```prisma
  model Rating {
    id                String   @id @default(uuid())
    articleId         String
    article           Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
    stars             Int      // Note de 0 à 5
    sessionIdentifier String   // Cookie UUID ou IP hashé pour la prévention des doublons
    createdAt         DateTime @default(now())

    @@unique([articleId, sessionIdentifier])
    @@index([articleId])
  }
  ```
- Ajouter le modèle `AuditLog` :
  ```prisma
  model AuditLog {
    id        String   @id @default(uuid())
    action    String   // Ex: "RATING_ADD", "ARTICLE_VIEW", "USER_CREATE", "ARTICLE_SHARE"
    details   String
    userId    String?
    ipAddress String?
    createdAt DateTime @default(now())
  }
  ```

---

### 2. Flux 24h et Tri par Réputation de l'Auteur (Algorithme "À LA UNE")

#### [MODIFY] [page.tsx (homepage)](file:///c:/Users/bless/Downloads/ben_pro/news-platform-1/src/app/page.tsx)
- Implémenter l'algorithme de tri suivant pour le flux de la page d'accueil :
  1. Chercher les articles publiés au cours des **dernières 24 heures**.
  2. Calculer pour chaque article la réputation globale de son auteur (la moyenne/somme des étoiles reçues sur toutes ses publications).
  3. Ordonner les articles par : `réputation de l'auteur DESC`, puis `views individuelles de l'article DESC`, puis `datePublication DESC`.
  4. **Fallback** : Si aucun article n'a été publié dans les dernières 24h, chercher les articles globaux et les trier par `réputation de l'auteur DESC`, puis `datePublication DESC`.
  5. Si la base est totalement vide, afficher le message d'information.
- Afficher les étoiles globales du journaliste/journal à côté de son nom sur chaque carte d'article, tandis que les vues restent propres à l'article.

---

### 3. Système d'Évaluation Ultra-Fluide (Style "TikTok Like") & Vues

#### [NEW] [RatingSystem.tsx](file:///c:/Users/bless/Downloads/ben_pro/news-platform-1/src/components/RatingSystem.tsx)
- Un composant de notation ultra-rapide et fluide. L'utilisateur clique directement sur le nombre d'étoiles souhaité, déclenchant une transition instantanée (Optimistic UI) et un effet visuel discret (micro-animation).
- Ce vote contribue à la réputation globale du journaliste (le compte du journal).
- Utilise des cookies côté client pour retenir le vote et empêcher visuellement de voter plusieurs fois, combiné à la contrainte d'unicité côté serveur.

#### [MODIFY] Page d'Article complet [page.tsx (article detail)](file:///c:/Users/bless/Downloads/ben_pro/news-platform-1/src/app/articles/[slug]/page.tsx)
- Incrémenter le compteur de vues `views` de l'article en base de données à chaque visite unique (suivi par session pour éviter le spam de rafraîchissement) et journaliser la vue dans `AuditLog`.
- Afficher la note globale de l'auteur (la réputation de son journal) et son nombre total d'étoiles accumulées.
- Intégrer le `<RatingSystem />` directement sous le titre de l'article ou à côté de l'illustration principale.
- Ajouter le bouton de partage **PressTonik** hautement mis en valeur avec sa miniature de média.

---

### 4. Panneau d'Audit Admin

#### [NEW] Page d'Audit [page.tsx (admin/audit)](file:///c:/Users/bless/Downloads/ben_pro/news-platform-1/src/app/admin/audit/page.tsx)
- Liste sous forme de table triable les journaux d'audit (Actions administratives + Activités clés comme les votes, vues uniques et partages).
- Seul l'administrateur y a accès.

---

## Verification Plan

### Automated & Manual Verification
1. **Migration Prisma** : Lancer la migration de la base de données.
2. **Vues** : Ouvrir un article, recharger la page, et vérifier que la vue n'augmente qu'une seule fois grâce à l'identifiant de session (cookie).
3. **Évaluation & Réputation** : Noter un article d'un journaliste, vérifier que le score moyen de l'auteur (sur d'autres articles également) augmente instantanément, et que l'action est consignée dans l'audit.
4. **Audit** : Vérifier la table d'audit dans la section Admin.
