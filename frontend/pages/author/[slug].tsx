import groq from "groq";
import imageUrlBuilder from "@sanity/image-url";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import client from "../../client";

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

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

export default function AuthorPage({ author }: any) {
  if (!author) {
    return (
      <section className="p-6">
        <h1 className="text-2xl font-semibold">Author not found</h1>
      </section>
    );
  }

  const { name, image, bio = [], posts = [] } = author;

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <div className="flex items-center gap-4">
          {image ? (
            <img
              src={urlFor(image).width(96).height(96).fit("crop").url()}
              alt={`${name}'s picture`}
              className="size-16 rounded-full object-cover"
            />
          ) : null}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Author</p>
          </div>
        </div>

        {bio?.length ? (
          <div className="mt-6 prose prose-neutral dark:prose-invert max-w-none">
            <PortableText value={bio} />
          </div>
        ) : null}
      </header>

      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Posts by {name}</h2>
        {posts.length ? (
          <ul className="grid gap-4">
            {posts.map((p: any) => (
              <li key={p._id}>
                <Link
                  href={`/post/${encodeURIComponent(p?.slug?.current ?? "")}`}
                  className="group block rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white shadow-sm hover:shadow-md transition p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight group-hover:underline">
                      {p.title || "(untitled)"}
                    </h3>
                    <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(p.publishedAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No posts yet.</p>
        )}
      </section>
    </article>
  );
}

const query = groq`*[_type == "author" && slug.current == $slug][0]{
  _id,
  name,
  "slug": slug.current,
  image,
  bio,
  "posts": *[_type == "post" && references(^._id)] | order(coalesce(publishedAt, _createdAt) desc) {
    _id, title, slug, publishedAt
  }
}`;

export async function getStaticPaths() {
  const slugs: string[] = await client.fetch(
    groq`*[_type == "author" && defined(slug.current)][].slug.current`
  );
  return {
    paths: slugs.map((slug: string) => ({ params: { slug } })),
    fallback: true,
  };
}

export async function getStaticProps(context: any) {
  const { slug = "" } = (context.params || {}) as { slug?: string };
  const author = await client.fetch(query, { slug });
  return {
    props: { author: author ?? null },
    revalidate: 60,
  };
}
