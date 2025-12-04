"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface JsonTreeNodeProps {
  data: any;
  name?: string;
  isLast?: boolean;
  depth?: number;
  expandAllTrigger?: number;
  shouldExpand?: boolean;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({
  data,
  name,
  isLast: _isLast = true,
  depth = 0,
  expandAllTrigger = 0,
  shouldExpand = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 999); // Auto-expand first 2 levels

  // React to expand/collapse all triggers
  React.useEffect(() => {
    if (expandAllTrigger > 0) {
      setIsExpanded(shouldExpand);
    }
  }, [expandAllTrigger, shouldExpand]);

  const handleCopy = (value: any) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  };

  const getValueType = (value: any): string => {
    if (value === null) {
      return "null";
    }
    if (Array.isArray(value)) {
      return "array";
    }
    return typeof value;
  };

  const getValuePreview = (value: any): string => {
    const type = getValueType(value);
    if (type === "object") {
      const keys = Object.keys(value);
      return `{${keys.length} ${keys.length === 1 ? "key" : "keys"}}`;
    }
    if (type === "array") {
      return `[${value.length} ${value.length === 1 ? "item" : "items"}]`;
    }
    if (type === "string") {
      return `"${value}"`;
    }
    return String(value);
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string":
        return "text-green-600 dark:text-green-400";
      case "number":
        return "text-blue-600 dark:text-blue-400";
      case "boolean":
        return "text-purple-600 dark:text-purple-400";
      case "null":
        return "text-gray-500 dark:text-gray-400";
      case "object":
        return "text-cyan-600 dark:text-cyan-400";
      case "array":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-foreground";
    }
  };

  const type = getValueType(data);
  const isExpandable = type === "object" || type === "array";
  const hasChildren =
    isExpandable && (type === "array" ? data.length > 0 : Object.keys(data).length > 0);

  return (
    <div className="font-mono text-sm">
      <div
        className={cn(
          "flex items-start gap-1 py-0.5 hover:bg-muted/50 rounded group/row",
          depth > 0 && "pl-4"
        )}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {/* Expand/Collapse Icon */}
        {isExpandable && hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-0.5 hover:bg-muted rounded p-0.5 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-[22px]" />
        )}

        {/* Key Name */}
        {name && <span className="text-indigo-600 dark:text-indigo-400 font-medium">{name}:</span>}

        {/* Value or Preview */}
        {!isExpandable || !hasChildren || !isExpanded ? (
          <span className={cn(getTypeColor(type), "flex-1")}>{getValuePreview(data)}</span>
        ) : (
          <span className="text-muted-foreground">{type === "array" ? "[" : "{"}</span>
        )}

        {/* Copy Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-0 group-hover/row:opacity-100 transition-opacity"
          onClick={() => handleCopy(data)}
          title="Copy value"
        >
          <Copy size={12} />
        </Button>
      </div>

      {/* Children */}
      {isExpandable && hasChildren && isExpanded && (
        <div>
          {type === "array"
            ? data.map((item: any, index: number) => (
                <JsonTreeNode
                  key={index}
                  data={item}
                  name={`[${index}]`}
                  isLast={index === data.length - 1}
                  depth={depth + 1}
                  expandAllTrigger={expandAllTrigger}
                  shouldExpand={shouldExpand}
                />
              ))
            : Object.entries(data).map(([key, value], index, arr) => (
                <JsonTreeNode
                  key={key}
                  data={value}
                  name={key}
                  isLast={index === arr.length - 1}
                  depth={depth + 1}
                  expandAllTrigger={expandAllTrigger}
                  shouldExpand={shouldExpand}
                />
              ))}
        </div>
      )}

      {/* Closing Bracket */}
      {isExpandable && hasChildren && isExpanded && (
        <div className="text-muted-foreground py-0.5" style={{ paddingLeft: `${depth * 16}px` }}>
          {type === "array" ? "]" : "}"}
        </div>
      )}
    </div>
  );
};

interface JsonTreeViewProps {
  data: any;
  className?: string;
  expandAllTrigger?: number;
  shouldExpand?: boolean;
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({
  data,
  className,
  expandAllTrigger = 0,
  shouldExpand = false,
}) => {
  if (!data) {
    return (
      <div className={cn("p-4 text-muted-foreground text-center", className)}>
        No data to display
      </div>
    );
  }

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {/* Tree Content */}
      <div className="p-4 overflow-auto flex-1">
        <JsonTreeNode
          data={data}
          depth={0}
          expandAllTrigger={expandAllTrigger}
          shouldExpand={shouldExpand}
        />
      </div>
    </div>
  );
};

export default JsonTreeView;
