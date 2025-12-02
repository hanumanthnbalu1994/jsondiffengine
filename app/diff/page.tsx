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
            <div className="mb-8 text-center relative overflow-hidden p-12 md:p-16">
                {/* Split comparison pattern - more visible */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Left side - deletions */}
                    <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center opacity-10">
                        <div className="flex flex-col gap-4 text-7xl md:text-9xl font-bold text-red-500">
                            <span>-</span>
                            <span>-</span>
                            <span>-</span>
                        </div>
                    </div>

                    {/* Center divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

                    {/* Right side - additions */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center opacity-10">
                        <div className="flex flex-col gap-4 text-7xl md:text-9xl font-bold text-green-500">
                            <span>+</span>
                            <span>+</span>
                            <span>+</span>
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent relative z-10">
                    Compare JSON
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto relative z-10">
                    Visualize differences with side-by-side comparison
                </p>
            </div>
            <SplitDiffView initialOld={sampleOld} initialNew={sampleNew} />
        </div>
    );
}
