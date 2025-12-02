"use client";

import JsonFormatter from "@/components/JsonFormatter";

export default function FormatterPage() {
    return (
        <div className="w-full max-w-7xl flex-1 p-5 md:p-12">
            <div className="mb-8 text-center relative overflow-hidden p-12 md:p-16">
                {/* Modern JSON brackets pattern */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none font-mono">
                    <div className="text-7xl md:text-9xl flex items-center gap-4">
                        <span className="text-primary">{"{"}</span>
                        <span className="text-fuchsia-500 text-6xl md:text-8xl">{"["}</span>
                        <span className="text-cyan-500 text-5xl md:text-7xl">{"{"}</span>
                        <span className="text-purple-500 text-4xl md:text-6xl">{"\""}</span>
                        <span className="text-purple-500 text-4xl md:text-6xl">{"\""}</span>
                        <span className="text-cyan-500 text-5xl md:text-7xl">{"}"}</span>
                        <span className="text-fuchsia-500 text-6xl md:text-8xl">{"]"}</span>
                        <span className="text-primary">{"}"}</span>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent relative z-10">
                    JSON Formatter
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto relative z-10">
                    Format, validate, and beautify your JSON data
                </p>
            </div>
            <JsonFormatter />
        </div>
    );
}
