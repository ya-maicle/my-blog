import Link from "next/link";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight hover:opacity-80 transition"
          >
            My Blog
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/projects" className="hover:underline underline-offset-4 decoration-dotted">
              Projects
            </Link>
            <Link href="/search" className="hover:underline underline-offset-4 decoration-dotted">
              Search
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>

      <footer className="mt-16 border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getUTCFullYear()} My Blog
        </div>
      </footer>
    </div>
  );
}
