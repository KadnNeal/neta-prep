import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
        <span className="text-base font-semibold tracking-tight text-[#fafafa]">
          Pass NETA
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-3 py-1.5"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-1.5 rounded-md transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-40 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Pass the NETA Level 2.{" "}
            <span className="text-[#ea580c]">First try.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl mb-10 leading-relaxed">
            Built by a working ETT. 3,000+ exam-style questions, structured
            learning roadmap, and AI-powered explanations — grounded in real
            recalled exam data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-[#ea580c] hover:bg-[#c2410c] text-white font-medium px-8 py-3.5 rounded-md transition-colors text-base"
            >
              Start Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] font-medium px-8 py-3.5 rounded-md transition-colors text-base"
            >
              View Pricing
            </Link>
          </div>
        </section>

        {/* Social proof bar */}
        <div className="border-t border-b border-[#27272a] py-4 px-6 md:px-12">
          <p className="text-sm text-[#71717a] text-center">
            Built for NETA ETT Level 2 candidates. Grounded in NETA ATS 2025,
            MTS 2023, and ECS 2024.
          </p>
        </div>

        {/* Feature highlights */}
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#27272a] rounded-lg p-7">
              <div className="w-8 h-8 rounded bg-[#ea580c]/10 flex items-center justify-center mb-5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-[#ea580c]"
                >
                  <path
                    d="M8 1L10 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H6L8 1Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#fafafa] mb-2">
                28-Module Roadmap
              </h3>
              <p className="text-sm text-[#71717a] leading-relaxed">
                Structured learning path from electrical fundamentals through
                advanced component testing. Follow it start to finish or jump to
                what you need.
              </p>
            </div>

            <div className="border border-[#27272a] rounded-lg p-7">
              <div className="w-8 h-8 rounded bg-[#ea580c]/10 flex items-center justify-center mb-5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-[#ea580c]"
                >
                  <rect
                    x="1"
                    y="3"
                    width="14"
                    height="10"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 7h8M4 10h5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#fafafa] mb-2">
                3,000+ Exam-Style Questions
              </h3>
              <p className="text-sm text-[#71717a] leading-relaxed">
                Scenario-based questions with deliberate distractors built to
                match real NETA exam difficulty. Daily drill with spaced
                repetition keeps you sharp.
              </p>
            </div>

            <div className="border border-[#27272a] rounded-lg p-7">
              <div className="w-8 h-8 rounded bg-[#ea580c]/10 flex items-center justify-center mb-5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-[#ea580c]"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6 8.5C6.5 9.5 7.2 10 8 10s1.5-.5 2-1.5M6 6.5h.01M10 6.5h.01"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#fafafa] mb-2">
                AI Explanations
              </h3>
              <p className="text-sm text-[#71717a] leading-relaxed">
                Every practice question includes an instant AI explanation
                covering why the correct answer is right and why each wrong
                answer is wrong.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-8 text-center">
            How we compare
          </h2>
          <div className="border border-[#27272a] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="text-left py-3.5 px-5 text-[#71717a] font-medium w-1/2">
                    Feature
                  </th>
                  <th className="text-center py-3.5 px-4 text-[#ea580c] font-semibold">
                    Pass NETA
                  </th>
                  <th className="text-center py-3.5 px-4 text-[#71717a] font-medium">
                    TestGuy
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Structured learning roadmap", true, false],
                  ["AI explanations per question", true, false],
                  ["Grounded in NETA ATS 2025", true, false],
                  ["Exam simulation mode", true, true],
                  ["Topic-filtered practice", true, true],
                  ["Price", "From $39/mo", "Free / $24.99"],
                ].map(([feature, passNeta, testGuy], i) => (
                  <tr
                    key={i}
                    className="border-b border-[#27272a] last:border-0"
                  >
                    <td className="py-3.5 px-5 text-[#a1a1aa]">{feature as string}</td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof passNeta === "boolean" ? (
                        passNeta ? (
                          <span className="text-green-500 font-bold">✓</span>
                        ) : (
                          <span className="text-[#52525b]">✗</span>
                        )
                      ) : (
                        <span className="text-[#ea580c] font-medium text-xs">
                          {passNeta}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof testGuy === "boolean" ? (
                        testGuy ? (
                          <span className="text-[#a1a1aa]">✓</span>
                        ) : (
                          <span className="text-[#52525b]">✗</span>
                        )
                      ) : (
                        <span className="text-[#71717a] text-xs">{testGuy}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#52525b] text-center mt-3">
            Comparison based on publicly available information as of 2026.
          </p>
        </section>

        {/* Pricing preview */}
        <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-2 text-center">
            Simple pricing
          </h2>
          <p className="text-sm text-[#71717a] text-center mb-10">
            Free tier to start. Upgrade when you&apos;re ready to go all in.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Monthly", price: "$39", period: "/mo" },
              { name: "90-Day", price: "$109", period: "", highlight: true },
              { name: "Annual", price: "$299", period: "/yr" },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`border rounded-lg p-6 text-center ${
                  tier.highlight
                    ? "border-[#ea580c] bg-[#ea580c]/5"
                    : "border-[#27272a]"
                }`}
              >
                <p className="text-sm text-[#71717a] mb-1">{tier.name}</p>
                <p className="text-3xl font-bold text-[#fafafa]">
                  {tier.price}
                  <span className="text-sm font-normal text-[#71717a]">
                    {tier.period}
                  </span>
                </p>
              </div>
            ))}
          </div>
          <p className="text-center mt-6">
            <Link
              href="/pricing"
              className="text-sm text-[#ea580c] hover:text-[#c2410c] transition-colors"
            >
              See full pricing →
            </Link>
          </p>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto">
          <div className="border border-[#27272a] bg-[#18181b] rounded-xl px-8 py-14 text-center">
            <h2 className="text-3xl font-bold text-[#fafafa] mb-4">
              Your exam date is coming.{" "}
              <span className="text-[#ea580c]">Start today.</span>
            </h2>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-[#ea580c] hover:bg-[#c2410c] text-white font-medium px-10 py-3.5 rounded-md transition-colors text-base mt-2"
            >
              Get Started Free
            </Link>
            <p className="text-xs text-[#52525b] mt-5 italic">
              Most NETA technicians expense this as professional development
              training.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] py-6 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#52525b]">
        <span>Pass NETA &copy; 2026</span>
        <nav className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-[#a1a1aa] transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-[#a1a1aa] transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="hover:text-[#a1a1aa] transition-colors">
            Sign Up
          </Link>
        </nav>
      </footer>
    </div>
  );
}
