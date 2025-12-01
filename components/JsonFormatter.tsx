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
    FileJson,
    Trash2,
    Download,
    List,
    FileText,
    ArrowRightLeft,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import JsonTreeView from "@/components/JsonTreeView";

export default function JsonFormatter() {
    const [jsonText, setJsonText] = useState("");
    const [formattedJson, setFormattedJson] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"raw" | "tree">("tree");
    const [parsedData, setParsedData] = useState<any>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedInput = localStorage.getItem("jsonFormatter_input");
        if (savedInput) setJsonText(savedInput);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("jsonFormatter_input", jsonText);
    }, [jsonText]);

    // Tree View Controls
    const [expandAllTrigger, setExpandAllTrigger] = useState(0);
    const [shouldExpand, setShouldExpand] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-format when JSON text changes
    useEffect(() => {
        if (!jsonText.trim()) {
            setFormattedJson("");
            setParsedData(null);
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(jsonText);
            const formatted = JSON.stringify(parsed, null, 2);
            setFormattedJson(formatted);
            setParsedData(parsed);
            setError(null);
        } catch (e) {
            setError("Invalid JSON");
            setFormattedJson("");
            setParsedData(null);
        }
    }, [jsonText]);

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(jsonText);
            const formatted = JSON.stringify(parsed, null, 2);
            setFormattedJson(formatted);
            setParsedData(parsed);
            setError(null);
        } catch (e) {
            setError("Invalid JSON");
            setFormattedJson("");
            setParsedData(null);
        }
    };

    const handleMinify = () => {
        try {
            const parsed = JSON.parse(jsonText);
            const minified = JSON.stringify(parsed);
            setFormattedJson(minified);
            setParsedData(parsed);
            setError(null);
        } catch (e) {
            setError("Invalid JSON");
            setFormattedJson("");
            setParsedData(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setJsonText(content);
            };
            reader.readAsText(file);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleDownload = () => {
        if (!formattedJson) return;
        const blob = new Blob([formattedJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "formatted.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setJsonText("");
        setFormattedJson("");
        setParsedData(null);
        setError(null);
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
                {/* Sticky Toolbar - Below Navigation */}
                <div className="sticky top-14 z-20 bg-background border-b border-border/40 pb-4 mb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-card/50 backdrop-blur-sm border border-border/40 rounded-lg shadow-sm">
                        <div className="flex items-center gap-1.5">
                            {" "}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleFormat}
                                        className="h-9 gap-2 px-3 touch-target transition-smooth"
                                    >
                                        <FileJson size={16} />
                                        <span className="hidden sm:inline">Format</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Format JSON</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMinify}
                                        className="h-9 gap-2 px-3 touch-target transition-smooth"
                                    >
                                        <FileJson size={16} />
                                        <span className="hidden sm:inline">Minify</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Minify JSON</TooltipContent>
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newText = jsonText.replace(/\|\|/g, ",");
                                            setJsonText(newText);
                                        }}
                                        className="h-8 gap-2"
                                    >
                                        <ArrowRightLeft size={14} />
                                        <span className="hidden sm:inline">|| to ,</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Replace || with ,</TooltipContent>
                            </Tooltip>
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/40 mr-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={viewMode === "raw" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setViewMode("raw")}
                                            className="h-7 px-2 gap-1.5 text-xs"
                                        >
                                            <FileText size={12} />
                                            Raw
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Raw JSON View</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={viewMode === "tree" ? "secondary" : "ghost"}
                                            size="sm"
                                            onClick={() => setViewMode("tree")}
                                            className="h-7 px-2 gap-1.5 text-xs"
                                            disabled={!parsedData}
                                        >
                                            <List size={12} />
                                            Tree
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Tree View (Expand/Collapse)</TooltipContent>
                                </Tooltip>
                            </div>

                            {formattedJson && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDownload}
                                            className="h-8 gap-2"
                                        >
                                            <Download size={14} />
                                            <span className="hidden sm:inline">Download</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download JSON</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-4 min-h-[600px] md:h-[700px] font-mono text-sm">
                    {/* Input Pane */}
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
                                    Input
                                </span>
                                {error && (
                                    <span className="text-[10px] font-medium text-red-500 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                                        <AlertCircle size={10} /> Invalid
                                    </span>
                                )}
                                {!error && jsonText.trim() && (
                                    <span className="text-[10px] font-medium text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                        <CheckCircle2 size={10} /> Valid
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".json,.txt"
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
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                placeholder="Paste JSON here (auto-formats)..."
                                spellCheck={false}
                            />

                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                onClick={() => handleCopy(jsonText)}
                                title="Copy"
                            >
                                <Copy size={14} />
                            </Button>
                        </div>
                    </div>

                    {/* Output Pane */}
                    <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm hover:border-border/80 transition-all duration-200">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Output
                                </span>
                                {/* {viewMode === "tree" && (
                  <span className="text-[10px] font-medium text-indigo-500 flex items-center gap-1 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
                    <List size={10} /> Tree View
                  </span>
                )} */}

                                {/* Expand/Collapse Controls for Tree View */}
                            </div>
                            {viewMode === "tree" && parsedData && (
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
                            {viewMode === "tree" && parsedData ? (
                                <JsonTreeView
                                    data={parsedData}
                                    className="h-full"
                                    expandAllTrigger={expandAllTrigger}
                                    shouldExpand={shouldExpand}
                                />
                            ) : (
                                <>
                                    <Textarea
                                        className="flex-1 resize-none border-0 focus-visible:ring-0 p-4 bg-transparent font-mono text-sm leading-relaxed"
                                        value={formattedJson}
                                        readOnly
                                        placeholder="Formatted JSON will appear here..."
                                        spellCheck={false}
                                    />

                                    {formattedJson && (
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            onClick={() => handleCopy(formattedJson)}
                                            title="Copy"
                                        >
                                            <Copy size={14} />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
