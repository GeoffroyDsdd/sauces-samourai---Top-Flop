"use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
type P={id:string,name:string};
type M={id:string,label:string,played_at:string,status:string,ballot_count:number};
export default function Home(){
 const[players,setPlayers]=useState<P[]>([]),[matches,setMatches]=useState<M[]>([]),[openMatch,setOpen]=useState<M|null>(null),[msg,setMsg]=useState(""),[sent,setSent]=useState(false),[f,setF]=useState<any>({}),[label,setLabel]=useState(""),[date,setDate]=useState("");
 async function load(){const[{data:p},{data:m}]=await Promise.all([supabase.rpc("get_active_players"),supabase.rpc("get_public_matches")]);setPlayers(p||[]);setMatches(m||[]);setOpen((m||[]).find((x:M)=>x.status==="open")||null)}
 useEffect(()=>{load()},[]);
 async function prepare(){
  if(!date){setMsg("Choisissez une date.");return;}
  const{error}=await supabase.rpc("create_scheduled_match",{p_label:label,p_played_at:date});
  setMsg(error?.message||"Match ajouté à la liste.");
  if(!error){setLabel("");setDate("");load()}
 }
 async function open(id:string){if(!confirm("Ouvrir les votes pour ce match ?"))return;const{error}=await supabase.rpc("open_scheduled_match",{p_match_id:id});setMsg(error?.message||"Votes ouverts.");load()}
 async function reopen(id:string){if(!confirm("Rouvrir ce match clôturé ? Les résultats seront de nouveau masqués jusqu'à la prochaine clôture."))return;const{error}=await supabase.rpc("reopen_match",{p_match_id:id});setMsg(error?.message||"Match rouvert.");load()}
 async function removeScheduled(id:string,label:string){if(!confirm(`Supprimer définitivement le match « ${label||"Sans nom"} » du calendrier ?`))return;const{error}=await supabase.rpc("delete_scheduled_match",{p_match_id:id});setMsg(error?.message||"Match supprimé.");load()}
 async function close(){if(!confirm("Clôturer les votes ? Les justifications et résultats deviendront visibles."))return;const{error}=await supabase.rpc("close_current_match");setMsg(error?.message||"Votes clôturés.");load()}
 async function vote(e:React.FormEvent){e.preventDefault();if(!openMatch)return;let token=localStorage.getItem("Sauces Samourai-voter-token");if(!token){token=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem("Sauces Samourai-voter-token",token)}const{error}=await supabase.rpc("submit_ballot",{p_match_id:openMatch.id,p_voter_token:token,p_top1:f.top1,p_top1_comment:f.c1,p_top2:f.top2,p_top2_comment:f.c2,p_top3:f.top3,p_top3_comment:f.c3,p_flop:f.flop,p_flop_comment:f.cf});if(error)setMsg(error.message);else{setSent(true);setF({});load()}}
 const choice=(k:string)=><select required value={f[k]||""} onChange={e=>setF({...f,[k]:e.target.value})}><option value="">Choisir un joueur</option>{players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>;
 return <>
  <section className="card hero"><h2>Calendrier des matchs</h2><p className="muted">Préparez librement les matchs. Ouvrez les votes à la fin du match, puis clôturez-les quand tout le monde a voté.</p>{matches.length===0&&<p>Aucun match préparé.</p>}{matches.map(m=><div className="matchRow" key={m.id}><div><b>{m.label||"Match sans nom"}</b><div className="muted">{new Date(m.played_at).toLocaleDateString("fr-BE")} · {m.status==="scheduled"?"À venir":m.status==="open"?"Votes ouverts":"Clôturé"} · {m.ballot_count} vote(s)</div></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{m.status==="scheduled"&&!openMatch&&<button className="btn" onClick={()=>open(m.id)}>Ouvrir les votes</button>}{m.status==="scheduled"&&<button className="btn danger" onClick={()=>removeScheduled(m.id,m.label)}>Supprimer</button>}{m.status==="open"&&<button className="btn danger" onClick={close}>Clôturer les votes</button>}{m.status==="closed"&&!openMatch&&<button className="btn secondary" onClick={()=>reopen(m.id)}>Rouvrir le match</button>}</div></div>)}</section>
  <section className="card"><h3>Ajouter un match au calendrier</h3><div className="grid"><div><label>Nom du match</label><input className="input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="Ex. Sauces Samourai - Rasante"/></div><div><label>Date</label><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></div></div><button className="btn secondary" onClick={prepare}>Ajouter le match</button></section>
  {msg&&<p className={msg.toLowerCase().includes("ajout")||msg.toLowerCase().includes("ouvert")||msg.toLowerCase().includes("rouvert")||msg.toLowerCase().includes("clôt")?"ok":"err"}>{msg}</p>}
  {openMatch?<form className="card hero" onSubmit={vote}><h2>Vote actuel · {openMatch.label}</h2><label>Top 1 (+3 pts)</label>{choice("top1")}<textarea required value={f.c1||""} placeholder="Pourquoi ce Top 1 ?" onChange={e=>setF({...f,c1:e.target.value})}/><label>Top 2 (+2 pts)</label>{choice("top2")}<textarea required value={f.c2||""} placeholder="Pourquoi ce Top 2 ?" onChange={e=>setF({...f,c2:e.target.value})}/><label>Top 3 (+1 pt)</label>{choice("top3")}<textarea required value={f.c3||""} placeholder="Pourquoi ce Top 3 ?" onChange={e=>setF({...f,c3:e.target.value})}/><label>Flop (-1 pt)</label>{choice("flop")}<textarea required value={f.cf||""} placeholder="Pourquoi ce Flop ?" onChange={e=>setF({...f,cf:e.target.value})}/><button className="btn">Envoyer mon vote</button></form>:<div className="card"><h2>Aucun vote ouvert</h2><p className="muted">Choisissez un match dans la liste pour ouvrir ou rouvrir les votes.</p></div>}
  {sent&&<div className="popupBack"><div className="popup"><div className="tick">✅</div><h2>Vote bien envoyé !</h2><p>Merci, votre bulletin anonyme a été enregistré.</p><button className="btn" onClick={()=>setSent(false)}>Fermer</button></div></div>}
 </>
}
