import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pass NETA — ETT Exam Study Platform",
  description:
    "Adaptive spaced repetition and AI-powered interview prep for NETA ETT certification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t);})()`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
