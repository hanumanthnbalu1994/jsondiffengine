"use client";

import SplitDiffView from "@/components/SplitDiffView";

export default function DiffPage() {
    const sampleOld = JSON.stringify(
        {
            name: "Hanumanthappa N B",
            company: "Grasko",
            role: "Software Developer",
            skills: ["React", "Node.js"],
        },
        null,
        2
    );

    const sampleNew = JSON.stringify(
        {
            name: "Hanumanthappa N B",
            company: "Grasko Solutions",
            role: "Software Developer",
            skills: [
                "React",
                "Node.js",
                "Next.js",
                "Angular",
                "MEAN Stack",
                "MERN Stack",
            ],
            active: true,
        },
        null,
        2
    );

    return (
        <div className="w-full max-w-7xl flex-1 p-5 md:p-12">
            <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent animate-in fade-in duration-1000">
                    Compare JSON
                </h1>
                <p className="text-muted-foreground text-lg mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                    Paste your JSON below to see the differences.
                </p>
            </div>
            <SplitDiffView initialOld={sampleOld} initialNew={sampleNew} />
        </div>
    );
}
