"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SignInRecorder(){
  useEffect(()=>{
    if(!supabase) return;
    const record=async()=>{
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.user) return;
      const key=`mah-buddy-signin-recorded:${session.user.id}:${session.access_token.slice(-16)}`;
      if(sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key,"1");
      try{
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/record-sign-in`,{
          method:"POST",
          headers:{Authorization:`Bearer ${session.access_token}`,"Content-Type":"application/json"},
          body:JSON.stringify({
            auth_method:(session.user.app_metadata?.provider as string|undefined)||"email",
            platform:typeof navigator!=="undefined"?navigator.platform:null,
          }),
          keepalive:true,
        });
      }catch{}
    };
    const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_IN"&&session) void record();
    });
    void record();
    return()=>listener.subscription.unsubscribe();
  },[]);
  return null;
}
