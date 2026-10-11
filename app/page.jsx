"use client";
import AuthGate from "../components/auth-gate";
import MahBuddyV3Home from "../components/mah-buddy-v3-home";
import ProfileMemory from "../components/profile-memory";
import TtsLayer from "../components/tts-layer";
import PlatformGate from "../components/platform-gate";

const styles=`
:root{--vbg:#f7f8fc;--vsurface:#fff;--vink:#171827;--vmuted:#73778a;--vline:#e8e9f0;--vbrand:#6d5dfc;--vsoft:#f0edff;--vshadow:0 18px 60px rgba(31,27,66,.10)}
html[data-theme="dark"]{--vbg:#0c0d12;--vsurface:#171820;--vink:#f7f7fb;--vmuted:#a6a8b5;--vline:#2b2d37;--vsoft:#27223d;--vshadow:0 18px 70px rgba(0,0,0,.34)}
html,body{background:var(--vbg)!important;color:var(--vink)!important;transition:background .25s,color .25s}
.mb-shell,.mb-home{min-height:100svh;background:var(--vbg);color:var(--vink)}
.mb-home{max-width:980px;margin:auto;padding:0 18px 130px}.mb-header{height:72px;display:grid;grid-template-columns:48px 1fr 48px;align-items:center;position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--vbg) 88%,transparent);backdrop-filter:blur(20px);border-bottom:1px solid var(--vline)}.mb-brand{display:flex;justify-content:center;align-items:center;gap:9px;font-weight:800}.mb-brand strong{font-family:Manrope,sans-serif;letter-spacing:-.3px}.mb-icon-btn{width:42px;height:42px;border:1px solid var(--vline);border-radius:14px;background:color-mix(in srgb,var(--vsurface) 92%,transparent);color:var(--vink);display:grid;place-items:center;box-shadow:0 5px 18px rgba(20,18,40,.04);transition:.18s ease}.mb-icon-btn:hover{background:var(--vsoft);color:var(--vbrand);transform:translateY(-1px)}
.mb-content{min-height:calc(100svh - 72px)}.mb-hero{text-align:center;max-width:760px;margin:0 auto;padding:75px 0 30px}.mb-hero-mark{display:grid;place-items:center;margin-bottom:20px;filter:drop-shadow(0 12px 22px rgba(109,93,252,.18))}.mb-kicker{font-size:10px;letter-spacing:.18em;font-weight:800;color:var(--vbrand);text-transform:uppercase}.mb-hero h1{font-family:Manrope,sans-serif;font-size:clamp(38px,7vw,62px);line-height:1.02;letter-spacing:-2.5px;margin:10px 0}.mb-hero p{color:var(--vmuted);font-size:15px;line-height:1.6}.mb-prompts{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:38px}.mb-prompts button{border:1px solid var(--vline);background:var(--vsurface);color:var(--vink);border-radius:22px;padding:20px;text-align:left;min-height:150px;display:flex;flex-direction:column;gap:7px;box-shadow:var(--vshadow);transition:.2s ease}.mb-prompts button:hover{transform:translateY(-3px);border-color:#c9c2ff;box-shadow:0 20px 55px rgba(109,93,252,.13)}.mb-prompts button svg{color:var(--vbrand);margin-bottom:14px}.mb-prompts strong{font-size:14px}.mb-prompts span{font-size:12px;color:var(--vmuted);line-height:1.4}
.mb-chat{max-width:760px;margin:auto;padding:32px 0 40px}.mb-msg{display:flex;gap:12px;margin:22px 0;align-items:flex-start}.mb-msg.user{justify-content:flex-end}.mb-msg-body{max-width:min(720px,86%)}.mb-msg.user .mb-msg-body{background:var(--vsoft);border:1px solid var(--vline);padding:13px 16px;border-radius:18px 18px 5px 18px;box-shadow:0 5px 18px rgba(20,18,40,.04)}.mb-msg-label{display:block;font-size:10px;font-weight:800;letter-spacing:.08em;color:var(--vmuted);margin-bottom:6px}.mb-msg.user .mb-msg-label{text-align:right}.mb-msg p{white-space:pre-wrap;line-height:1.65;margin:0;font-size:15px}.mb-attachment-card,.mb-attachment-preview{display:flex;align-items:center;gap:10px;border:1px solid var(--vline);background:var(--vsurface);border-radius:15px;padding:10px 12px;margin-bottom:8px;box-shadow:0 5px 18px rgba(20,18,40,.04)}.mb-attachment-card strong,.mb-attachment-preview strong{display:block;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px}.mb-attachment-card small,.mb-attachment-preview small{display:block;color:var(--vmuted);font-size:10px;margin-top:2px}.mb-attachment-preview{max-width:760px;margin:0 auto 9px}.mb-attachment-preview>div{flex:1}.mb-attachment-preview button{border:0;background:transparent;color:var(--vmuted);display:grid;place-items:center}.mb-thinking{display:flex;gap:4px;padding:8px 0}.mb-thinking i{width:6px;height:6px;background:var(--vbrand);border-radius:50%;animation:mbPulse 1s infinite}.mb-thinking i:nth-child(2){animation-delay:.15s}.mb-thinking i:nth-child(3){animation-delay:.3s}@keyframes mbPulse{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}
.mb-composer-area{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:min(760px,calc(100% - 28px));z-index:30}.mb-composer{display:flex;align-items:center;gap:5px;border:1px solid var(--vline);background:color-mix(in srgb,var(--vsurface) 96%,transparent);border-radius:22px;padding:7px 8px 7px 9px;box-shadow:0 18px 55px rgba(20,18,40,.16);backdrop-filter:blur(18px);transition:.2s}.mb-composer.listening{border-color:#9b8fff;box-shadow:0 0 0 4px rgba(109,93,252,.10),0 18px 55px rgba(20,18,40,.16)}.mb-composer textarea{flex:1;border:0;outline:0;resize:none;min-height:38px;max-height:120px;padding:9px 8px;background:transparent;color:var(--vink)}.mb-composer textarea::placeholder{color:var(--vmuted)}.mb-composer-btn,.mb-send{width:38px;height:38px;border:0;border-radius:12px;background:transparent;color:var(--vmuted);display:grid;place-items:center;transition:.16s}.mb-composer-btn:hover{background:var(--vsoft);color:var(--vbrand)}.mb-composer-btn.active{background:var(--vsoft);color:var(--vbrand);box-shadow:0 0 0 3px rgba(109,93,252,.10)}.mb-send{background:linear-gradient(135deg,#6d5dfc,#9b72ff);color:#fff;box-shadow:0 8px 18px rgba(109,93,252,.28)}.mb-send:disabled{opacity:.45}.mb-composer-area>small{display:block;text-align:center;color:var(--vmuted);font-size:9px;margin-top:7px}
.mb-history-overlay,.mb-settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);z-index:80}.mb-history{width:min(370px,88vw);height:100%;background:var(--vsurface);color:var(--vink);padding:18px;box-shadow:20px 0 70px rgba(0,0,0,.22);animation:mbSlide .22s ease;display:flex;flex-direction:column}.mb-history-head{display:flex;align-items:center;justify-content:space-between;font-family:Manrope,sans-serif;font-size:18px;margin-bottom:16px}.mb-new-chat{width:100%;height:46px;border:1px solid #d8d2ff;background:var(--vsoft);color:var(--vink);border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:800;transition:.18s}.mb-new-chat:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(109,93,252,.12)}.mb-history-list{margin-top:14px;display:flex;flex-direction:column;gap:5px;overflow:auto;flex:1}.mb-history-item{width:100%;border:0;background:transparent;color:var(--vink);border-radius:13px;padding:12px;text-align:left;display:flex;gap:10px;align-items:flex-start}.mb-history-item:hover{background:var(--vsoft)}.mb-history-item span{min-width:0;flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mb-history-item small{display:block;color:var(--vmuted);font-size:10px;margin-top:3px}.mb-history-empty{color:var(--vmuted);font-size:13px;text-align:center;padding:30px 10px}.mb-settings-nav{margin-top:12px;border:1px solid var(--vline);background:var(--vsurface);border-radius:16px;padding:12px;display:grid;grid-template-columns:28px 1fr;align-items:center;text-align:left;color:var(--vink);box-shadow:0 8px 25px rgba(20,18,40,.05)}.mb-settings-nav svg{grid-row:1/3;color:var(--vbrand)}.mb-settings-nav span{font-weight:800;font-size:13px}.mb-settings-nav small{color:var(--vmuted);font-size:10px;margin-top:3px}
.mb-settings{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 28px));max-height:min(720px,90vh);overflow:auto;background:var(--vsurface);border:1px solid var(--vline);border-radius:28px;padding:24px;box-shadow:0 30px 100px rgba(0,0,0,.25);animation:mbSettingsIn .2s ease}.mb-settings header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:25px}.mb-settings-eyebrow{font-size:9px;letter-spacing:.18em;color:var(--vbrand);font-weight:900}.mb-settings h2{font-family:Manrope,sans-serif;font-size:28px;letter-spacing:-1px;margin:5px 0}.mb-settings header p{margin:0;color:var(--vmuted);font-size:12px}.mb-settings-section{margin-top:22px}.mb-settings-section h3{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--vmuted);margin:0 0 9px 4px}.mb-setting-card{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--vline);background:color-mix(in srgb,var(--vsurface) 94%,var(--vsoft));border-radius:17px;margin-top:7px}.mb-setting-icon{width:38px;height:38px;border-radius:12px;background:var(--vsoft);color:var(--vbrand);display:grid;place-items:center}.mb-setting-copy{flex:1;min-width:0}.mb-setting-copy strong,.mb-setting-copy span{display:block}.mb-setting-copy strong{font-size:13px}.mb-setting-copy span{font-size:10px;color:var(--vmuted);margin-top:3px}.mb-theme-switch{width:43px;height:25px;border:0;border-radius:99px;background:#c9cad3;padding:3px;transition:.2s}.mb-theme-switch span{display:block;width:19px;height:19px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 2px 6px rgba(0,0,0,.18)}.mb-theme-switch span.on{transform:translateX(18px);background:#fff}.mb-theme-switch:has(span.on){background:var(--vbrand)}.mb-settings-footer{display:flex;align-items:center;justify-content:center;gap:8px;color:var(--vmuted);font-size:10px;margin-top:28px;padding-top:18px;border-top:1px solid var(--vline)}@keyframes mbSettingsIn{from{opacity:0;transform:translate(-50%,-47%) scale(.98)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.mb-toast{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);background:#171827;color:#fff;padding:10px 15px;border-radius:12px;font-size:12px;z-index:100;box-shadow:0 12px 30px rgba(0,0,0,.2)}html[data-theme="dark"] .mb-toast{background:#fff;color:#171827}html[data-theme="dark"] .mb-intro{background:#0d0e14}
@media(max-width:700px){.mb-prompts{grid-template-columns:1fr}.mb-hero{padding:48px 0 20px}.mb-chat{padding-top:20px}.mb-msg-body{max-width:88%}.mb-composer-area{bottom:9px}.mb-home{padding-left:12px;padding-right:12px}.mb-settings{border-radius:24px;padding:20px}}
/* Dashboard redesign v1 — scoped visual layer; preserves the existing Mah Buddy mark and app behaviour. */
.mb-home{max-width:1120px!important;padding:0 24px 138px!important}
.mb-header{grid-template-columns:44px minmax(0,1fr) 42px 42px!important;gap:7px!important;border-bottom-color:color-mix(in srgb,var(--vline) 70%,transparent)!important}.mb-header .mb-brand{min-width:0}.mb-header .mb-brand strong{font-size:15px}.mb-header .mb-icon-btn{width:40px;height:40px}
.mb-content{max-width:1040px!important;margin:0 auto!important;padding:34px 24px 180px!important}
.mb-hero{position:relative;isolation:isolate;overflow:hidden;text-align:left!important;max-width:none!important;min-height:0!important;padding:clamp(28px,5vw,56px)!important;margin:12px 0 0!important;border:1px solid var(--vline);border-radius:32px;background:linear-gradient(135deg,color-mix(in srgb,var(--vsurface) 94%,var(--vsoft)),var(--vsurface) 65%);box-shadow:var(--vshadow)}
.mb-hero:before{content:"";position:absolute;z-index:-1;right:-90px;top:-135px;width:330px;height:330px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--vbrand) 19%,transparent),transparent 70%);pointer-events:none}
.mb-hero:after{content:"";position:absolute;z-index:-1;right:7%;bottom:-145px;width:260px;height:260px;border-radius:50%;border:1px solid color-mix(in srgb,var(--vbrand) 14%,transparent);box-shadow:0 0 0 28px color-mix(in srgb,var(--vbrand) 3%,transparent),0 0 0 58px color-mix(in srgb,var(--vbrand) 2%,transparent);pointer-events:none}
.mb-hero-mark{place-items:start!important;margin:0 0 24px!important;filter:drop-shadow(0 10px 18px rgba(109,93,252,.2))!important}
.mb-kicker{display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid color-mix(in srgb,var(--vbrand) 20%,var(--vline));border-radius:999px;background:var(--vsoft);font-size:10px!important;letter-spacing:.12em!important}
.mb-hero h1{max-width:700px;font-size:clamp(38px,6.3vw,68px)!important;line-height:1.02!important;letter-spacing:-.055em!important;margin:18px 0 14px!important;text-wrap:balance}
.mb-hero p{max-width:580px!important;font-size:clamp(14px,1.8vw,16px)!important;line-height:1.75!important;margin:0!important}
.mb-prompts{position:relative;z-index:1;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important;margin-top:34px!important}
.mb-prompts button{min-height:164px!important;padding:21px!important;border-radius:23px!important;gap:9px!important;background:color-mix(in srgb,var(--vsurface) 95%,var(--vsoft))!important;box-shadow:0 8px 24px rgba(31,27,66,.045)!important}
.mb-prompts button:focus-visible,.mb-icon-btn:focus-visible,.mb-composer button:focus-visible{outline:3px solid color-mix(in srgb,var(--vbrand) 60%,white);outline-offset:3px}
.mb-prompts button svg{width:42px;height:42px;padding:10px;border-radius:14px;background:var(--vsoft);margin:0 0 9px!important}
.mb-prompts strong{font-size:14px!important;letter-spacing:-.01em}
.mb-prompts span{font-size:12px!important;line-height:1.55!important}
.mb-composer-area{width:min(820px,calc(100% - 32px))!important;bottom:18px!important}
.mb-composer{border-radius:24px!important;box-shadow:0 18px 55px rgba(20,18,40,.13),0 2px 8px rgba(20,18,40,.04)!important}
.mb-chat{max-width:820px!important;padding-top:28px!important}
.mb-msg{margin:26px 0!important}
.mb-msg p{line-height:1.75!important}
.mb-history,.mb-settings{backdrop-filter:blur(24px)}
@media(max-width:700px){
 .mb-home{padding-left:12px!important;padding-right:12px!important}
 .mb-header{height:66px!important}
 .mb-content{padding:18px 2px 176px!important}
 .mb-hero{padding:25px 20px 22px!important;border-radius:25px!important;margin-top:4px!important}
 .mb-hero-mark{margin-bottom:20px!important}
 .mb-hero-mark svg{width:60px;height:60px}
 .mb-hero h1{font-size:clamp(36px,10vw,48px)!important;letter-spacing:-.05em!important;margin:16px 0 12px!important}
 .mb-hero p{font-size:14px!important}
 .mb-prompts{grid-template-columns:1fr!important;gap:10px!important;margin-top:24px!important}
 .mb-prompts button{min-height:unset!important;display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;grid-template-rows:auto auto;column-gap:13px!important;row-gap:4px!important;padding:15px!important;border-radius:18px!important}
 .mb-prompts button svg{grid-column:1;grid-row:1/3;width:42px;height:42px;margin:0!important;align-self:center}
 .mb-prompts strong{grid-column:2;align-self:end}
 .mb-prompts span{grid-column:2;align-self:start}
 .mb-composer-area{bottom:10px!important;width:calc(100% - 22px)!important}
 .mb-chat{padding-top:16px!important}
 .mb-msg{gap:8px!important;margin:20px 0!important}
}
@media(prefers-reduced-motion:reduce){.mb-prompts button,.mb-icon-btn,.mb-composer{transition:none!important}}
/* Premium chat interface: clear speaker alignment, answer cards and practical response actions. */
.mb-chat .mb-msg.assistant{gap:11px!important;max-width:100%;align-items:flex-start}
.mb-chat .mb-msg-body{min-width:0}
.mb-chat .mb-msg.assistant .mb-msg-label{font-size:11px!important;letter-spacing:.02em!important;margin:2px 0 9px!important}
.mb-chat .mb-msg.user .mb-msg-body{background:transparent!important;border:0!important;padding:0!important;box-shadow:none!important}.mb-chat .mb-msg.user .mb-msg-label{display:block!important;text-align:right!important;margin:0 3px 6px!important}.mb-user-bubble{display:inline-block;max-width:100%}
.mb-answer-card{background:var(--vsurface);border:1px solid var(--vline);border-radius:5px 20px 20px 20px;padding:16px 17px;box-shadow:0 8px 24px rgba(31,27,66,.045)}
.mb-answer-card p{font-size:15px!important;line-height:1.8!important;overflow-wrap:anywhere}
.mb-user-bubble{background:var(--vsoft);border:1px solid color-mix(in srgb,var(--vbrand) 12%,var(--vline));padding:13px 16px;border-radius:20px 20px 5px 20px}
.mb-user-bubble p{font-size:14px!important;line-height:1.7!important;overflow-wrap:anywhere}
.mb-answer-actions{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin-top:10px}
.mb-answer-actions button{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--vline);background:var(--vsurface);color:var(--vmuted);border-radius:999px;padding:7px 11px;font-size:11px;font-weight:650;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.mb-answer-actions button:hover{background:var(--vsoft);border-color:color-mix(in srgb,var(--vbrand) 35%,var(--vline));color:var(--vbrand)}
.mb-answer-actions button:disabled{opacity:.45;cursor:wait}
.mb-chat .mb-msg.assistant .mb-msg-body{max-width:min(760px,calc(100% - 42px))}
.mb-chat .mb-msg.user .mb-msg-body{max-width:min(650px,88%)}
@media(max-width:700px){.mb-answer-card{padding:14px;border-radius:5px 17px 17px 17px}.mb-answer-card p{font-size:14px!important}.mb-answer-actions{gap:6px}.mb-answer-actions button{padding:7px 9px;font-size:10px}.mb-chat .mb-msg.assistant .mb-msg-body{max-width:calc(100% - 40px)}}
.mb-side-navigation{display:flex;flex-direction:column;gap:5px;margin:2px 0 18px}
.mb-side-link{display:flex;align-items:center;gap:11px;width:100%;min-height:44px;padding:11px 12px;border:1px solid transparent;border-radius:13px;background:transparent;color:var(--vink);text-decoration:none;text-align:left;font:600 13px Manrope,sans-serif;cursor:pointer}
.mb-side-link:hover,.mb-side-link.active{background:var(--vsoft);color:var(--vbrand);border-color:color-mix(in srgb,var(--vbrand) 15%,var(--vline))}
.mb-history-section-title{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--vmuted);padding:2px 5px 6px}
.mb-mobile-nav{display:none}
@media(max-width:700px){.mb-mobile-nav{position:fixed;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));left:0;right:0;bottom:0;height:62px;padding:5px 8px max(5px,env(safe-area-inset-bottom));background:color-mix(in srgb,var(--vsurface) 95%,transparent);border-top:1px solid var(--vline);backdrop-filter:blur(18px);z-index:35}.mb-mobile-nav button,.mb-mobile-nav a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:0;border-radius:12px;background:transparent;color:var(--vmuted);text-decoration:none;font:600 10px Manrope,sans-serif}.mb-mobile-nav button.active,.mb-mobile-nav a:hover{background:var(--vsoft);color:var(--vbrand)}.mb-mobile-nav svg{width:19px;height:19px}.mb-composer-area{bottom:68px}.mb-home{padding-bottom:150px}.mb-history{padding-bottom:calc(18px + env(safe-area-inset-bottom))}}


/* Final chat polish: consistent header controls, accessible spacing, and safe-area aware navigation. */
.mb-header{gap:7px!important}
.mb-header .mb-brand{min-width:0;white-space:nowrap}
.mb-header .mb-brand strong{font-size:15px}
.mb-header .mb-icon-btn{width:40px;height:40px}
.mb-mobile-nav{box-sizing:border-box;height:calc(62px + env(safe-area-inset-bottom));padding:5px 8px calc(5px + env(safe-area-inset-bottom))}
.mb-mobile-nav button,.mb-mobile-nav a{min-width:0;min-height:44px}
.mb-composer-area{bottom:calc(68px + env(safe-area-inset-bottom))}
.mb-home{padding-bottom:calc(158px + env(safe-area-inset-bottom))!important}
.mb-content{scroll-padding-bottom:190px}
.mb-composer textarea{font:500 14px/1.5 Manrope,sans-serif}
.mb-answer-card{overflow-wrap:anywhere}
.mb-mobile-nav button:focus-visible,.mb-mobile-nav a:focus-visible{outline:2px solid var(--vbrand);outline-offset:-2px}
@media(max-width:700px){
 .mb-header{grid-template-columns:38px minmax(0,1fr) 36px 36px!important;gap:5px!important}
 .mb-header .mb-icon-btn{width:35px;height:35px;border-radius:11px}
 .mb-brand{gap:5px!important}
 .mb-brand svg{width:26px;height:26px}
 .mb-brand strong{font-size:13px!important}
 .mb-composer-area{bottom:calc(66px + env(safe-area-inset-bottom))!important}
 .mb-home{padding-bottom:calc(154px + env(safe-area-inset-bottom))!important}
}



`;
export default function Page(){return <AuthGate><PlatformGate><style>{styles}</style><ProfileMemory/><TtsLayer><MahBuddyV3Home/></TtsLayer></PlatformGate></AuthGate>}
