"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { diffLines, Change } from "diff";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  Copy,
  AlertCircle,
  CheckCircle2,
  Play,
  FileJson,
  ArrowRightLeft,
  Trash2,
  FileType,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SplitDiffViewProps {
  initialOld: string;
  initialNew: string;
}

export default function SplitDiffView({
  initialOld,
  initialNew,
}: SplitDiffViewProps) {
  const [oldText, setOldText] = useState(initialOld);
  const [newText, setNewText] = useState(initialNew);
  const [mode, setMode] = useState<"edit" | "diff">("edit"); // Default to edit mode
  const [errors, setErrors] = useState<{
    old: string | null;
    new: string | null;
  }>({
    old: null,
    new: null,
  });

  const oldFileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Refs for sync scrolling
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<"left" | "right" | null>(null);

  // Ref for change navigation
  const changeRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // State for scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate JSON on change
  useEffect(() => {
    let oldErr = null;
    let newErr = null;

    try {
      if (oldText.trim()) JSON.parse(oldText);
    } catch (e) {
      oldErr = "Invalid JSON";
    }

    try {
      if (newText.trim()) JSON.parse(newText);
    } catch (e) {
      newErr = "Invalid JSON";
    }

    setErrors({ old: oldErr, new: newErr });
  }, [oldText, newText]);

  const diffs = useMemo(() => {
    // Only compute diffs if we are in diff mode
    if (mode === "edit") return [];
    return diffLines(oldText, newText);
  }, [oldText, newText, mode]);

  // Process diffs into side-by-side lines with alignment
  const rows = useMemo(() => {
    if (mode === "edit") return [];
    const lines: {
      left?: { text: string; type: "removed" | "unchanged" | "empty" };
      right?: { text: string; type: "added" | "unchanged" | "empty" };
    }[] = [];

    let i = 0;
    while (i < diffs.length) {
      const part = diffs[i];

      if (part.removed) {
        // Check if next part is added (modification)
        if (i + 1 < diffs.length && diffs[i + 1].added) {
          const nextPart = diffs[i + 1];
          const removedLines = part.value.replace(/\n$/, "").split("\n");
          const addedLines = nextPart.value.replace(/\n$/, "").split("\n");

          const maxLines = Math.max(removedLines.length, addedLines.length);

          for (let j = 0; j < maxLines; j++) {
            lines.push({
              left:
                j < removedLines.length
                  ? { text: removedLines[j], type: "removed" }
                  : { text: "", type: "empty" },
              right:
                j < addedLines.length
                  ? { text: addedLines[j], type: "added" }
                  : { text: "", type: "empty" },
            });
          }
          i += 2; // Skip both parts
        } else {
          // Just removed
          const partLines = part.value.replace(/\n$/, "").split("\n");
          partLines.forEach((line) => {
            lines.push({
              left: { text: line, type: "removed" },
              right: { text: "", type: "empty" },
            });
          });
          i++;
        }
      } else if (part.added) {
        // Just added (not following a remove, otherwise caught above)
        const partLines = part.value.replace(/\n$/, "").split("\n");
        partLines.forEach((line) => {
          lines.push({
            left: { text: "", type: "empty" },
            right: { text: line, type: "added" },
          });
        });
        i++;
      } else {
        // Unchanged
        const partLines = part.value.replace(/\n$/, "").split("\n");
        partLines.forEach((line) => {
          lines.push({
            left: { text: line, type: "unchanged" },
            right: { text: line, type: "unchanged" },
          });
        });
        i++;
      }
    }
    return lines;
  }, [diffs, mode]);

  // Calculate change positions for minimap
  const changePositions = useMemo(() => {
    if (mode === "edit") return [];
    const positions: { index: number; type: "added" | "removed" | "modified" }[] = [];

    rows.forEach((row, index) => {
      const hasChange =
        (row.left?.type === "removed" || row.right?.type === "added") &&
        (row.left?.type !== "empty" || row.right?.type !== "empty");

      if (hasChange) {
        const type =
          row.left?.type === "removed" && row.right?.type === "added"
            ? "modified"
            : row.left?.type === "removed"
              ? "removed"
              : "added";
        positions.push({ index, type });
      }
    });

    return positions;
  }, [rows, mode]);

  // Navigate to a specific change
  const scrollToChange = (index: number) => {
    const element = changeRefs.current.get(index);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Track scroll position for scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "old" | "new"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (side === "old") setOldText(content);
        else setNewText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleFormat = () => {
    try {
      if (oldText.trim()) {
        const parsed = JSON.parse(oldText);
        setOldText(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      // Already handled by validation state
    }
    try {
      if (newText.trim()) {
        const parsed = JSON.parse(newText);
        setNewText(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      // Already handled by validation state
    }
  };

  const handleSwap = () => {
    setOldText(newText);
    setNewText(oldText);
  };

  const handleClear = () => {
    setOldText("");
    setNewText("");
    setMode("edit");
  };

  const handleCompare = () => {
    if (!errors.old && !errors.new) {
      setMode("diff");
    }
  };

  const handleScroll = (source: "left" | "right") => {
    if (mode !== "diff") return;

    if (isScrolling.current && isScrolling.current !== source) return;

    isScrolling.current = source;

    const sourceRef = source === "left" ? leftScrollRef : rightScrollRef;
    const targetRef = source === "left" ? rightScrollRef : leftScrollRef;

    if (sourceRef.current && targetRef.current) {
      const sourceViewport = sourceRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      const targetViewport = targetRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;

      if (sourceViewport && targetViewport) {
        targetViewport.scrollTop = sourceViewport.scrollTop;
        targetViewport.scrollLeft = sourceViewport.scrollLeft;
      }
    }

    setTimeout(() => {
      isScrolling.current = null;
    }, 50);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full gap-0 relative">
        {/* Sticky Toolbar - Always at top below Navigation */}
        <div className="sticky top-14 z-20 bg-background border-b border-border/40 pb-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFormat}
                    className="h-8 gap-2"
                  >
                    <FileJson size={14} />
                    <span className="hidden sm:inline">Prettify</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Format JSON</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwap}
                    className="h-8 gap-2"
                  >
                    <ArrowRightLeft size={14} />
                    <span className="hidden sm:inline">Swap</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Swap Left & Right</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear All</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              {mode === "diff" ? (
                <Button
                  variant="secondary"
                  onClick={() => setMode("edit")}
                  className="h-9 px-4 gap-2 font-medium shadow-sm"
                >
                  <FileType size={16} />
                  Back to Edit
                </Button>
              ) : (
                <Button
                  onClick={handleCompare}
                  disabled={
                    !!errors.old ||
                    !!errors.new ||
                    !oldText.trim() ||
                    !newText.trim()
                  }
                  className={cn(
                    "h-9 px-6 gap-2 font-medium shadow-md transition-all",
                    !errors.old && !errors.new && oldText.trim() && newText.trim()
                      ? "bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700 text-white border-0"
                      : ""
                  )}
                >
                  <Play size={16} className="fill-current" />
                  Compare
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Change Minimap - Sticky below toolbar, only show in diff mode */}
        {mode === "diff" && changePositions.length > 0 && (
          <div className="sticky top-[120px] z-10 mb-4 bg-background pt-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 backdrop-blur-sm border border-border/40 rounded-lg shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Changes ({changePositions.length})
              </span>
              <div className="flex-1 flex items-center gap-1 overflow-x-auto">
                {changePositions.map((change, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => scrollToChange(change.index)}
                        className={cn(
                          "h-6 w-1.5 rounded-sm transition-all hover:w-2 hover:h-6",
                          change.type === "added" && "bg-green-500/70 hover:bg-green-500",
                          change.type === "removed" && "bg-red-500/70 hover:bg-red-500",
                          change.type === "modified" && "bg-amber-500/70 hover:bg-amber-500"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-1">
                        <ChevronDown size={12} />
                        Jump to {change.type} line {change.index + 1}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 h-[600px] font-mono text-sm">
          {/* Left Pane */}
          <div
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200",
              errors.old
                ? "border-red-500/50 ring-1 ring-red-500/20"
                : "border-border/40 hover:border-border/80"
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Original
                </span>
                {errors.old && (
                  <span className="text-[10px] font-medium text-red-500 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                    <AlertCircle size={10} /> Invalid
                  </span>
                )}
                {!errors.old && oldText.trim() && (
                  <span className="text-[10px] font-medium text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 size={10} /> Valid
                  </span>
                )}
              </div>
              {mode === "edit" && (
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={oldFileInputRef}
                    className="hidden"
                    accept=".json,.txt"
                    onChange={(e) => handleFileUpload(e, "old")}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => oldFileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload File</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 group bg-background/50">
              {mode === "edit" ? (
                <Textarea
                  className="flex-1 resize-none border-0 focus-visible:ring-0 p-4 bg-transparent font-mono text-sm leading-relaxed"
                  value={oldText}
                  onChange={(e) => setOldText(e.target.value)}
                  placeholder="Paste original JSON here..."
                  spellCheck={false}
                />
              ) : (
                <ScrollArea
                  ref={leftScrollRef}
                  className="flex-1 h-full cursor-text"
                  onScrollCapture={() => handleScroll("left")}
                >
                  <div className="flex flex-col py-2">
                    {rows.map((row, i) => {
                      const hasChange =
                        (row.left?.type === "removed" || row.right?.type === "added") &&
                        (row.left?.type !== "empty" || row.right?.type !== "empty");

                      return (
                        <div
                          key={i}
                          ref={hasChange ? (el) => {
                            if (el) changeRefs.current.set(i, el);
                            else changeRefs.current.delete(i);
                          } : undefined}
                          className="flex min-h-[24px] hover:bg-muted/20 transition-colors"
                        >
                          <div className="w-10 text-[10px] text-muted-foreground/30 text-right pr-3 select-none pt-1">
                            {i + 1}
                          </div>
                          <div
                            className={cn(
                              "flex-1 px-2 whitespace-pre-wrap break-all leading-relaxed",
                              row.left?.type === "removed" &&
                              "bg-red-500/10 text-red-600 dark:text-red-400 decoration-red-500/30",
                              row.left?.type === "empty" &&
                              "bg-transparent select-none",
                              !row.left && "bg-transparent"
                            )}
                          >
                            {row.left?.text || " "}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(oldText);
                }}
                title="Copy content"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          {/* Right Pane */}
          <div
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200",
              errors.new
                ? "border-red-500/50 ring-1 ring-red-500/20"
                : "border-border/40 hover:border-border/80"
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Modified
                </span>
                {errors.new && (
                  <span className="text-[10px] font-medium text-red-500 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                    <AlertCircle size={10} /> Invalid
                  </span>
                )}
                {!errors.new && newText.trim() && (
                  <span className="text-[10px] font-medium text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 size={10} /> Valid
                  </span>
                )}
              </div>
              {mode === "edit" && (
                <div className="flex items-center gap-1">
                  <input
                    type="file"
                    ref={newFileInputRef}
                    className="hidden"
                    accept=".json,.txt"
                    onChange={(e) => handleFileUpload(e, "new")}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => newFileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload File</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <div className="relative flex-1 flex flex-col min-h-0 group bg-background/50">
              {mode === "edit" ? (
                <Textarea
                  className="flex-1 resize-none border-0 focus-visible:ring-0 p-4 bg-transparent font-mono text-sm leading-relaxed"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Paste modified JSON here..."
                  spellCheck={false}
                />
              ) : (
                <ScrollArea
                  ref={rightScrollRef}
                  className="flex-1 h-full cursor-text"
                  onScrollCapture={() => handleScroll("right")}
                >
                  <div className="flex flex-col py-2">
                    {rows.map((row, i) => (
                      <div
                        key={i}
                        className="flex min-h-[24px] hover:bg-muted/20 transition-colors"
                      >
                        <div className="w-10 text-[10px] text-muted-foreground/30 text-right pr-3 select-none pt-1">
                          {i + 1}
                        </div>
                        <div
                          className={cn(
                            "flex-1 px-2 whitespace-pre-wrap break-all leading-relaxed",
                            row.right?.type === "added" &&
                            "bg-green-500/10 text-green-600 dark:text-green-400 decoration-green-500/30",
                            row.right?.type === "empty" &&
                            "bg-transparent select-none",
                            !row.right && "bg-transparent"
                          )}
                        >
                          {row.right?.text || " "}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(newText);
                }}
                title="Copy content"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={scrollToTop}
              size="sm"
              variant="ghost"
              className="fixed bottom-8 right-8 h-8 w-8 rounded-full shadow-lg bg-primary/50 hover:bg-primary/90 text-primary-foreground z-50 transition-all hover:scale-110"
            >
              <ArrowUp size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Scroll to Top</TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  );
}
