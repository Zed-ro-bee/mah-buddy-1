"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function AuthRouteRedirect(){const router=useRouter();useEffect(()=>{router.replace("/")},[router]);return <div aria-live="polite" style={{minHeight:"100dvh",display:"grid",placeItems:"center",background:"#141916",color:"#A0ACA3",fontSize:13}}>Opening Mah Buddy…</div>}
