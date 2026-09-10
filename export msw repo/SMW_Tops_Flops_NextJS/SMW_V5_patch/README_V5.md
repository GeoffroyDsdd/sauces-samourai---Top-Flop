# Correctif SMW V5

1. Exécuter `supabase/005_smw_v5.sql` dans Supabase SQL Editor.
2. Copier `apply_v5.py` à la racine du projet, au même niveau que `package.json`.
3. Exécuter `python apply_v5.py`.
4. Exécuter `npm run build`.
5. Publier avec Git.

## Règles des nouvelles colonnes

- `# Top/match` compte les matchs clôturés où le joueur a terminé avec le plus de points Top.
- `# Flops/match` compte les matchs clôturés où le joueur a reçu le plus de votes Flop.
- En cas d'égalité à la première place, chaque joueur ex aequo reçoit 1 victoire de match.
- Un match sans aucun point Top n'attribue aucun `# Top/match`.
- Un match sans aucun vote Flop n'attribue aucun `# Flops/match`.
