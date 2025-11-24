"use client";

import SplitDiffView from "@/components/SplitDiffView";
import { ModeToggle } from "@/components/mode-toggle";
import Script from "next/script";

export default function Home() {
  const sampleOld = JSON.stringify(
    {
      name: "Hanumanthappa N B",
      age: 30,
      role: "Software Developer",
      skills: ["React", "Node.js"],
    },
    null,
    2
  );

  const sampleNew = JSON.stringify(
    {
      name: "Hanumanthappa N B",
      age: 31,
      role: "Software Developer",
      skills: ["React", "Node.js", "Next.js"],
      active: true,
    },
    null,
    2
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JSON Diff Engine",
    "description": "Free online tool to compare and visualize differences between JSON files",
    "url": "https://jsondiffengine.com",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "featureList": [
      "Side-by-side JSON comparison",
      "Syntax highlighting",
      "Real-time validation",
      "File upload support",
      "Dark mode",
      "JSON formatting"
    ]
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="flex min-h-screen flex-col items-center bg-background text-foreground relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-8">
            <div className="flex items-center gap-3 font-bold tracking-tight">
              <img src="/logo.png" alt="JSON Diff Engine Logo" className="h-8 w-8" />
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                JSON Diff Engine
              </span>
            </div>
            <ModeToggle />
          </div>
        </div>

        <div className="w-full max-w-7xl flex-1 p-5 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              Compare JSON
            </h1>

            <p className="text-muted-foreground">
              Paste your JSON below to see the differences.
            </p>
          </div>
          <SplitDiffView initialOld={sampleOld} initialNew={sampleNew} />
        </div>
      </main>
    </>
  );
}
