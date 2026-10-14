"use client";
import AuthGate from "../../components/auth-gate";
import AuthRouteRedirect from "../../components/auth-route-redirect";
export default function LoginPage(){return <AuthGate><AuthRouteRedirect/></AuthGate>}
