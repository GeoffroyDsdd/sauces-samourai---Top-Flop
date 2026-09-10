import{NextResponse}from"next/server";import{cookies}from"next/headers";import{validSession}from"@/lib/auth";import{adminDb}from"@/lib/supabase";
export async function DELETE(){
 if(!await validSession((await cookies()).get("Sauces Samourai_admin")?.value))return NextResponse.json({error:"Non autorisé"},{status:401});
 const{error}=await adminDb().from("matches").delete().not("id","is",null);
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}
