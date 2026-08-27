import Link from "next/link"

export const metadata = {
  title: "Terms of Service | Mah Buddy",
  description: "Terms of Service for Mah Buddy.",
}

export default function TermsOfServicePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>
      <Link href="/" style={{ textDecoration: "none" }}>← Back to Mah Buddy</Link>
      <article style={{ marginTop: 32 }}>
        <h1>Mah Buddy Terms of Service</h1>
        <p><strong>Last Updated: August 27, 2026</strong></p>
        <p>Welcome to Mah Buddy, an educational AI study assistant operated by ZED_RO Corp ("ZED_RO Corp," "we," "us," or "our"). These Terms of Service govern your use of the Mah Buddy website, application, and related services (the "Service"). By using the Service, you agree to these Terms.</p>
        <h2>1. About Mah Buddy</h2>
        <p>Mah Buddy is an educational AI study companion designed to help users learn, practise, understand concepts, solve problems, and organise study activities. Features may include AI explanations, questions, quizzes, flashcards, and voice functionality.</p>
        <h2>2. Educational Information</h2>
        <p>Mah Buddy uses artificial intelligence and may sometimes provide incomplete, outdated, or incorrect information. Educational responses should be reviewed with appropriate judgement and, when necessary, verified using reliable educational materials, teachers, qualified professionals, or authoritative sources. Mah Buddy is not a substitute for professional advice.</p>
        <h2>3. Accounts</h2>
        <p>Some features require an account. You are responsible for providing accurate information and keeping your account credentials secure. You should notify us if you believe your account has been accessed without permission.</p>
        <h2>4. Acceptable Use</h2>
        <p>You agree to use Mah Buddy lawfully and responsibly. You must not use the Service to violate laws or the rights of others, attempt unauthorised access, interfere with or damage the Service, upload content you do not have the right to use, abuse automated systems, circumvent reasonable security measures, or use the Service in a way that could harm other users or the operation of Mah Buddy.</p>
        <h2>5. User Content</h2>
        <p>You retain your rights in content you submit to Mah Buddy. You grant Mah Buddy the permissions reasonably necessary to process that content to provide the requested features, including generating responses and maintaining your learning experience.</p>
        <h2>6. Intellectual Property</h2>
        <p>Mah Buddy and its software, branding, design, logos, and other original materials are owned by or licensed to ZED_RO Corp and are protected by applicable intellectual-property laws. These Terms do not transfer ownership of those materials to you.</p>
        <h2>7. Third-Party Services</h2>
        <p>Mah Buddy may rely on third-party services for hosting, authentication, AI processing, storage, text-to-speech, analytics, security, or other functionality. Those services may have their own terms and privacy policies, and their availability may affect Mah Buddy features.</p>
        <h2>8. Availability and Changes</h2>
        <p>We may modify, improve, suspend, or discontinue features of Mah Buddy from time to time. We do not guarantee that the Service will always be available, uninterrupted, secure, or error-free.</p>
        <h2>9. Account Suspension or Termination</h2>
        <p>We may suspend or terminate access where reasonably necessary to protect the Service, users, or others, including where these Terms are violated. You may stop using Mah Buddy at any time.</p>
        <h2>10. Disclaimer</h2>
        <p>Mah Buddy is provided on an "as available" basis. To the extent permitted by applicable law, we make no guarantee that AI-generated information will always be accurate, complete, suitable for a particular purpose, or free from errors.</p>
        <h2>11. Limitation of Liability</h2>
        <p>To the extent permitted by applicable law, Mah Buddy and ZED_RO Corp will not be responsible for indirect, incidental, special, consequential, or similar losses arising from your use of or inability to use the Service.</p>
        <h2>12. Privacy</h2>
        <p>Your use of Mah Buddy is also subject to our Privacy Policy, which explains how information is collected, used, stored, protected, and shared.</p>
        <h2>13. Changes to These Terms</h2>
        <p>We may update these Terms when the Service, legal requirements, or our practices change. Updated Terms will be published on this page with a new Last Updated date. Continued use of Mah Buddy after an update means you accept the updated Terms to the extent permitted by law.</p>
        <h2>14. Contact</h2>
        <p>For questions about these Terms, contact Mah Buddy / ZED_RO Corp:</p>
        <p><strong>Email:</strong> zee.asa.co@gmail.com</p>
        <p><strong>WhatsApp:</strong> +234 901 165 8814</p>
        <p><strong>© 2026 ZED_RO Corp. All rights reserved.</strong></p>
      </article>
    </main>
  )
}
