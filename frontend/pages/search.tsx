import Link from "next/link";
import groq from "groq";
import client from "../client";

type BaseResult = {
  _id: string;
  _type: "post" | "caseStudy";
  title?: string;
  slug?: string;
  publishedDate?: string;
};

type PostResult = BaseResult & {
  _type: "post";
};

type CaseStudyResult = BaseResult & {
  _type: "caseStudy";
  clientName?: string;
};

type SearchProps = {
  q: string;
  posts: PostResult[];
  caseStudies: CaseStudyResult[];
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

export default function SearchPage({ q, posts, caseStudies }: SearchProps) {
  const total = (posts?.length || 0) + (caseStudies?.length || 0);

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Search</h1>

        <form action="/search" method="get" className="flex items-center gap-3">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search posts and case studies…"
            className="w-full sm:max-w-lg rounded-md border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/10 px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
          />
          <button
            type="submit"
            className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Search
          </button>
        </form>

        {q ? (
          <p className="text-gray-600 dark:text-gray-400">
            Showing {total} result{total === 1 ? "" : "s"} for “{q}”
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Enter a query to search all content.</p>
        )}
      </header>

      {total > 0 ? (
        <div className="space-y-10">
          {posts?.length ? (
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">
                Blog posts ({posts.length})
              </h2>
              <ul className="grid gap-3">
                {posts.map((p) =>
                  p.slug ? (
                    <li key={p._id}>
                      <Link
                        href={`/post/${encodeURIComponent(p.slug)}`}
                        className="group block rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white shadow-sm hover:shadow-md transition p-4 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold tracking-tight group-hover:underline">
                            {p.title || "(untitled)"}
                          </h3>
                          <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(p.publishedDate)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>
            </section>
          ) : null}

          {caseStudies?.length ? (
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">
                Case studies ({caseStudies.length})
              </h2>
              <ul className="grid gap-3">
                {caseStudies.map((c) =>
                  c.slug ? (
                    <li key={c._id}>
                      <Link
                        href={`/projects/${encodeURIComponent(c.slug)}`}
                        className="group block rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white shadow-sm hover:shadow-md transition p-4 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold tracking-tight group-hover:underline">
                              {c.title || "(untitled)"}
                            </h3>
                            {c.clientName ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Client: {c.clientName}
                              </p>
                            ) : null}
                          </div>
                          <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(c.publishedDate)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>
            </section>
          ) : null}
        </div>
      ) : q ? (
        <div className="rounded-lg border border-dashed border-black/10 dark:border-white/10 p-6 text-center text-gray-600 dark:text-gray-400">
          No results found. Try a different query.
        </div>
      ) : null}
    </section>
  );
}

export async function getServerSideProps(context: any) {
  const raw = context.query?.q;
  const q = Array.isArray(raw) ? raw[0] : raw || "";
  const queryTerm = (q || "").trim();

  if (!queryTerm) {
    return { props: { q: "", posts: [], caseStudies: [] } };
    // Empty query returns empty results; avoids scanning entire dataset
  }

  // Use GROQ match with wildcards for substring-like matching across fields.
  const m = `*${queryTerm}*`;

  const data = await client.fetch(
    groq`{
      "posts": *[_type == "post" && defined(slug.current) && (
        title match $m ||
        pt::text(body) match $m ||
        author->name match $m ||
        array::join(coalesce(categories[]->title, []), " ") match $m
      )] | order(coalesce(publishedAt, _createdAt) desc) [0...20]{
        _id, _type, title, "slug": slug.current, "publishedDate": coalesce(publishedAt, _createdAt)
      },
      "caseStudies": *[_type == "caseStudy" && defined(slug.current) && (
        title match $m ||
        clientName match $m ||
        role match $m ||
        array::join(coalesce(disciplines, []), " ") match $m ||
        pt::text(intro) match $m ||
        pt::text(clientOverview) match $m ||
        array::join(coalesce(sections[].heading, []), " ") match $m ||
        array::join(coalesce(sections[].content[].children[].text, []), " ") match $m ||
        author->name match $m ||
        array::join(coalesce(categories[]->title, []), " ") match $m
      )] | order(coalesce(publishedAt, _createdAt) desc) [0...20]{
        _id, _type, title, "slug": slug.current, "publishedDate": coalesce(publishedAt, _createdAt), clientName
      }
    }`,
    { m }
  );

  return {
    props: {
      q: queryTerm,
      posts: data?.posts ?? [],
      caseStudies: data?.caseStudies ?? [],
    },
  };
}
