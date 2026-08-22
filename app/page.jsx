"use client";
import AuthGate from "../components/auth-gate";
import MahBuddyHome from "../components/mah-buddy-home";

export default function Page() {
  return (
    <AuthGate>
      <MahBuddyHome />
    </AuthGate>
  );
}
