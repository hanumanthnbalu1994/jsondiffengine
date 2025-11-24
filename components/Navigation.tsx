"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navigation() {
    return (
        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-8">
                <Link href="/" className="flex items-center gap-3 font-bold tracking-tight">
                    <img src="/logo.png" alt="JSON Diff Engine Logo" className="h-8 w-8" />
                    <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                        JSON Diff Engine
                    </span>
                </Link>

                <ModeToggle />
            </div>
        </div>
    );
}
