"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../lib/supabase";

type Profile={preferredName:string;buddyName:string;age:string;learningLevel:string;goal:string;educationLevel:string};
const KEY="mah-buddy-profile";
const defaults:Profile={preferredName:"",buddyName:"Mah Buddy",age:"",learningLevel:"",goal:"",educationLevel:""};
const levels=[
 {value:"Foundation",detail:"A1–A2 • simple language, guided explanations"},
 {value:"Developing",detail:"B1 • clear language with useful detail"},
 {value:"Proficient",detail:"B2 • natural language with deeper explanations"},
 {value:"Advanced",detail:"C1 • precise language and detailed reasoning"},
 {value:"Expert",detail:"C2 • sophisticated language and full depth"},
];
function Logo({size=32}:{size?:number}){return <img src="/mah-buddy-logo.svg" width={size} height={size} alt="Mah Buddy"/>}
function Field({label,sub,children}:{label:string;sub:string;children:React.ReactNode}){return <label className="profile-field"><span><b>{label}</b><small>{sub}</small></span>{children}</label>}
export default function ProfilePage(){
 const[profile,setProfile]=useState(defaults);const[email,setEmail]=useState("");const[saved,setSaved]=useState(false);
 useEffect(()=>{try{setProfile({...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")})}catch{};if(supabase)supabase.auth.getUser().then(({data})=>setEmail(data.user?.email||""))},[]);
 function persist(patch:Partial<Profile>){const next={...profile,...patch};setProfile(next);localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent("mah-buddy-profile-changed"));setSaved(true);window.setTimeout(()=>setSaved(false),900)}
 return <main className="profile-app"><header className="profile-header"><a href="/" className="back" aria-label="Back">←</a><div className="head-brand"><Logo size={30}/><div><strong>Profile</strong><span>Mah Buddy</span></div></div><span className="saved">{saved?"Saved ✓":""}</span></header><div className="profile-content">
 <section className="identity-card"><div className="identity-top"><span className="eyebrow">YOUR SPACE</span><span className="status-pill"><i/> Personal</span></div><div className="avatar-area"><div className="avatar"><span>{(profile.preferredName||"M").trim().slice(0,1).toUpperCase()}</span><i><Logo size={12}/></i></div><div><b>{profile.preferredName||"Your profile"}</b><small>{profile.preferredName?"Personal study space":"Add your name to personalise Mah Buddy"}</small></div></div><h1>Make it <em>personal.</em></h1><p>Everything you enter here is remembered securely for your account. Mah Buddy uses it to greet you and adapt how it teaches you.</p></section>
 <section className="profile-panel"><div className="panel-title"><div><span>PERSONAL DETAILS</span><h2>About you</h2></div><b>01</b></div><Field label="What should Mah Buddy call you?" sub="Remembered and used in greetings and your study space."><input value={profile.preferredName} onChange={e=>persist({preferredName:e.target.value})} placeholder="Your preferred name"/></Field><Field label="What do you want to call Mah Buddy?" sub="Mah Buddy will use this name when speaking with you."><input value={profile.buddyName} onChange={e=>persist({buddyName:e.target.value})} placeholder="Mah Buddy"/></Field><Field label="Your age" sub="Remembered to help Mah Buddy keep explanations appropriate."><input inputMode="numeric" type="number" min="5" max="120" value={profile.age} onChange={e=>persist({age:e.target.value})} placeholder="Age"/></Field></section>
 <section className="profile-panel"><div className="panel-title"><div><span>LEARNING PROFILE</span><h2>Your direction</h2></div><b>02</b></div><Field label="Learning level" sub="This standard controls Mah Buddy's teaching language and explanation depth."><select value={profile.learningLevel} onChange={e=>persist({learningLevel:e.target.value})}><option value="">Select your level</option>{levels.map(l=><option key={l.value} value={l.value}>{l.value} — {l.detail}</option>)}</select></Field><Field label="Current studies" sub="Your academic context helps Mah Buddy choose relevant examples."><select value={profile.educationLevel} onChange={e=>persist({educationLevel:e.target.value})}><option value="">Select your current studies</option><option>Primary school</option><option>Secondary school</option><option>College / university</option><option>Professional learning</option><option>Independent learning</option></select></Field><Field label="What are you working towards?" sub="Remembered so Mah Buddy can tailor study suggestions and examples."><select value={profile.goal} onChange={e=>persist({goal:e.target.value})}><option value="">Select a goal</option><option>Exam preparation</option><option>Homework and assignments</option><option>Understanding difficult topics</option><option>Building study habits</option><option>General learning</option></select></Field></section>
 <section className="account-card"><span>CONNECTED ACCOUNT</span><div className="account-line"><div className="account-symbol"><Logo size={24}/></div><div><strong>{email||"Signed-in account"}</strong><small>Your profile and learning preferences are securely remembered for this account.</small></div><b>✓</b></div></section>
 <a href="/" className="continue">Continue to Mah Buddy <span>→</span></a>
 </div></main>
}
