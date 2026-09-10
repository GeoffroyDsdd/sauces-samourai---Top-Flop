from pathlib import Path


def replace_required(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Motif introuvable pour {label}. Aucun fichier n'a ete modifie pour cette etape.")
    return text.replace(old, new)

# Public justifications: TOP1 -> TOP 1, etc.
p = Path("app/justifications/page.tsx")
s = p.read_text(encoding="utf-8")
s = replace_required(
    s,
    '{x.kind.toUpperCase()} · {x.player_name}',
    '{x.kind === "top1" ? "TOP 1" : x.kind === "top2" ? "TOP 2" : x.kind === "top3" ? "TOP 3" : "FLOP"} · {x.player_name}',
    "libelles des justifications publiques",
)
p.write_text(s, encoding="utf-8")

# Results: bold points; Flops show points first, then number of Flops.
p = Path("app/resultats/page.tsx")
s = p.read_text(encoding="utf-8")
ns_old = '<small className="muted">{x.top_points} pts · #T1 {x.top1_count} · #T2 {x.top2_count} · #T3 {x.top3_count}</small>'
s = replace_required(
    s,
    ns_old,
    '<small className="muted"><strong>{x.top_points} pts</strong> · #T1 {x.top1_count} · #T2 {x.top2_count} · #T3 {x.top3_count}</small>',
    "points Top en gras",
)
s = replace_required(
    s,
    '<small className="muted"># Flops {x.flop_count} · {x.flop_points} pts</small>',
    '<small className="muted"><strong>{x.flop_points} pts</strong> · # Flops {x.flop_count}</small>',
    "ordre et gras des points Flop",
)
p.write_text(s, encoding="utf-8")

# Admin: winner-per-match columns and readable historical justification labels.
p = Path("app/admin/page.tsx")
s = p.read_text(encoding="utf-8")
s = replace_required(
    s,
    '<th># Top</th><th># Flops</th><th>Flop pts</th>',
    '<th># Top/match</th><th># Flops/match</th><th>Flop pts</th>',
    "titres admin",
)
s = replace_required(
    s,
    '<td>{x.times_top}</td><td>{x.flop_count}</td><td>{x.flop_points}</td>',
    '<td>{x.top_match_wins}</td><td>{x.flop_match_wins}</td><td>{x.flop_points}</td>',
    "valeurs admin",
)
s = replace_required(
    s,
    '{x.kind.toUpperCase()} · {x.player_name}',
    '{x.kind === "top1" ? "TOP 1" : x.kind === "top2" ? "TOP 2" : x.kind === "top3" ? "TOP 3" : "FLOP"} · {x.player_name}',
    "libelles de l'historique admin",
)
p.write_text(s, encoding="utf-8")

print("SMW V5 applique avec succes.")
