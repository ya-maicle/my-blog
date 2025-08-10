import groq from "groq";
import imageUrlBuilder from "@sanity/image-url";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
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
    // Legacy inline mux.video blocks (older content)
    'mux.video': ({ value }: any) => {
      const playbackId =
        value?.asset?.playbackId ||
        value?.asset?.playback_id; /* tolerate variations */
      if (!playbackId) return null;
      const isBackground = !!value?.background;
      return (
        <div className="my-6">
          <MuxPlayer
            playbackId={playbackId}
            className="w-full rounded-md"
            autoPlay={isBackground}
            loop={isBackground}
            muted={isBackground}
            playsInline
            noControls={isBackground}
            style={{ objectFit: "cover", ...(isBackground ? { width: "100%" } : {}) } as any}
          />
        </div>
      );
    },

    // New block type used in blockContent: an object with fields { muxVideo, background }
    muxVideoBlock: ({ value }: any) => {
      const playbackId =
        value?.muxVideo?.asset?.playbackId ||
        value?.muxVideo?.playbackId ||
        value?.asset?.playbackId;
      if (!playbackId) return null;
      const isBackground = !!value?.background;
      return (
        <div className="my-6">
          <MuxPlayer
            playbackId={playbackId}
            className="w-full rounded-md"
            autoPlay={isBackground}
            loop={isBackground}
            muted={isBackground}
            playsInline
            noControls={isBackground}
            style={{ objectFit: "cover", ...(isBackground ? { width: "100%" } : {}) } as any}
          />
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

const Post = ({ post }: any) => {
  if (!post) {
    return (
      <article className="p-6">
        <h1 className="text-2xl font-semibold">Loading…</h1>
      </article>
    );
  }

  const {
    title = "Missing title",
    name = "Missing name",
    authorSlug,
    categories,
    authorImage,
    mainImage,
    video,
    publishedDate,
    body = [],
  } = post;

  return (
    <article className="mx-auto max-w-3xl">
      <header className="space-y-3 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>

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
          {publishedDate ? (
            <>
              <span aria-hidden="true">•</span>
              <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
            </>
          ) : null}
        </div>

        {categories && categories.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-2">
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
      </header>

      {(() => {
        // support multiple shapes:
        // - legacy: post.video.playbackId
        // - new top-level shape: post.video.playbackId OR post.video.muxVideo.asset.playbackId
        const topPlaybackId =
          post?.video?.playbackId ||
          post?.video?.muxVideo?.asset?.playbackId ||
          post?.video?.muxVideo?.playbackId;
        const topBackground = post?.video?.background ?? false;
        if (!topPlaybackId) return null;
        return (
          <MuxPlayer
            playbackId={topPlaybackId}
            className="w-full my-6 rounded-lg"
            autoPlay={topBackground}
            loop={topBackground}
            muted={topBackground}
            playsInline
            noControls={topBackground}
            style={{ objectFit: "cover" } as any}
          />
        );
      })()}

      {mainImage ? (
        <img
          src={urlFor(mainImage).width(1200).height(628).fit("max").auto("format").url()}
          alt={title}
          className="w-full h-auto rounded-lg my-6 shadow-sm"
        />
      ) : null}

      <section className="text-[17px] leading-relaxed">
        <PortableText value={body} components={ptComponents as any} />
      </section>
    </article>
  );
};

const query = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  "name": author->name,
  "authorSlug": author->slug.current,
  "categories": categories[]->title,
  "authorImage": author->image,
  mainImage,
  publishedAt,
  "publishedDate": coalesce(publishedAt, _createdAt),
  "video": {
    "playbackId": video.asset->playbackId,
    "assetId": video.asset->assetId,
    "filename": video.asset->filename,
    "status": video.asset->status,
    "background": coalesce(videoBackground, false)
  },
  body[]{
    ...,
    "asset": select(_type == "mux.video" => asset->{
      playbackId,
      assetId,
      filename,
      status
    }),
    "muxVideo": select(_type == "muxVideoBlock" => muxVideo.asset->{
      playbackId,
      assetId,
      filename,
      status
    }),
    "background": select(_type == "muxVideoBlock" => coalesce(background, false))
  }
}`;

export async function getStaticPaths() {
  const paths: string[] = await client.fetch(
    groq`*[_type == "post" && defined(slug.current)][].slug.current`
  );
  return {
    paths: paths.map((slug: string) => ({ params: { slug } })),
    fallback: true,
  };
}

export async function getStaticProps(context: any) {
  const { slug = "" } = (context.params || {}) as { slug?: string };
  const post = await client.fetch(query, { slug });
  return {
    props: { post },
    revalidate: 60,
  };
}

export default Post;
