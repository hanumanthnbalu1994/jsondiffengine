"use client";

import JsonEscapeUnescape from "@/components/JsonEscapeUnescape";

export default function EscapePage() {
    return (
        <div className="w-full max-w-7xl flex-1 p-5 md:p-12">
            <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent animate-in fade-in duration-1000">
                    JSON Escape/Unescape
                </h1>
                <p className="text-muted-foreground text-lg mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                    Escape or unescape JSON special characters with preview.
                </p>
            </div>
            <JsonEscapeUnescape />
        </div>
    );
}
