"use client";
import {useEffect,useState} from "react";

type Profile={preferredName:string;buddyName:string;age:string;learningLevel:string;goal:string;educationLevel:string};
const KEY="mah-buddy-profile";
const defaults:Profile={preferredName:"",buddyName:"Mah Buddy",age:"",learningLevel:"",goal:"",educationLevel:""};
const levelGuide:Record<string,string>={Foundation:"A1–A2",Developing:"B1",Proficient:"B2",Advanced:"C1",Expert:"C2"};
function read(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return defaults}}
function greeting(name:string,level:string){const h=new Date().getHours();const time=h<12?"Good morning":h<17?"Good afternoon":"Good evening";if(!name)return "Welcome back to Mah Buddy";return `${time}, ${name}. Ready for ${level||"your"} learning?`}
export default function ProfileMemory(){
 const[profile,setProfile]=useState(defaults);const[visible,setVisible]=useState(true);
 useEffect(()=>{const sync=()=>{setProfile(read());setVisible(true);window.setTimeout(()=>setVisible(false),5000)};sync();window.addEventListener("mah-buddy-profile-changed",sync);return()=>window.removeEventListener("mah-buddy-profile-changed",sync)},[]);
 useEffect(()=>{const original=window.fetch.bind(window);window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{try{const url=typeof input==="string"?input:input instanceof URL?input.toString():input.url;if(url.endsWith("/api/chat")&&init?.body&&typeof init.body==="string"){const body=JSON.parse(init.body);body.profile=read();init={...init,body:JSON.stringify(body)}}}catch{}return original(input,init)};return()=>{window.fetch=original}},[]);
 if(!visible||!profile.preferredName)return null;
 return <div className="mb-profile-greeting" role="status"><div><strong>{greeting(profile.preferredName,profile.learningLevel)}</strong><span>{profile.learningLevel?`${profile.learningLevel} (${levelGuide[profile.learningLevel]||"standard"}) explanations`:"Your personal learning profile is active"}{profile.goal?` • ${profile.goal}`:""}</span></div><button onClick={()=>setVisible(false)} aria-label="Dismiss greeting">×</button><style>{`.mb-profile-greeting{position:fixed;top:84px;left:50%;transform:translateX(-50%);z-index:25;width:min(700px,calc(100% - 28px));display:flex;align-items:center;gap:12px;padding:13px 15px;border:1px solid var(--vline);border-radius:17px;background:color-mix(in srgb,var(--vsurface) 94%,transparent);backdrop-filter:blur(18px);box-shadow:0 15px 45px rgba(20,18,40,.12);color:var(--vink)}.mb-profile-greeting>div{min-width:0;flex:1}.mb-profile-greeting strong{display:block;font-size:13px}.mb-profile-greeting span{display:block;color:var(--vmuted);font-size:10px;margin-top:3px}.mb-profile-greeting button{border:0;background:transparent;color:var(--vmuted);font-size:20px;line-height:1;cursor:pointer}`}</style></div>
}
