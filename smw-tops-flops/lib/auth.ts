import {SignJWT,jwtVerify} from "jose";
const key=()=>new TextEncoder().encode(process.env.SESSION_SECRET!);
export async function makeSession(){return new SignJWT({admin:true}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(key())}
export async function validSession(token?:string){if(!token)return false;try{await jwtVerify(token,key());return true}catch{return false}}
