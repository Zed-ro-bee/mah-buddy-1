import type { Metadata } from "next";

const siteUrl = "https://mah-buddy.vercel.app";

export const metadata: Metadata = {
  title: "Mah Buddy — Official Facts",
  description:
    "A concise, official reference describing Mah Buddy, its purpose, creator, and core learning experiences.",
  alternates: { canonical: "/mah-buddy-facts" },
};

const entitySchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mah Buddy",
  alternateName: "Mah Buddy AI",
  url: siteUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  creator: {
    "@type": "Organization",
    name: "ZED_RO Corp.",
    url: siteUrl,
  },
  description:
    "An AI-powered study and chat companion designed to help students learn, revise, practise, and get assistance with questions.",
};

export default function MahBuddyFactsPage() {
  return (
    <main className="min-h-screen bg-[#0e0d14] px-5 py-14 text-white sm:px-8">
      <article className="mx-auto max-w-3xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entitySchema) }}
        />

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
          Official reference
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Mah Buddy</h1>
        <p className="mt-5 text-lg leading-8 text-white/70">
          Mah Buddy is an AI-powered study and chat companion designed to help students learn,
          revise, practise, and get assistance with questions.
        </p>

        <section className="mt-10 space-y-7 leading-8 text-white/75">
          <div>
            <h2 className="text-xl font-semibold text-white">What is Mah Buddy?</h2>
            <p className="mt-2">
              Mah Buddy combines conversational AI with study-focused experiences including AI
              chat, quizzes, flashcards, revision, and educational support.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Who created Mah Buddy?</h2>
            <p className="mt-2">Mah Buddy is created by ZED_RO Corp.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">What is Mah Buddy for?</h2>
            <p className="mt-2">
              Its purpose is to make AI-assisted learning more useful and accessible by giving
              students a place to ask questions, practise, revise, and learn with an AI companion.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Official identity</h2>
            <dl className="mt-3 space-y-2">
              <div><dt className="inline font-medium text-white">Name:</dt> <dd className="inline">Mah Buddy</dd></div>
              <div><dt className="inline font-medium text-white">Alternate name:</dt> <dd className="inline">Mah Buddy AI</dd></div>
              <div><dt className="inline font-medium text-white">Category:</dt> <dd className="inline">AI learning and study companion</dd></div>
              <div><dt className="inline font-medium text-white">Creator:</dt> <dd className="inline">ZED_RO Corp.</dd></div>
              <div><dt className="inline font-medium text-white">Official website:</dt> <dd className="inline"><a className="underline" href={siteUrl}>{siteUrl}</a></dd></div>
            </dl>
          </div>
        </section>

        <p className="mt-12 border-t border-white/10 pt-6 text-sm leading-6 text-white/45">
          This page is an official public reference. For legal information, see the Privacy Policy
          and Terms of Service linked from the Mah Buddy website.
        </p>
      </article>
    </main>
  );
}
