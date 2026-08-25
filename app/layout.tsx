import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mah-buddy-v2.css";
import "./auth.css";
import "./premium-ui.css";
import "./mah-buddy-fixes.css";
import "./mah-buddy-final-fixes.css";
import "./mah-buddy-video-fixes.css";
import PWARegister from "../components/pwa-register";
import PreferencesBridge from "../components/preferences-bridge";
import ProfileButtonBridge from "../components/profile-button-bridge";
import MahBuddyNav from "../components/mah-buddy-nav";

const siteUrl = "https://mah-buddy.vercel.app";
export const metadata: Metadata = { metadataBase:new URL(siteUrl), title:{default:"Mah Buddy — Your AI Study & Chat Buddy",template:"%s | Mah Buddy"}, description:"Mah Buddy is your friendly AI study and chat companion for learning, revision, flashcards, quizzes, questions, and everyday help.", applicationName:"Mah Buddy", keywords:["Mah Buddy","AI study companion","AI tutor","AI chat","study assistant","flashcards","quizzes","learning assistant"], authors:[{name:"ZED_RO Corp."}], creator:"ZED_RO Corp.", publisher:"ZED_RO Corp.", alternates:{canonical:"/"}, icons:{icon:[{url:"/mah-buddy-logo.svg",type:"image/svg+xml"}],shortcut:"/mah-buddy-logo.svg",apple:"/mah-buddy-logo.svg"}, openGraph:{type:"website",url:siteUrl,siteName:"Mah Buddy",title:"Mah Buddy — Your AI Study & Chat Buddy",description:"Chat, learn, revise, create flashcards, take quizzes, and get help with Mah Buddy.",images:[{url:"/mah-buddy-logo.svg",alt:"Mah Buddy logo"}]}, twitter:{card:"summary",title:"Mah Buddy — Your AI Study & Chat Buddy",description:"Your friendly AI study and chat companion for learning, revision, flashcards, quizzes, and more.",images:["/mah-buddy-logo.svg"]}, robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}}, appleWebApp:{capable:true,title:"Mah Buddy",statusBarStyle:"black-translucent"} };
export const viewport: Viewport = {width:"device-width",initialScale:1,maximumScale:1,userScalable:false,viewportFit:"cover",themeColor:"#0e0d14"};
const structuredData={"@context":"https://schema.org","@type":"WebApplication",name:"Mah Buddy",alternateName:"Mah Buddy AI",url:siteUrl,description:"A friendly AI study and chat companion for learning, revision, flashcards, quizzes, questions, and everyday help.",applicationCategory:"EducationalApplication",operatingSystem:"Web",image:`${siteUrl}/mah-buddy-logo.svg`,creator:{"@type":"Organization",name:"ZED_RO Corp."}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/></head><body><PWARegister/><PreferencesBridge/><ProfileButtonBridge/>{children}<MahBuddyNav/></body></html>}
