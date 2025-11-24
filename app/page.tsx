"use client";

import { useState } from "react";
import SplitDiffView from "@/components/SplitDiffView";
import JsonFormatter from "@/components/JsonFormatter";
import Navigation from "@/components/Navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { GitCompare, FileJson } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<"diff" | "formatter">("diff");

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
    name: "JSON Diff Engine",
    description:
      "Free online tool to compare and visualize differences between JSON files",
    url: "https://jsondiffengine.com",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Side-by-side JSON comparison",
      "Syntax highlighting",
      "Real-time validation",
      "File upload support",
      "Dark mode",
      "JSON formatting",
    ],
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

        <Navigation />

        <div className="w-full max-w-7xl flex-1 p-5 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
              {mode === "diff" ? "Compare JSON" : "JSON Formatter"}
            </h1>
            <p className="text-muted-foreground mb-4">
              {mode === "diff"
                ? "Paste your JSON below to see the differences."
                : "Format, validate, and minify your JSON with ease."}
            </p>

            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-2 bg-muted/50 p-1 rounded-lg inline-flex">
              <Button
                variant={mode === "diff" ? "secondary" : "ghost"}
                onClick={() => setMode("diff")}
                size="sm"
                className="h-9 px-4 gap-2"
              >
                <GitCompare size={16} />
                JSON Diff
              </Button>
              <Button
                variant={mode === "formatter" ? "secondary" : "ghost"}
                onClick={() => setMode("formatter")}
                size="sm"
                className="h-9 px-4 gap-2"
              >
                <FileJson size={16} />
                Formatter
              </Button>
            </div>
          </div>

          {mode === "diff" ? (
            <SplitDiffView initialOld={sampleOld} initialNew={sampleNew} />
          ) : (
            <JsonFormatter />
          )}
        </div>
      </main>
    </>
  );
}
