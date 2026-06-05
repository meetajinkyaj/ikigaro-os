import { createFileRoute } from "@tanstack/react-router";
import heroImage from "../assets/ikigaro-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ikigaro OS — Launching Soon" },
      {
        name: "description",
        content:
          "Ikigaro OS — the operating system for performance, recovery, and longevity. An exclusive wellness retreat rooted in ikigai. Launching soon.",
      },
      { property: "og:title", content: "Ikigaro OS — Launching Soon" },
      {
        property: "og:description",
        content:
          "The operating system for performance, recovery, and longevity. Home of the Superhuman Protocol.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const OFFERINGS = [
  "Performance Training",
  "Biomarkers & Diagnostics",
  "Ice Bath",
  "Sauna",
  "Steam Room",
  "Deep Tissue Massage",
  "Red Light Therapy",
  "Yoga",
  "Pilates",
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero — split screen */}
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Left: imagery */}
        <div className="relative h-[60vh] overflow-hidden lg:h-screen">
          <img
            src={heroImage}
            alt="A sunlit wellness retreat — sauna, stone, and ice bath at golden hour"
            width={1280}
            height={1600}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background/30" />
          <div className="absolute left-6 top-6 lg:left-10 lg:top-10">
            <span className="font-display text-xs uppercase tracking-[0.3em] text-background/90 lg:text-foreground/80">
              Ikigaro Club
            </span>
          </div>
        </div>

        {/* Right: statement */}
        <div className="flex flex-col justify-between px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
          <header className="flex items-center justify-between">
            <div className="font-display text-lg font-medium tracking-tight">
              Ikigaro<span className="text-muted-foreground"> OS</span>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              Launching Soon
            </div>
          </header>

          <main className="max-w-xl py-16 lg:py-0">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
              The Superhuman Protocol
            </p>
            <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              The operating system for{" "}
              <span className="italic text-primary">performance</span>,{" "}
              <span className="italic text-primary">recovery</span> &{" "}
              <span className="italic text-primary">longevity</span>.
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Rooted in <em className="not-italic font-medium text-foreground">ikigai</em> — your reason for being. Ikigaro is an exclusive wellness retreat designed to engineer meaning, community, and a longer, stronger life.
            </p>

            <div className="mt-12 border-t border-border pt-8">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Inside the Retreat
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm text-foreground/80">
                {OFFERINGS.map((item, i) => (
                  <li key={item} className="flex items-center gap-3">
                    <span>{item}</span>
                    {i < OFFERINGS.length - 1 && (
                      <span aria-hidden className="text-accent">·</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </main>

          {/* Contact footer */}
          <footer className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Contact Us
              </p>
              <a
                href="mailto:hello@ikigaro.com"
                className="mt-2 inline-block font-display text-2xl font-light tracking-tight text-foreground underline decoration-accent decoration-2 underline-offset-[6px] transition-colors hover:text-primary"
              >
                hello@ikigaro.com
              </a>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              © {new Date().getFullYear()} Ikigaro Club
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}
