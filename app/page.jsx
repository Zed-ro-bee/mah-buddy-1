"use client";
import AuthGate from "../components/auth-gate";
import MahBuddyV2Home from "../components/mah-buddy-v2-home";
export default function Page(){return <AuthGate><MahBuddyV2Home/></AuthGate>}
