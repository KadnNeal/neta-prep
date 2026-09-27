import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Pass NETA",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12 border-b border-[#27272a]">
        <Link href="/" className="text-sm font-semibold text-[#fafafa] hover:text-[#ea580c] transition-colors">
          ← Pass NETA
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 md:px-12 py-16">
        <p className="text-xs text-[#52525b] mb-2">Last updated: September 24, 2026</p>
        <h1 className="text-3xl font-bold text-[#fafafa] mb-10">Terms of Service</h1>

        <p className="text-sm text-[#a1a1aa] leading-relaxed mb-10">
          These Terms of Service (&quot;Terms&quot;) govern access to and use of Pass NETA (passneta.co),
          an exam-preparation platform for NETA Level 2 certification candidates, operated by
          PassNETA LLC (&quot;Pass NETA,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account or using the
          site, you agree to these Terms and our Privacy Policy.
        </p>

        <Section title="1. Acceptance of Terms">
          By creating an account, accessing, or using passneta.co (the &quot;Service&quot;), you agree to be
          bound by these Terms and our Privacy Policy. If you do not agree, do not use the Service.
          We may update these Terms from time to time as described in Section 9; continued use
          after an update means you accept the revised Terms.
        </Section>

        <Section title="2. Description of Service">
          Pass NETA provides an online subscription platform for NETA Level 2 certification exam
          preparation, including a structured learning roadmap, practice questions, full-length exam
          simulations, progress tracking, and AI-generated explanations of practice questions.
          <br /><br />
          AI-generated explanations are produced automatically and are intended as a study aid
          only. They may contain errors and should not be treated as a substitute for the official
          NETA standards (ATS, ECS, MTS) or professional judgment. Pass NETA does not guarantee
          the accuracy, completeness, or currency of any AI-generated content.
        </Section>

        <Section title="3. Eligibility & Accounts">
          You must be at least 18 years old to create an account and purchase a subscription. You
          are responsible for maintaining the confidentiality of your login credentials and for all
          activity under your account. Each subscription is for use by a single individual; sharing
          an account or credentials with others is a violation of these Terms (see Section 5) and
          may result in suspension or termination without refund.
          <br /><br />
          You agree to provide accurate account information and to keep it up to date.
        </Section>

        <Section title="4. Subscriptions, Billing & Cancellation">
          Pass NETA offers the following paid plans, billed in USD plus any applicable sales tax:
          Monthly ($39 every 30 days), 90-Day Pass ($109 for a 90-day period), and Annual ($299
          every 12 months). Prices are subject to change; any price change applies only to future
          billing periods and never to a period you have already paid for. We will provide notice
          before a price change takes effect for existing subscribers.
          <br /><br />
          Payments are processed by Stripe. By subscribing, you authorize Pass NETA to charge
          your payment method for the applicable plan and, where auto-renewal applies, each
          renewal amount. The Monthly plan renews automatically every 30 days until canceled. The
          90-Day Pass and Annual plan do not auto-renew unless you expressly opt in to renewal at
          checkout. You may cancel auto-renewal at any time from your account settings — no
          separate request is required beyond clicking cancel — and cancellation takes effect at
          the end of the current billing period, with access continuing until then.
          <br /><br />
          Fees are non-refundable except where required by law. If you upgrade from the 90-Day
          Pass to the Annual plan, the $109 already paid is credited toward the Annual plan&apos;s price
          at the time of upgrade, and your Annual billing period is backdated to your original
          90-Day Pass purchase date. Free-tier access is limited and does not include full roadmap
          content, AI explanations, or exam simulations.
          <br /><br />
          If Pass NETA permanently discontinues the Service, we will provide reasonable advance
          notice and will either let you use any prepaid, unused access through the end of your
          then-current paid period or provide a pro-rated refund for the unused portion, at our
          discretion.
        </Section>

        <Section title="5. Acceptable Use & Content">
          When using the Service, you agree not to:
          <ul className="mt-3 space-y-2 list-none">
            {[
              "Share, sell, sublicense, or provide account access or subscription content to anyone else",
              "Scrape, copy, redistribute, or republish the question bank, roadmap content, or AI explanations in bulk or for commercial purposes",
              "Use automated tools (bots, scrapers) to access the Service",
              "Attempt to reverse-engineer, disrupt, or gain unauthorized access to the Service or its underlying systems",
              "Use the Service for any unlawful purpose or in a way that infringes the rights of others",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-sm text-[#a1a1aa] leading-relaxed">
                <span className="text-[#ea580c] mt-0.5 shrink-0">—</span>
                {item}
              </li>
            ))}
          </ul>
          <br />
          We may suspend or terminate accounts that violate this section, without refund, at our
          discretion.
        </Section>

        <Section title="6. Intellectual Property">
          All content on the Service — including the question bank, learning roadmap, explanations,
          software, design, and trademarks — is owned by PassNETA LLC or its licensors and is
          protected by copyright and other intellectual property laws.
          <br /><br />
          Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license
          to access and use the content made available to you under your account — whether under
          the free tier or a paid subscription — for your personal, non-commercial exam
          preparation. No other rights are granted.
        </Section>

        <Section title="7. Disclaimers">
          <strong className="text-[#fafafa]">No affiliation with NETA.</strong> Pass NETA is an
          independent study platform and is not affiliated with, endorsed by, or sponsored by the
          International Electrical Testing Association (NETA) or any NETA certification body.
          &quot;NETA&quot; refers to the certification standards and exams administered by that association;
          references to NETA on this site are for identification purposes only.
          <br /><br />
          <strong className="text-[#fafafa]">No guarantee of exam results.</strong> Use of the
          Service, including any &quot;exam readiness&quot; scoring, does not guarantee that you will pass
          any NETA certification exam. Exam content, format, and passing criteria are determined
          solely by NETA and may differ from the Service&apos;s practice content.
          <br /><br />
          The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind,
          express or implied, including warranties of merchantability, fitness for a particular
          purpose, or non-infringement.
          <br /><br />
          <strong className="text-[#fafafa]">Not a substitute for field procedures.</strong> All
          platform content — including practice questions, AI explanations, and the learning
          roadmap — is provided solely for exam preparation. It is not a substitute for equipment
          manufacturer instructions, your employer&apos;s approved testing procedures, or required
          safety training (including NFPA 70E and other applicable standards). Always follow your
          employer&apos;s procedures and applicable safety requirements when performing actual
          electrical testing work.
        </Section>

        <Section title="8. Limitation of Liability">
          To the maximum extent permitted by law, PassNETA LLC and its owner, employees, and
          contractors will not be liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits, revenue, or data, arising from your use of or
          inability to use the Service — including reliance on AI-generated explanations or exam
          readiness scores — even if advised of the possibility of such damages.
          <br /><br />
          Our total liability for any claim relating to the Service will not exceed the amount you
          paid Pass NETA in the twelve (12) months preceding the claim.
        </Section>

        <Section title="9. Termination, Governing Law & Changes to These Terms">
          <strong className="text-[#fafafa]">Termination.</strong> You may stop using the Service
          and cancel your subscription at any time from account settings. We may suspend or
          terminate your account for violation of these Terms, including the Acceptable Use
          provisions in Section 5.
          <br /><br />
          <strong className="text-[#fafafa]">Governing law.</strong> These Terms are governed by
          the laws of the State of Arizona, without regard to conflict-of-law principles. Any
          dispute arising from these Terms or the Service will be brought in the state or federal
          courts located in Maricopa County, Arizona, and you consent to their jurisdiction.
          <br /><br />
          <strong className="text-[#fafafa]">Changes to these Terms.</strong> We may revise these
          Terms from time to time. We will post the updated Terms on this page with a new &quot;Last
          updated&quot; date; material changes will be communicated by email or an in-app notice where
          required. Continued use of the Service after changes take effect constitutes acceptance.
        </Section>

        <Section title="10. Contact">
          Questions about these Terms can be sent to{" "}
          <a href="mailto:support@passneta.co" className="text-[#ea580c] hover:underline">
            support@passneta.co
          </a>
          , or by mail to PassNETA LLC, c/o Northwest Registered Agent LLC, 4539 N 22nd St Ste N,
          Phoenix, AZ 85016, USA.
        </Section>
      </main>

      <footer className="border-t border-[#27272a] py-6 px-6 md:px-12 text-center text-xs text-[#52525b]">
        Pass NETA &copy; 2026
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-semibold text-[#fafafa] mb-3">{title}</h2>
      <p className="text-sm text-[#a1a1aa] leading-relaxed">{children}</p>
    </section>
  );
}
