import Link from "next/link";
import { ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();

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
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/projects" className="hover:underline underline-offset-4 decoration-dotted">
                Projects
              </Link>
              <Link href="/search" className="hover:underline underline-offset-4 decoration-dotted">
                Search
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              {status === "loading" ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : session ? (
                <>
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user?.name ?? "User"}
                      className="w-8 h-8 rounded-full border border-black/5 dark:border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-white flex items-center justify-center text-xs">
                      {(session.user?.name?.[0] ?? "U").toUpperCase()}
                    </div>
                  )}
                  <div className="hidden md:flex flex-col text-xs">
                    <span className="font-medium leading-tight">{session.user?.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{session.user?.email}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-3 py-1.5 text-xs rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition"
                    type="button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="px-3 py-1.5 text-xs rounded border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition"
                  type="button"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
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
