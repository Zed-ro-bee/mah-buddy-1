import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mah-buddy-environment.css";
import "./phase2.css";
import "./mah-buddy-intro.css";
import "./mah-buddy-unified.css";
import "./chat-ui.css";
import "./mah-buddy-native.css";
import "./mah-buddy-app.css";
import "./mah-buddy-current-ui.css";
import "./mah-buddy-responsive.css";
import "./mah-buddy-app-interface.css";
import "./mah-buddy-mobile.css";
import "./mah-buddy-final-mobile.css";
import "./mah-buddy-showcase.css";
import "./mah-buddy-native-final.css";
import PWARegister from "../components/pwa-register";
import PreferencesBridge from "../components/preferences-bridge";

export const metadata: Metadata = {
  title: "Mah Buddy — Your AI Study Companion",
  description: "A friendly AI study companion for learning, revision, quizzes, and more.",
  applicationName: "Mah Buddy",
  appleWebApp: { capable: true, title: "Mah Buddy", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f7f7f9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PWARegister /><PreferencesBridge />{children}</body></html>;
}
