import groq from "groq";
import imageUrlBuilder from "@sanity/image-url";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { useRouter } from "next/router";
import client from "../../client";
import dynamic from "next/dynamic";
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

  const ptComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) return null;
      return (
        <img
          alt={value.alt || " "}
          loading="lazy"
          src={urlFor(value).width(1200).fit("max").auto("format").url()}
          className="w-full h-auto rounded-md my-6"
        />
      );
    },
    'mux.video': ({ value }: any) => {
      const playbackId = value?.asset?.playbackId || value?.asset?._ref;
      if (!playbackId) return null;
      return (
        <div className="my-6">
          <MuxPlayer playbackId={playbackId} />
        </div>
      );
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-10 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mt-8 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="my-4 leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-6 border-l-4 border-black/10 dark:border-white/20 pl-4 italic text-gray-700 dark:text-gray-300">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="my-4 list-disc pl-6 space-y-2">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="my-4 list-decimal pl-6 space-y-2">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="rounded bg-black/[.05] dark:bg-white/[.07] px-1.5 py-0.5 text-sm">
        {children}
      </code>
    ),
    link: ({ value, children }: any) => {
      const href = value?.href || "#";
      return (
        <a
          href={href}
          className="underline decoration-dotted underline-offset-4 hover:decoration-solid"
          rel="noreferrer noopener"
          target={href.startsWith("http") ? "_blank" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

const CaseStudyPage = ({ caseStudy }: any) => {
  const router = useRouter();
  if (router.isFallback) {
    return (
      <article className="p-6">
        <h1 className="text-2xl font-semibold">Loading…</h1>
      </article>
    );
  }

  const {
    title = "Missing title",
    clientName,
    projectPeriod,
    disciplines,
    heroImage,
    intro = [],
    clientOverview = [],
    sections = [],
    metrics = [],
    gallery = [],
    role,
    result,
    name = "Missing name",
    authorSlug,
    authorImage,
    categories,
    publishedDate,
  } = caseStudy;

  return (
    <article className="mx-auto max-w-3xl">
      <header className="space-y-3 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          {clientName ? (
            <span className="font-medium">Client: {clientName}</span>
          ) : null}
          {projectPeriod ? (
            <>
              <span aria-hidden="true">•</span>
              <span>{projectPeriod}</span>
            </>
          ) : null}
          {publishedDate ? (
            <>
              <span aria-hidden="true">•</span>
              <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
            </>
          ) : null}
          {result?.url ? (
            <>
              <span aria-hidden="true">•</span>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-4 decoration-dotted hover:decoration-solid"
              >
                {result.label || "View result"}
              </a>
            </>
          ) : null}
        </div>

        {disciplines && disciplines.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {disciplines.map((d: string) => (
              <li
                key={d}
                className="rounded-full bg-black/[.05] dark:bg-white/[.08] px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
              >
                {d}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {heroImage ? (
        <img
          src={urlFor(heroImage).width(1200).height(628).fit("max").auto("format").url()}
          alt={title}
          className="w-full h-auto rounded-lg my-6 shadow-sm"
        />
      ) : null}

      {intro && (intro as any[]).length > 0 ? (
        <section className="text-[17px] leading-relaxed mb-10">
          <PortableText value={intro} components={ptComponents as any} />
        </section>
      ) : null}

      {clientOverview && (clientOverview as any[]).length > 0 ? (
        <section className="text-[17px] leading-relaxed mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            Client overview
          </h2>
          <PortableText value={clientOverview} components={ptComponents as any} />
        </section>
      ) : null}

      {sections && sections.length > 0 ? (
        <section className="space-y-10 mb-10">
          {sections.map((s: any, idx: number) => (
            <div key={idx} className="space-y-4">
              {s.heading ? (
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {s.heading}
                </h2>
              ) : null}
              {s.content ? (
                <div className="text-[17px] leading-relaxed">
                  <PortableText value={s.content} components={ptComponents as any} />
                </div>
              ) : null}
              {Array.isArray(s.media) && s.media.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {s.media.map((m: any, i: number) => {
                    if (m._type === 'mux.video' || m?.asset?.playbackId) {
                      const playbackId = m?.asset?.playbackId || (m?.asset?._ref ?? null);
                      return (
                        <div key={i} className="my-4">
                          <MuxPlayer playbackId={playbackId} />
                        </div>
                      );
                    }
                    return (
                      <figure key={i}>
                        <img
                          src={urlFor(m).width(1200).fit("max").auto("format").url()}
                          alt={m.alt || " "}
                          className="w-full h-auto rounded-md"
                          loading="lazy"
                        />
                        {m.caption ? (
                          <figcaption className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {m.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {metrics && metrics.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            Metrics
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {metrics.map((m: any, idx: number) => (
              <div
                key={`${m.label}-${idx}`}
                className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-white/5"
              >
                <dt className="text-sm text-gray-600 dark:text-gray-400">{m.label}</dt>
                <dd className="text-xl font-semibold">{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {gallery && gallery.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">
            Gallery
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery.map((g: any, idx: number) => (
              <img
                key={idx}
                src={urlFor(g).width(1200).fit("max").auto("format").url()}
                alt={g.alt || " "}
                className="w-full h-auto rounded-md"
                loading="lazy"
              />
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-12 border-t border-black/10 dark:border-white/10 pt-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          {authorSlug ? (
            <Link
              href={`/author/${encodeURIComponent(authorSlug)}`}
              className="flex items-center gap-2 hover:underline underline-offset-4 decoration-dotted"
            >
              {authorImage ? (
                <img
                  src={urlFor(authorImage).width(56).height(56).fit("crop").url()}
                  alt={`${name}'s picture`}
                  className="size-7 rounded-full object-cover"
                />
              ) : null}
              <span className="font-medium">{name}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {authorImage ? (
                <img
                  src={urlFor(authorImage).width(56).height(56).fit("crop").url()}
                  alt={`${name}'s picture`}
                  className="size-7 rounded-full object-cover"
                />
              ) : null}
              <span className="font-medium">{name}</span>
            </div>
          )}
          {role ? (
            <>
              <span aria-hidden="true">•</span>
              <span>Role: {role}</span>
            </>
          ) : null}
        </div>

        {categories && categories.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((category: string) => (
              <li
                key={category}
                className="rounded-full bg-black/[.05] dark:bg-white/[.08] px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
              >
                {category}
              </li>
            ))}
          </ul>
        ) : null}
      </footer>
    </article>
  );
};

const query = groq`*[_type == "caseStudy" && slug.current == $slug][0]{
  title,
  clientName,
  projectPeriod,
  disciplines,
  heroImage,
  intro[]{
    ...,
    _type == "mux.video" => {
      "asset": asset->{
        playbackId,
        assetId,
        filename,
        status
      }
    }
  },
  clientOverview[]{
    ...,
    _type == "mux.video" => {
      "asset": asset->{
        playbackId,
        assetId,
        filename,
        status
      }
    }
  },
  "sections": sections[]{
    heading,
    content[]{
      ...,
      _type == "mux.video" => {
        "asset": asset->{
          playbackId,
          assetId,
          filename,
          status
        }
      }
    },
    "media": media[]{
      ...,
      _type == "mux.video" => {
        "asset": asset->{
          playbackId,
          assetId,
          filename,
          status
        }
      }
    }
  },
  "metrics": metrics[]{label, value},
  "gallery": gallery[],
  role,
  result,
  "name": author->name,
  "authorSlug": author->slug.current,
  "authorImage": author->image,
  "categories": categories[]->title,
  publishedAt,
  "publishedDate": coalesce(publishedAt, _createdAt)
}`;

export async function getStaticPaths() {
  const paths: string[] = await client.fetch(
    groq`*[_type == "caseStudy" && defined(slug.current)][].slug.current`
  );
  return {
    paths: paths.map((slug: string) => ({ params: { slug } })),
    fallback: true,
  };
}

export async function getStaticProps(context: any) {
  const { slug = "" } = (context.params || {}) as { slug?: string };
  const caseStudy = await client.fetch(query, { slug });

  if (!caseStudy) {
    return { notFound: true };
  }

  return {
    props: { caseStudy },
    revalidate: 60,
  };
}

export default CaseStudyPage;
