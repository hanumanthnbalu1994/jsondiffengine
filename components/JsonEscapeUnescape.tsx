"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  Copy,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Download,
  ArrowLeftRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import JsonTreeView from "@/components/JsonTreeView";

export default function JsonEscapeUnescape() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("unescape");
  const [error, setError] = useState<string | null>(null);
  const [formattedJsonOutput, setFormattedJsonOutput] = useState<any>(null);

  // Tree View Controls
  const [expandAllTrigger, setExpandAllTrigger] = useState(0);
  const [shouldExpand, setShouldExpand] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escape special characters for JSON
  const escapeJson = (str: string): string => {
    return str
      .replace(/\\\\/g, "\\") // unescape backslash first
      .replace(/\\"/g, '"') // unescape quotes
      .replace(/\\n/g, "\n") // unescape newline
      .replace(/\\r/g, "\r") // unescape carriage return
      .replace(/\\t/g, "\t") // unescape tab
      .replace(/\\b/g, "\b") // unescape backspace
      .replace(/\\f/g, "\f"); // unescape form feed
  };

  // Unescape JSON escaped characters
  const unescapeJson = (str: string): string => {
    try {
      // Use JSON.parse with a wrapper to properly unescape
      return JSON.parse(`"${str}"`);
    } catch (_e) {
      // If JSON.parse fails, try manual unescaping
      return str
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\b/g, "\b")
        .replace(/\\f/g, "\f")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
  };

  // Auto-process when input or mode changes
  useEffect(() => {
    if (!inputText.trim()) {
      setFormattedJsonOutput(null);
      setError(null);
      return;
    }

    try {
      if (mode === "escape") {
        const escaped = escapeJson(inputText);
        // Create JSON object with escaped string
        const jsonObj = {
          escaped: escaped,
          original: inputText,
          length: escaped.length,
          originalLength: inputText.length,
        };
        setFormattedJsonOutput(jsonObj);
      } else {
        const unescaped = unescapeJson(inputText);
        // Try to parse the unescaped result as JSON
        try {
          const parsed = JSON.parse(unescaped);
          setFormattedJsonOutput(parsed);
        } catch (_parseError) {
          // If not valid JSON, show as object with the unescaped string
          const jsonObj = {
            unescaped: unescaped,
            original: inputText,
            length: unescaped.length,
            originalLength: inputText.length,
          };
          setFormattedJsonOutput(jsonObj);
        }
      }
      setError(null);
    } catch (_e) {
      setError(`Failed to ${mode} text`);
      setFormattedJsonOutput(null);
    }
  }, [inputText, mode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    if (!formattedJsonOutput) {
      return;
    }
    const jsonString = JSON.stringify(formattedJsonOutput, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode}d-result.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText("");
    setFormattedJsonOutput(null);
    setError(null);
  };

  const toggleMode = () => {
    setMode(mode === "escape" ? "unescape" : "escape");
  };

  const handleExpandAll = () => {
    setShouldExpand(true);
    setExpandAllTrigger((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setShouldExpand(false);
    setExpandAllTrigger((prev) => prev + 1);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full gap-0 relative">
        {/* Sticky Toolbar */}
        <div className="sticky top-14 z-20 bg-background border-b border-border/40 pb-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg shadow-sm">
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMode}
                    className="h-9 gap-2 px-3 touch-target transition-smooth"
                  >
                    <ArrowLeftRight size={16} />
                    <span className="hidden sm:inline">
                      Switch to {mode === "escape" ? "Unescape" : "Escape"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle between Escape and Unescape modes</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-9 gap-2 px-3 text-destructive hover:text-destructive touch-target transition-smooth"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear All</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              {formattedJsonOutput && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="h-8 gap-2"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Download JSON</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download as JSON</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {/* <div className="mb-4 p-4 bg-muted/30 border border-border/40 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FileText size={16} />
            JSON Escape Sequences
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
            <div>
              <code className="bg-background px-1 rounded">\b</code> → Backspace
            </div>
            <div>
              <code className="bg-background px-1 rounded">\f</code> → Form feed
            </div>
            <div>
              <code className="bg-background px-1 rounded">\n</code> → Newline
            </div>
            <div>
              <code className="bg-background px-1 rounded">\r</code> → Carriage
              return
            </div>
            <div>
              <code className="bg-background px-1 rounded">\t</code> → Tab
            </div>
            <div>
              <code className="bg-background px-1 rounded">\"</code> → Double
              quote
            </div>
            <div>
              <code className="bg-background px-1 rounded">\\</code> → Backslash
            </div>
          </div>
        </div> */}

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 min-h-[600px] md:h-[700px] font-mono text-sm">
          {/* Left: Input Pane */}
          <div
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200",
              error
                ? "border-red-500/50 ring-1 ring-red-500/20"
                : "border-border/40 hover:border-border/80"
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Input ({mode === "escape" ? "Plain Text" : "Escaped Text"})
                </span>
                {error && (
                  <span className="text-[10px] font-medium text-red-500 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                    <AlertCircle size={10} /> Error
                  </span>
                )}
                {!error && inputText.trim() && (
                  <span className="text-[10px] font-medium text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 size={10} /> Ready
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt,.json"
                  onChange={handleFileUpload}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload File</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 group bg-background/50">
              <Textarea
                className="flex-1 resize-none border-0 focus-visible:ring-0 p-4 bg-transparent font-mono text-sm leading-relaxed"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  mode === "escape"
                    ? 'Enter plain text with special characters...\n\nExample:\nHello "World"\nThis is a new line\tWith tab'
                    : 'Enter JSON escaped text...\n\nExample:\nHello \\"World\\"\nThis is a new line\\tWith tab'
                }
                spellCheck={false}
              />

              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                onClick={() => handleCopy(inputText)}
                title="Copy"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          {/* Right: JSON Formatter Output */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm hover:border-border/80 transition-all duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  JSON Output
                </span>
                {formattedJsonOutput && (
                  <span className="text-[10px] font-medium text-blue-500 flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 size={10} /> Valid JSON
                  </span>
                )}
              </div>
              {formattedJsonOutput && (
                <div className="flex items-center gap-1 ml-2 border-l border-border/40 pl-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExpandAll}
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCollapseAll}
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Collapse All
                  </Button>
                </div>
              )}
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 group bg-background/50">
              {formattedJsonOutput ? (
                <div className="flex-1 overflow-auto p-4">
                  <JsonTreeView
                    data={formattedJsonOutput}
                    className="h-full"
                    expandAllTrigger={expandAllTrigger}
                    shouldExpand={shouldExpand}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
                  {mode === "escape"
                    ? "Escaped JSON will appear here as a formatted tree view..."
                    : "Unescaped JSON will appear here as a formatted tree view..."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
