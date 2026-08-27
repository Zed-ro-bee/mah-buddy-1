import Link from "next/link"

export const metadata = {
  title: "Terms of Service | Mah Buddy",
  description: "Terms of Service for Mah Buddy.",
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:py-16">
        <Link href="/" className="text-sm font-medium opacity-70 transition-opacity hover:opacity-100">
          ← Back to Mah Buddy
        </Link>

        <article className="mt-8 rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
          <header className="border-b pb-8">
            <p className="text-sm font-medium opacity-60">Mah Buddy</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
            <p className="mt-3 text-sm opacity-65">Last updated: August 27, 2026</p>
          </header>

          <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
            <p>
              These Terms of Service govern your use of Mah Buddy. By accessing or using Mah Buddy, you agree to these Terms. If you do not agree with them, please do not use the service.
            </p>

            <h2>1. About Mah Buddy</h2>
            <p>
              Mah Buddy is an educational AI study companion designed to help users learn, practise, understand concepts, solve problems, and organise study activities. Mah Buddy may provide explanations, questions, quizzes, flashcards, and other educational assistance.
            </p>

            <h2>2. Educational Information</h2>
            <p>
              Mah Buddy uses artificial intelligence and may sometimes produce incomplete, outdated, or incorrect information. You should use appropriate judgement and, when necessary, verify important information with reliable educational materials, teachers, qualified professionals, or other authoritative sources. Mah Buddy is not a substitute for professional advice.
            </p>

            <h2>3. Accounts</h2>
            <p>
              Some features require an account. You are responsible for providing accurate information and for keeping your account credentials secure. You should notify us if you believe your account has been accessed without permission.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree to use Mah Buddy lawfully and responsibly. You must not:</p>
            <ul>
              <li>Use Mah Buddy to violate applicable laws or the rights of others.</li>
              <li>Attempt to interfere with, damage, or gain unauthorised access to the service.</li>
              <li>Upload or submit content that you do not have the right to use.</li>
              <li>Abuse automated systems or attempt to circumvent reasonable service limits or security measures.</li>
              <li>Use Mah Buddy in a way that could harm other users or the operation of the service.</li>
            </ul>

            <h2>5. User Content</h2>
            <p>
              You retain your rights in content that you submit to Mah Buddy. You grant Mah Buddy the permissions reasonably necessary to process that content so the service can provide its features, including generating responses and maintaining your requested learning experience.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
              Mah Buddy and its software, branding, design, logos, and other original materials are owned by or licensed to the service operator and are protected by applicable intellectual-property laws. These Terms do not transfer ownership of those materials to you.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              Mah Buddy may rely on third-party services for hosting, authentication, AI processing, storage, text-to-speech, analytics, or other functionality. Those services may have their own terms and privacy policies, and their availability may affect Mah Buddy features.
            </p>

            <h2>8. Availability and Changes</h2>
            <p>
              We may modify, improve, suspend, or discontinue features of Mah Buddy from time to time. We do not guarantee that the service will always be available, uninterrupted, or error-free.
            </p>

            <h2>9. Account Suspension or Termination</h2>
            <p>
              We may suspend or terminate access where reasonably necessary to protect the service, users, or others, including where these Terms are violated. You may stop using Mah Buddy at any time.
            </p>

            <h2>10. Disclaimer</h2>
            <p>
              Mah Buddy is provided on an “as available” basis. To the extent permitted by applicable law, we make no guarantee that AI-generated information will always be accurate, complete, suitable for a particular purpose, or free from errors.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              To the extent permitted by applicable law, Mah Buddy and its operators will not be responsible for indirect, incidental, special, consequential, or similar losses arising from your use of or inability to use the service.
            </p>

            <h2>12. Privacy</h2>
            <p>
              Your use of Mah Buddy is also subject to our Privacy Policy, which explains how information is collected, used, stored, and protected.
            </p>

            <h2>13. Changes to These Terms</h2>
            <p>
              We may update these Terms when the service, legal requirements, or our practices change. Updated Terms will be published on this page with a new “Last updated” date. Continued use of Mah Buddy after an update means you accept the updated Terms to the extent permitted by law.
            </p>

            <h2>14. Contact</h2>
            <p>
              For questions about these Terms, contact Mah Buddy at <a href="mailto:zee.asa.co@gmail.com">zee.asa.co@gmail.com</a> or WhatsApp <a href="https://wa.me/2349011658814">+234 901 165 8814</a>.
            </p>
          </div>
        </article>
      </div>
    </main>
  )
}
