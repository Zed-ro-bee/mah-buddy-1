"use client";
import {useEffect} from "react";
import {supabase} from "../lib/supabase";

type StoredMessage={role:"user"|"assistant"|"system";content:string};
type StoredChat={id:string;title:string;messages:StoredMessage[];updatedAt:number};
type StoredProfile={preferredName:string;buddyName:string;age:string;learningLevel:string;goal:string;educationLevel?:string};

const CHAT_KEY="mah-buddy-chats", LEGACY_CHAT_KEY="mah-buddy-chat", V3_HISTORY_KEY="mah-buddy-history", V3_CURRENT_KEY="mah-buddy-current", PREFS_KEY="mah-buddy-prefs", PROFILE_KEY="mah-buddy-profile";
const QUIZ_HISTORY_KEY="mah-buddy-quiz-history", QUIZ_CONFIG_KEY="mah-buddy-quiz-config";
const FLASH_HISTORY_KEY="mah-buddy-flashcard-history", FLASH_CONFIG_KEY="mah-buddy-flashcard-config";
const USER_LOCAL_KEYS=[CHAT_KEY,LEGACY_CHAT_KEY,V3_HISTORY_KEY,V3_CURRENT_KEY,PREFS_KEY,PROFILE_KEY,QUIZ_HISTORY_KEY,QUIZ_CONFIG_KEY,FLASH_HISTORY_KEY,FLASH_CONFIG_KEY];
const defaultProfile:StoredProfile={preferredName:"",buddyName:"Mah Buddy",age:"",learningLevel:"",goal:"",educationLevel:""};

