import type { Metadata } from "next";

const siteUrl = "https://mah-buddy.vercel.app";

export const metadata: Metadata = {
  title: "About Mah Buddy",
  description:
    "Official information about Mah Buddy, an AI study and chat companion created by ZED_RO Corp.",
  alternates: { canonical: "/about-mah-buddy" },
  openGraph: {
    title: "About Mah Buddy",
    description:
      "Official information about Mah Buddy, an AI study and chat companion created by ZED_RO Corp.",
    url: `${siteUrl}/about-mah-buddy`,
    siteName: "Mah Buddy",
    type: "website",
  },
};

const facts = [
  ["Name", "Mah Buddy"],
  ["Also known as", "Mah Buddy AI"],
  ["Category", "AI learning and study companion"],
  ["Creator", "ZED_RO Corp."],
  ["Official website", siteUrl],
  ["Primary purpose", "Helping students learn, revise, practise, and get AI assistance"],
  ["Core experiences", "AI chat, learning help, quizzes, flashcards, revision, and study support"],
  ["Platform", "Web application, with mobile app packaging supported by the project"],
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mah Buddy",
  alternateName: "Mah Buddy AI",
  url: siteUrl,
  description:
    "An AI study and chat companion for learning, revision, flashcards, quizzes, questions, and everyday help.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  creator: {
    "@type": "Organization",
    name: "ZED_RO Corp.",
    url: siteUrl,
  },
};

export default function AboutMahBuddyPage() {
  return (
    <main className="min-h-screen bg-[#0e0d14] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
          Official information
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Mah Buddy</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
          Mah Buddy is an AI-powered study and chat companion designed to help students
          learn, revise, practise, and get assistance with questions.
        </p>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">What is Mah Buddy?</h2>
          <p className="mt-4 leading-8 text-white/70">
            Mah Buddy combines conversational AI with study-focused experiences. Students can
            use it for learning support, revision, quizzes, flashcards, questions, and everyday
            educational help. The goal is to make AI feel like a useful study companion rather
            than just a general chatbot.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Official facts</h2>
          <dl className="mt-6 divide-y divide-white/10">
            {facts.map(([label, value]) => (
              <div key={label} className="grid gap-2 py-4 sm:grid-cols-[190px_1fr]">
                <dt className="font-medium text-white/55">{label}</dt>
                <dd className="text-white/85">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Official links</h2>
          <div className="mt-5 flex flex-col gap-3 text-white/80">
            <a className="underline underline-offset-4" href="/">Mah Buddy app</a>
            <a className="underline underline-offset-4" href="/privacy-policy">Privacy Policy</a>
            <a className="underline underline-offset-4" href="/terms-of-service">Terms of Service</a>
          </div>
        </section>

        <p className="mt-10 text-sm leading-6 text-white/45">
          This page is the official public reference for Mah Buddy. Information should be kept
          accurate and consistent across official profiles and other public references.
        </p>
      </div>
    </main>
  );
}
