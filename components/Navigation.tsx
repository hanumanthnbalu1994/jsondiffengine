"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { GitCompare, FileJson, Quote, Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export default function Navigation() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const routes = [
        {
            href: "/diff",
            label: "JSON Diff",
            icon: GitCompare,
            active: pathname === "/diff" || pathname === "/",
        },
        {
            href: "/formatter",
            label: "Formatter",
            icon: FileJson,
            active: pathname === "/formatter",
        },
        {
            href: "/escape",
            label: "Escape/Unescape",
            icon: Quote,
            active: pathname === "/escape",
        },
    ];

    return (
        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center gap-3 font-bold tracking-tight">
                    <img src="/logo.png" alt="JSON Diff Engine Logo" className="h-8 w-8" />
                    <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent hidden sm:inline-block">
                        JSON Diff Engine
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {routes.map((route) => (
                        <Link key={route.href} href={route.href}>
                            <Button
                                variant={route.active ? "default" : "ghost"}
                                size="sm"
                                className={`gap-2 relative transition-all ${route.active
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "hover:bg-accent"
                                    }`}
                            >
                                <route.icon size={16} />
                                {route.label}
                                {route.active && (
                                    <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                                )}
                            </Button>
                        </Link>
                    ))}
                    <div className="ml-2 pl-2 border-l border-border/40">
                        <ModeToggle />
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <div className="flex md:hidden items-center gap-2">
                    <ModeToggle />
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <Menu size={20} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                            <div className="mt-8">
                                <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-3">
                                    Navigation
                                </h2>
                                <nav className="flex flex-col gap-1">
                                    {routes.map((route) => (
                                        <Link
                                            key={route.href}
                                            href={route.href}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Button
                                                variant={route.active ? "default" : "ghost"}
                                                className={`w-full justify-start gap-3 h-12 relative transition-all ${route.active
                                                        ? "bg-primary text-primary-foreground shadow-sm"
                                                        : "hover:bg-accent"
                                                    }`}
                                            >
                                                {route.active && (
                                                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full" />
                                                )}
                                                <route.icon size={18} className={route.active ? "ml-2" : ""} />
                                                <span className="font-medium">{route.label}</span>
                                            </Button>
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    );
}

