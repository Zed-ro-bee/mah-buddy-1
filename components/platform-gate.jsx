"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

function client(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;
}

export default function PlatformGate({children}){
  const [state,setState]=useState({ready:false,maintenance:false,announcement:""});
  useEffect(()=>{let active=true;(async()=>{try{const sb=client();if(!sb){if(active)setState({ready:true,maintenance:false,announcement:""});return;}const {data}=await sb.from("mah_buddy_platform_settings").select("key,value").eq("is_public",true);const values=Object.fromEntries((data||[]).map(r=>[r.key,r.value]));if(active)setState({ready:true,maintenance:values.maintenance_mode===true,announcement:typeof values.announcement==="string"?values.announcement:""});}catch{if(active)setState({ready:true,maintenance:false,announcement:""});}})();return()=>{active=false}},[]);
  if(!state.ready)return <div style={{minHeight:"100svh",display:"grid",placeItems:"center",fontFamily:"system-ui",color:"#73778a"}}>Preparing Mah Buddy…</div>;
  if(state.maintenance)return <main style={{minHeight:"100svh",display:"grid",placeItems:"center",padding:24,fontFamily:"system-ui",textAlign:"center",background:"var(--vbg,#f7f8fc)",color:"var(--vink,#171827)"}}><div style={{maxWidth:560}}><div style={{fontSize:12,fontWeight:800,letterSpacing:".16em",color:"#6d5dfc",textTransform:"uppercase"}}>MAH BUDDY</div><h1 style={{fontSize:42,letterSpacing:"-1.8px",margin:"12px 0"}}>We’ll be back shortly.</h1><p style={{lineHeight:1.7,color:"var(--vmuted,#73778a)"}}>Mah Buddy is temporarily unavailable while we carry out maintenance. Please try again later.</p></div></main>;
  return <>{state.announcement&&<div style={{position:"relative",zIndex:60,padding:"10px 16px",textAlign:"center",fontSize:13,fontWeight:700,background:"#f0edff",color:"#5143b8",borderBottom:"1px solid #ddd7ff"}}>{state.announcement}</div>}{children}</>;
}
