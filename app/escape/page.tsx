"use client";

import JsonEscapeUnescape from "@/components/JsonEscapeUnescape";

export default function EscapePage() {
  return (
    <div className="w-full max-w-7xl flex-1 p-5 md:p-12">
      <div className="mb-8 text-center relative overflow-hidden p-12 md:p-16">
        {/* Modern escape characters pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none font-mono">
          <div className="grid grid-cols-5 gap-6 text-4xl md:text-6xl">
            <span className="text-cyan-500">\\n</span>
            <span className="text-primary">\\t</span>
            <span className="text-fuchsia-500">\\r</span>
            <span className="text-cyan-500">\\&quot;</span>
            <span className="text-primary">\\\\</span>
            <span className="text-fuchsia-500">\\b</span>
            <span className="text-cyan-500">\\f</span>
            <span className="text-primary">\\u</span>
            <span className="text-fuchsia-500">\\/</span>
            <span className="text-cyan-500">\\0</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent relative z-10">
          JSON Escape/Unescape
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto relative z-10">
          Escape or unescape JSON strings with special characters like quotes, newlines, and tabs.
          Perfect for preparing JSON for APIs or &ldquo;cleaning&rdquo; escaped data.
        </p>
      </div>
      <JsonEscapeUnescape />
    </div>
  );
}
