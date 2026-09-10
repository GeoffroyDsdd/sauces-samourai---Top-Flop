# Correctif SMW V4

1. Exécuter `supabase/004_fix_scheduled_match.sql` dans Supabase SQL Editor.
2. Placer `apply_v4.py` à la racine du projet, au même niveau que `package.json`.
3. Exécuter `python apply_v4.py`.
4. Exécuter `npm run build`.
5. Publier avec Git.

Ce correctif supprime la contrainte erronée qui empêchait le statut `scheduled`, conserve une date sans heure dans l'interface et adapte les libellés Top/Flop.