export default function PersistenceBridge({userId,onSignOut}:{userId:string;onSignOut?:()=>void}){
 useEffect(()=>{
  if(!supabase||!userId)return;
  const client=supabase;
  let active=true,timer:ReturnType<typeof setTimeout>|null=null,hydrated=false;
  const scoped=(key:string)=>`mah-buddy:user:${userId}:${key}`;
  const readJSON=(key:string,fallback:any)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}};
  const write=(key:string,value:any)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  const clearActiveLocal=()=>{for(const key of USER_LOCAL_KEYS)localStorage.removeItem(key)};
  const saveLocalSnapshot=()=>{for(const key of USER_LOCAL_KEYS){const value=localStorage.getItem(key);if(value!==null)localStorage.setItem(scoped(key),value)}};
  const restoreLocalSnapshot=()=>{for(const key of USER_LOCAL_KEYS){const saved=localStorage.getItem(scoped(key));if(saved!==null)localStorage.setItem(key,saved)}};
  const readChats=():StoredChat[]=>{
   try{
    const raw=localStorage.getItem(CHAT_KEY);
    if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))return parsed;}
    const v3=JSON.parse(localStorage.getItem(V3_HISTORY_KEY)||"[]");
    if(Array.isArray(v3)&&v3.length){write(CHAT_KEY,v3);return v3;}
    const legacy=JSON.parse(localStorage.getItem(LEGACY_CHAT_KEY)||"[]");
    if(!Array.isArray(legacy)||!legacy.length)return[];
    const chat:StoredChat={id:crypto.randomUUID(),title:"New chat",messages:legacy.filter((m:any)=>m?.role&&m?.content).map((m:any)=>({role:m.role,content:String(m.content)})),updatedAt:Date.now()};
    write(CHAT_KEY,[chat]);return[chat];
   }catch{return[]}
  };
  const readProfile=():StoredProfile=>{try{return {...defaultProfile,...readJSON(PROFILE_KEY,{})}}catch{return defaultProfile}};
  const persist=async()=>{
   if(!active||!hydrated)return;
   try{
    saveLocalSnapshot();
    const chats=readChats();
    if(chats.length)write(V3_HISTORY_KEY,chats);
    const ids=new Set(chats.map(c=>c.id));
    const{data:remote}=await client.from("conversations").select("id").eq("user_id",userId);
    const removed=(remote||[]).map(r=>r.id).filter(id=>!ids.has(id));
    if(removed.length)await client.from("conversations").delete().eq("user_id",userId).in("id",removed);
    for(const chat of chats){
     const{error}=await client.from("conversations").upsert({id:chat.id,user_id:userId,title:chat.title||"New chat",updated_at:new Date(chat.updatedAt||Date.now()).toISOString()});
     if(error)continue;
     await client.from("messages").delete().eq("conversation_id",chat.id).eq("user_id",userId);
     if(chat.messages.length)await client.from("messages").insert(chat.messages.map(m=>({conversation_id:chat.id,user_id:userId,role:m.role,content:m.content})));
    }
   }catch{}
  };
  const persistProfile=async()=>{try{const p=readProfile();await client.from("profiles").upsert({id:userId,display_name:p.preferredName||null,preferred_name:p.preferredName||null,buddy_name:p.buddyName||"Mah Buddy",age:p.age||null,learning_level:p.learningLevel||null,goal:p.goal||null,education_level:p.educationLevel||null,updated_at:new Date().toISOString()})}catch{}};
  const persistPrefs=async()=>{try{const p=readJSON(PREFS_KEY,{});const theme=p.theme||(p.dark?"dark":"system");await client.from("user_settings").upsert({user_id:userId,theme,memory_enabled:p.memory!==false,voice_enabled:p.voice!==false,tts_enabled:p.autoSpeak===true,notifications_enabled:p.notifications!==false,updated_at:new Date().toISOString()})}catch{}};
  const schedule=()=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>{void persist();void persistProfile();void persistPrefs()},600)};
  const hydrate=async()=>{
   try{
    clearActiveLocal();restoreLocalSnapshot();
    const[{data:cs,error},{data:settings},{data:remoteProfile}]=await Promise.all([
     client.from("conversations").select("id,title,updated_at").eq("user_id",userId).order("updated_at",{ascending:false}),
     client.from("user_settings").select("theme,voice_enabled,tts_enabled,notifications_enabled,memory_enabled").eq("user_id",userId).maybeSingle(),
     client.from("profiles").select("preferred_name,buddy_name,age,learning_level,goal,education_level,display_name").eq("id",userId).maybeSingle()
    ]);
    if(error||!active){hydrated=true;window.dispatchEvent(new CustomEvent("mah-buddy-persistence-ready"));return}
    if(cs?.length){
     const{data:ms}=await client.from("messages").select("conversation_id,role,content,created_at").eq("user_id",userId).order("created_at",{ascending:true});
     const map=new Map<string,StoredMessage[]>();for(const m of ms||[]){const a=map.get(m.conversation_id)||[];a.push({role:m.role,content:m.content});map.set(m.conversation_id,a)}
     const chats=cs.map(c=>({id:c.id,title:c.title||"New chat",messages:map.get(c.id)||[],updatedAt:new Date(c.updated_at).getTime()}));
     write(CHAT_KEY,chats);write(V3_HISTORY_KEY,chats);
     if(!localStorage.getItem(V3_CURRENT_KEY)&&chats[0])localStorage.setItem(V3_CURRENT_KEY,chats[0].id);
    } else {
     const localChats=readChats();
     if(localChats.length)write(V3_HISTORY_KEY,localChats);
    }
    if(settings)write(PREFS_KEY,{...readJSON(PREFS_KEY,{}),theme:settings.theme||"system",voice:settings.voice_enabled!==false,autoSpeak:settings.tts_enabled===true,notifications:settings.notifications_enabled!==false,memory:settings.memory_enabled!==false});
    if(remoteProfile){const profile={...defaultProfile,preferredName:remoteProfile.preferred_name||remoteProfile.display_name||"",buddyName:remoteProfile.buddy_name||"Mah Buddy",age:remoteProfile.age||"",learningLevel:remoteProfile.learning_level||"",goal:remoteProfile.goal||"",educationLevel:remoteProfile.education_level||""};write(PROFILE_KEY,profile);window.dispatchEvent(new CustomEvent("mah-buddy-profile-changed"));}
    saveLocalSnapshot();hydrated=true;schedule();window.dispatchEvent(new CustomEvent("mah-buddy-persistence-ready"));
   }catch{hydrated=true;window.dispatchEvent(new CustomEvent("mah-buddy-persistence-ready"))}
  };
  const onStorage=(e:StorageEvent)=>{if(USER_LOCAL_KEYS.includes(e.key||""))schedule()};window.addEventListener("storage",onStorage);
  const original=localStorage.setItem.bind(localStorage);localStorage.setItem=(key:string,value:string)=>{original(key,value);if(USER_LOCAL_KEYS.includes(key))schedule()};
  void hydrate();
  const signOut=async()=>{
   if(!active)return;
   if(timer)clearTimeout(timer);
   try{
    await persist();
    saveLocalSnapshot();
    active=false;
    await client.auth.signOut({scope:"local"});
    clearActiveLocal();
    sessionStorage.removeItem("mah-buddy-hydrated");
    window.dispatchEvent(new CustomEvent("mah-buddy-account-cleared"));
    onSignOut?.();
   }catch(e){console.error("Mah Buddy sign out failed",e)}
  };
  const observer=new MutationObserver(()=>{const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>(".danger"));const b=buttons.find(button=>/sign\s*out/i.test(button.textContent||""))||buttons[0];if(b&&!b.dataset.mahBuddySignout){b.dataset.mahBuddySignout="true";b.addEventListener("click",signOut)}});observer.observe(document.body,{childList:true,subtree:true});
  return()=>{active=false;if(timer)clearTimeout(timer);window.removeEventListener("storage",onStorage);localStorage.setItem=original;observer.disconnect()};
 },[userId,onSignOut]);
 return null;
}
