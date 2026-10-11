"use client";
import AuthGate from "../components/auth-gate";
import MahBuddyV3Home from "../components/mah-buddy-v3-home";
import ProfileMemory from "../components/profile-memory";
import TtsLayer from "../components/tts-layer";
import PlatformGate from "../components/platform-gate";

export default function Page(){return <AuthGate><PlatformGate><ProfileMemory/><TtsLayer><MahBuddyV3Home/></TtsLayer></PlatformGate></AuthGate>}
