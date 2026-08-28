import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmails=(process.env.ADMIN_EMAILS||process.env.ADMIN_EMAIL||"").split(",").map(v=>v.trim().toLowerCase()).filter(Boolean);

export async function GET(request:Request){
  if(!supabaseUrl||!serviceKey||adminEmails.length===0) return NextResponse.json({error:"Admin dashboard is not configured."},{status:503});
  const auth=request.headers.get("authorization");
  const token=auth?.startsWith("Bearer ")?auth.slice(7):null;
  if(!token) return NextResponse.json({error:"Unauthorized"},{status:401});
  const supabase=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:userError}=await supabase.auth.getUser(token);
  if(userError||!user?.email||!adminEmails.includes(user.email.toLowerCase())) return NextResponse.json({error:"Access denied"},{status:403});
  const since=new Date(Date.now()-7*24*60*60*1000).toISOString();
  const [{count:users},{count:conversations},{count:messages},{count:activeUsers},{count:signups7d},{count:conversations7d},{count:messages7d}]=await Promise.all([
    supabase.from("profiles").select("id",{count:"exact",head:true}),
    supabase.from("conversations").select("id",{count:"exact",head:true}),
    supabase.from("messages").select("id",{count:"exact",head:true}),
    supabase.from("messages").select("user_id",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("profiles").select("id",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("conversations").select("id",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("messages").select("id",{count:"exact",head:true}).gte("created_at",since)
  ]);
  return NextResponse.json({users:users??0,conversations:conversations??0,messages:messages??0,activeUsers:activeUsers??0,signups7d:signups7d??0,conversations7d:conversations7d??0,messages7d:messages7d??0});
}
