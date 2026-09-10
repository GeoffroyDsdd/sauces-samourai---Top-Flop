# SMW Tops & Flops V2

1. Exécuter `supabase/002a_add_scheduled_status.sql` dans Supabase SQL Editor. Attendre Success.
2. Exécuter ensuite `supabase/002b_scheduled_functions.sql`.
3. Remplacer l'ancien projet par ces fichiers, sans remplacer `.env.local`.
4. `npm install`, puis `npm run build`.
5. `git add . && git commit -m "Version 2 SMW" && git push`.

Fonctions ajoutées : calendrier public, matchs préparés, ouverture différée, blocage résultats/justifications durant le vote, popup de confirmation, nouveau design, logo, probabilités en colonnes et historique admin détaillé.
