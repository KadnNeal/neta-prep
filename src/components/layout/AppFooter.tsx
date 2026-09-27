import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-border mt-12 py-5 px-6 md:px-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            width={16}
            height={16}
            className="dark:mix-blend-screen mix-blend-multiply"
          />
          Pass NETA &copy; 2026
        </span>
        <nav className="flex items-center gap-5">
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <a
            href="mailto:support@passneta.co"
            className="hover:text-foreground transition-colors"
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
}
