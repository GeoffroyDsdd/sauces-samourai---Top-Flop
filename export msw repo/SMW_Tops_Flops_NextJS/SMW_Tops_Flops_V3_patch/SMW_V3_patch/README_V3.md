# Mise à jour SMW V3

1. Exécuter `supabase/003_smw_v3.sql` dans Supabase SQL Editor.
2. Copier `app` dans le projet actuel avec remplacement.
3. Ajouter le contenu de `app/globals-v3-additions.css` à la fin de `app/globals.css`.
4. Lancer `npm run build`.
5. Puis `git add .`, commit et push.

Remarque : la suppression définitive d'un joueur est possible uniquement s'il n'a aucun ancien vote. Cette protection évite de casser l'historique et les statistiques. Pour un joueur ayant un historique, utiliser Désactiver.
