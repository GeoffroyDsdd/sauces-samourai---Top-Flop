import{NextResponse}from"next/server";import{cookies}from"next/headers";import{validSession}from"@/lib/auth";import{adminDb}from"@/lib/supabase";
async function auth(){return validSession((await cookies()).get("Sauces Samourai_admin")?.value)}
export async function DELETE(r:Request){
 if(!await auth())return NextResponse.json({error:"Non autorisé"},{status:401});
 const id=new URL(r.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Identifiant manquant"},{status:400});
 const{error}=await adminDb().from("matches").delete().eq("id",id);
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}
