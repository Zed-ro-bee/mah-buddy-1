import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mah-buddy-environment.css";
import "./phase2.css";
import "./mah-buddy-intro.css";
import "./app-shell.css";
import "./app-chat.css";
import "./app-intro.css";
import "./app-navigation.css";
import "./app-polish.css";

export const metadata: Metadata = {
  title: "Mah Buddy — Your AI Study Companion",
  description: "A friendly AI study companion for learning, revision, quizzes, and more.",
  applicationName: "Mah Buddy",
  appleWebApp: { capable: true, title: "Mah Buddy", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f7f5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
