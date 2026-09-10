from pathlib import Path


def required(path, old, new, label):
    p = Path(path)
    s = p.read_text(encoding="utf-8")
    if old not in s:
        raise SystemExit(f"Motif introuvable: {label} dans {path}")
    p.write_text(s.replace(old, new), encoding="utf-8")

# Public page: add safe deletion for scheduled matches.
required(
    "app/page.tsx",
    'async function reopen(id:string){if(!confirm("Rouvrir ce match clôturé ? Les résultats seront de nouveau masqués jusqu\'à la prochaine clôture."))return;const{error}=await supabase.rpc("reopen_match",{p_match_id:id});setMsg(error?.message||"Match rouvert.");load()}',
    'async function reopen(id:string){if(!confirm("Rouvrir ce match clôturé ? Les résultats seront de nouveau masqués jusqu\'à la prochaine clôture."))return;const{error}=await supabase.rpc("reopen_match",{p_match_id:id});setMsg(error?.message||"Match rouvert.");load()}\n async function removeScheduled(id:string,label:string){if(!confirm(`Supprimer définitivement le match « ${label||"Sans nom"} » du calendrier ?`))return;const{error}=await supabase.rpc("delete_scheduled_match",{p_match_id:id});setMsg(error?.message||"Match supprimé.");load()}',
    "fonction de suppression publique",
)
required(
    "app/page.tsx",
    '{m.status==="scheduled"&&!openMatch&&<button className="btn" onClick={()=>open(m.id)}>Ouvrir les votes</button>}',
    '{m.status==="scheduled"&&!openMatch&&<button className="btn" onClick={()=>open(m.id)}>Ouvrir les votes</button>}{m.status==="scheduled"&&<button className="btn danger" onClick={()=>removeScheduled(m.id,m.label)}>Supprimer</button>}',
    "bouton public Supprimer",
)

# Admin API: deletion of one match and reset of all history.
api = Path("app/api/admin/matches/route.ts")
api.parent.mkdir(parents=True, exist_ok=True)
api.write_text('''import{NextResponse}from"next/server";import{cookies}from"next/headers";import{validSession}from"@/lib/auth";import{adminDb}from"@/lib/supabase";
async function auth(){return validSession((await cookies()).get("smw_admin")?.value)}
export async function DELETE(r:Request){
 if(!await auth())return NextResponse.json({error:"Non autorisé"},{status:401});
 const id=new URL(r.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Identifiant manquant"},{status:400});
 const{error}=await adminDb().from("matches").delete().eq("id",id);
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}
''', encoding="utf-8")

reset = Path("app/api/admin/reset-season/route.ts")
reset.parent.mkdir(parents=True, exist_ok=True)
reset.write_text('''import{NextResponse}from"next/server";import{cookies}from"next/headers";import{validSession}from"@/lib/auth";import{adminDb}from"@/lib/supabase";
export async function DELETE(){
 if(!await validSession((await cookies()).get("smw_admin")?.value))return NextResponse.json({error:"Non autorisé"},{status:401});
 const{error}=await adminDb().from("matches").delete().not("id","is",null);
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}
''', encoding="utf-8")

# Admin UI: delete one match and reset season.
required(
    "app/admin/page.tsx",
    'async function history(id:string){const r=await fetch(`/api/admin/matches/${id}`);if(r.ok)setDetail(await r.json())}',
    'async function history(id:string){const r=await fetch(`/api/admin/matches/${id}`);if(r.ok)setDetail(await r.json())}\n async function deleteMatch(id:string,label:string){if(!confirm(`Effacer définitivement « ${label} » ainsi que tous ses votes et justifications ?`))return;const r=await fetch(`/api/admin/matches?id=${encodeURIComponent(id)}`,{method:"DELETE"});const j=await r.json();if(!r.ok)return alert(j.error||"Suppression impossible");setDetail(null);load()}\n async function resetSeason(){const phrase=prompt("Pour effacer tous les matchs, votes, justifications et statistiques, tapez exactement : EFFACER SMW");if(phrase!=="EFFACER SMW")return alert("Réinitialisation annulée.");if(!confirm("Dernière confirmation : tout l’historique sera définitivement effacé. Continuer ?"))return;const r=await fetch("/api/admin/reset-season",{method:"DELETE"});const j=await r.json();if(!r.ok)return alert(j.error||"Réinitialisation impossible");setDetail(null);load()}',
    "fonctions de suppression admin",
)
required(
    "app/admin/page.tsx",
    '<button className="historyBtn" onClick={()=>history(x.id)}>{x.label}</button> · {new Date(x.played_at).toLocaleDateString("fr-BE")} · {x.ballot_count} bulletin(s) · {x.status}</p>)}</div>',
    '<button className="historyBtn" onClick={()=>history(x.id)}>{x.label}</button> · {new Date(x.played_at).toLocaleDateString("fr-BE")} · {x.ballot_count} bulletin(s) · {x.status} <button className="btn danger" onClick={()=>deleteMatch(x.id,x.label)}>Effacer définitivement</button></p>)}<div className="card" style={{borderColor:"#d84b62"}}><h4>Zone dangereuse</h4><p className="muted">Conserve les joueurs, mais supprime tous les matchs, votes, justifications et statistiques.</p><button className="btn danger" onClick={resetSeason}>Réinitialiser toute la saison</button></div></div>',
    "boutons de suppression admin",
)

print("SMW V6 applique avec succes.")
