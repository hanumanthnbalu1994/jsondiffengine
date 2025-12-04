"use client";

import SpreadsheetViewer from "@/components/SpreadsheetViewer";

export default function SpreadsheetPage() {
  return (
    <div className="w-full max-w-7xl flex-1 p-5 md:p-12">
      <div className="mb-8 text-center relative overflow-hidden p-12 md:p-16">
        {/* Table/Grid pattern background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
          <div className="grid grid-cols-5 gap-4 text-5xl md:text-7xl">
            {/* Row 1 */}
            <div className="border-2 border-primary w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-fuchsia-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-cyan-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-purple-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-primary w-16 h-16 md:w-20 md:h-20 rounded" />
            {/* Row 2 */}
            <div className="border-2 border-cyan-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-purple-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-primary w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-fuchsia-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-cyan-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            {/* Row 3 */}
            <div className="border-2 border-purple-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-primary w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-fuchsia-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-cyan-500 w-16 h-16 md:w-20 md:h-20 rounded" />
            <div className="border-2 border-purple-500 w-16 h-16 md:w-20 md:h-20 rounded" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent relative z-10">
          Spreadsheet Viewer
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto relative z-10">
          Import, view, edit, and export CSV and Excel files
        </p>
      </div>
      <SpreadsheetViewer />
    </div>
  );
}
