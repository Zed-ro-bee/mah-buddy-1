import type { Metadata } from "next";
import "./globals.css";
import "./mah-buddy-environment.css";
import "./phase2.css";

export const metadata: Metadata = {
  title: "Mah Buddy — Your AI Study Companion",
  description: "A friendly AI study companion for learning, revision, quizzes, and more.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}