import type { Metadata } from "next";
import MahBuddyFeatureGuide from "../../components/mah-buddy-feature-guide";

const siteUrl = "https://mah-buddy.vercel.app";

export const metadata: Metadata = {
  title: "Explore Mah Buddy",
  description:
    "Explore Mah Buddy's AI assistance, study tools, quizzes, flashcards, library, voice features, and personal settings.",
  alternates: { canonical: "/about-mah-buddy" },
  openGraph: {
    title: "Explore Mah Buddy",
    description:
      "A visual guide to the tools that help you chat, learn, revise, and organise your study time.",
    url: `${siteUrl}/about-mah-buddy`,
    siteName: "Mah Buddy",
    type: "website",
  },
};

export default function AboutMahBuddyPage() {
  return <MahBuddyFeatureGuide />;
}
