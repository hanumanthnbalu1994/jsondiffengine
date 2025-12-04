"use client";

import { useEffect } from "react";

export default function Footer() {
  useEffect(() => {
    // Fetch and increment visit count from API
    const trackVisit = async () => {
      try {
        const response = await fetch("/api/visits", {
          method: "POST",
        });

        if (response.ok) {
          await response.json();
        }
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };

    trackVisit();
  }, []);

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Made by section */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>by</span>
            <span className="font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              HNB
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
