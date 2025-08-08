import Link from "next/link";
import groq from "groq";
import client from "../client";

type Post = {
  _id: string;
  title?: string;
  slug?: { current: string };
  publishedAt?: string;
};

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Index({ posts }: { posts: Post[] }) {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Welcome to a blog!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Latest posts, updates, and thoughts.
        </p>
      </header>

      {posts && posts.length > 0 ? (
        <ul className="grid gap-4">
          {posts.map(({ _id, title = "", slug, publishedAt = "" }) =>
            slug?.current ? (
              <li key={_id}>
                <Link
                  href={`/post/${encodeURIComponent(slug.current)}`}
                  className="group block rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white shadow-sm hover:shadow-md transition p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight group-hover:underline">
                      {title || "(untitled)"}
                    </h2>
                    <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(publishedAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ) : null
          )}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-black/10 dark:border-white/10 p-6 text-center text-gray-600 dark:text-gray-400">
          No posts yet. Create one in your Sanity Studio.
        </div>
      )}
    </section>
  );
}

export async function getStaticProps() {
  const posts: Post[] = await client.fetch(
    groq`*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc){
      _id, title, slug, publishedAt
    }`
  );
  return {
    props: { posts },
    revalidate: 60,
  };
}
