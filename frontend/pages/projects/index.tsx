import Link from "next/link";
import groq from "groq";
import imageUrlBuilder from "@sanity/image-url";
import client from "../../client";

const builder = imageUrlBuilder(client);
function urlFor(source: any) {
  return builder.image(source);
}

type CaseStudy = {
  _id: string;
  title?: string;
  slug?: string;
  clientName?: string;
  projectPeriod?: string;
  disciplines?: string[];
  heroImage?: any;
  publishedAt?: string;
};

export default function ProjectsIndex({ caseStudies }: { caseStudies: CaseStudy[] }) {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Published case studies showcasing product design work.
        </p>
      </header>

      {caseStudies && caseStudies.length > 0 ? (
        <ul className="grid gap-4">
          {caseStudies.map((cs) =>
            cs.slug ? (
              <li key={cs._id}>
                <Link
                  href={`/projects/${encodeURIComponent(cs.slug)}`}
                  className="group block rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white shadow-sm hover:shadow-md transition p-4 sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    {cs.heroImage ? (
                      <img
                        src={urlFor(cs.heroImage).width(240).height(135).fit("crop").auto("format").url()}
                        alt={cs.title || "Cover"}
                        className="hidden sm:block w-40 h-24 rounded-md object-cover shrink-0"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg sm:text-xl font-semibold tracking-tight group-hover:underline">
                          {cs.title || "(untitled)"}
                        </h2>
                        {cs.projectPeriod ? (
                          <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                            {cs.projectPeriod}
                          </span>
                        ) : null}
                      </div>
                      {cs.clientName ? (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Client: {cs.clientName}
                        </p>
                      ) : null}
                      {cs.disciplines && cs.disciplines.length > 0 ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {cs.disciplines.map((d) => (
                            <li
                              key={d}
                              className="rounded-full bg-black/[.05] dark:bg-white/[.08] px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-200"
                            >
                              {d}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ) : null
          )}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-black/10 dark:border-white/10 p-6 text-center text-gray-600 dark:text-gray-400">
          No case studies yet. Publish one in your Sanity Studio.
        </div>
      )}
    </section>
  );
}

export async function getStaticProps() {
  const caseStudies: CaseStudy[] = await client.fetch(
    groq`*[_type == "caseStudy" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc){
      _id,
      title,
      "slug": slug.current,
      clientName,
      projectPeriod,
      disciplines,
      heroImage,
      publishedAt
    }`
  );

  return {
    props: { caseStudies },
    revalidate: 60,
  };
}
