"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Trash2,
  Plus,
} from "lucide-react";
import * as XLSX from "xlsx";
import { DataGrid } from "react-data-grid";
import type { Column, RenderEditCellProps } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import "../app/spreadsheet-grid.css";

interface SpreadsheetData {
  [key: string]: string | number;
}

interface ColumnMetadata {
  type: 'text' | 'number' | 'date' | 'dropdown';
  dropdownOptions?: string[];
}

// Detect column data type
function detectColumnType(values: (string | number)[]): ColumnMetadata {
  const nonEmptyValues = values.filter(v => v !== "" && v !== null && v !== undefined);

  if (nonEmptyValues.length === 0) return { type: 'text' };

  // Check for dates (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY patterns)
  const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  const dateCount = nonEmptyValues.filter(v => datePattern.test(String(v))).length;
  if (dateCount / nonEmptyValues.length > 0.5) {
    return { type: 'date' };
  }

  // Check for numbers
  const numberCount = nonEmptyValues.filter(v => !isNaN(Number(v)) && String(v).trim() !== '').length;
  if (numberCount / nonEmptyValues.length > 0.8) {
    return { type: 'number' };
  }

  // Check for dropdown (limited unique values)
  const uniqueValues = [...new Set(nonEmptyValues.map(v => String(v)))];
  if (uniqueValues.length <= 10 && uniqueValues.length > 1 && nonEmptyValues.length > 3) {
    return {
      type: 'dropdown',
      dropdownOptions: uniqueValues
    };
  }

  return { type: 'text' };
}

// Custom text editor
function TextEditor({ row, column, onRowChange, onClose }: RenderEditCellProps<SpreadsheetData>) {
  return (
    <input
      className="w-full h-full px-2 bg-background text-foreground border-none outline-none"
      autoFocus
      value={row[column.key] as string}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

// Date editor
function DateEditor({ row, column, onRowChange, onClose }: RenderEditCellProps<SpreadsheetData>) {
  const formatDateForInput = (value: string | number) => {
    if (!value) return '';
    const dateStr = String(value);
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return dateStr;
  };

  return (
    <input
      type="date"
      className="w-full h-full px-2 bg-background text-foreground border-none outline-none"
      autoFocus
      value={formatDateForInput(row[column.key])}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

// Dropdown editor
function DropdownEditor({ row, column, onRowChange, onClose, options }: RenderEditCellProps<SpreadsheetData> & { options: string[] }) {
  return (
    <select
      className="w-full h-full px-2 bg-background text-foreground border-none outline-none"
      autoFocus
      value={row[column.key] as string}
      onChange={(e) => {
        onRowChange({ ...row, [column.key]: e.target.value });
        onClose(true);
      }}
      onBlur={() => onClose(true)}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// Number editor
function NumberEditor({ row, column, onRowChange, onClose }: RenderEditCellProps<SpreadsheetData>) {
  return (
    <input
      type="number"
      className="w-full h-full px-2 bg-background text-foreground border-none outline-none"
      autoFocus
      value={row[column.key] as string}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

export default function SpreadsheetViewer() {
  const [data, setData] = useState<SpreadsheetData[]>([]);
  const [columns, setColumns] = useState<Column<SpreadsheetData>[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [columnMetadata, setColumnMetadata] = useState<Map<string, ColumnMetadata>>(new Map());

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file) return;

    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(csv|xlsx|xls)$/i)
    ) {
      alert("Please upload a valid CSV or Excel file");
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        }) as (string | number)[][];

        if (jsonData.length === 0) {
          alert("The file is empty");
          return;
        }

        // First row as headers
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        // Filter out completely empty rows
        const nonEmptyRows = rows.filter((row) =>
          row.some((cell) => cell !== "" && cell !== null && cell !== undefined)
        );

        // Detect column types
        const metadata = new Map<string, ColumnMetadata>();
        headers.forEach((_, colIdx) => {
          const columnValues = nonEmptyRows.map(row => row[colIdx]);
          const colType = detectColumnType(columnValues);
          metadata.set(`col_${colIdx}`, colType);
        });
        setColumnMetadata(metadata);

        // Create row number column
        const rowNumberColumn: Column<SpreadsheetData> = {
          key: 'rowNumber',
          name: '#',
          width: 50,
          frozen: true,
          resizable: false,
          renderCell: ({ rowIdx }) => (
            <div className="row-number-cell w-full h-full flex items-center justify-center">
              {rowIdx + 1}
            </div>
          ),
        };

        // Create data columns with appropriate editors
        const dataCols: Column<SpreadsheetData>[] = headers.map((header, idx) => {
          const colKey = `col_${idx}`;
          const colMeta = metadata.get(colKey) || { type: 'text' };

          let renderEditCell;
          switch (colMeta.type) {
            case 'date':
              renderEditCell = DateEditor;
              break;
            case 'number':
              renderEditCell = NumberEditor;
              break;
            case 'dropdown':
              renderEditCell = (props: RenderEditCellProps<SpreadsheetData>) =>
                DropdownEditor({ ...props, options: colMeta.dropdownOptions || [] });
              break;
            default:
              renderEditCell = TextEditor;
          }

          return {
            key: colKey,
            name: String(header || `Column ${idx + 1}`),
            resizable: true,
            sortable: true,
            editable: true,
            renderEditCell,
          };
        });

        const allColumns = [rowNumberColumn, ...dataCols];

        // Create data rows
        const dataRows: SpreadsheetData[] = nonEmptyRows.map((row, rowIdx) => {
          const rowData: SpreadsheetData = { id: rowIdx, rowNumber: rowIdx + 1 };
          headers.forEach((_, colIdx) => {
            rowData[`col_${colIdx}`] = row[colIdx] ?? "";
          });
          return rowData;
        });

        setColumns(allColumns);
        setData(dataRows);
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Error parsing file. Please ensure it's a valid spreadsheet.");
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  // File input handler
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => {
        const newRow: { [key: string]: string | number } = {};
        columns.forEach((col) => {
          if (col.key !== 'rowNumber') {
            newRow[String(col.name)] = row[col.key] ?? "";
          }
        });
        return newRow;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(
      workbook,
      fileName.replace(/\.[^/.]+$/, "") + "_edited.xlsx"
    );
  }, [data, columns, fileName]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row) => {
        const newRow: { [key: string]: string | number } = {};
        columns.forEach((col) => {
          if (col.key !== 'rowNumber') {
            newRow[String(col.name)] = row[col.key] ?? "";
          }
        });
        return newRow;
      })
    );

    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, "") + "_edited.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [data, columns, fileName]);

  // Export to JSON
  const exportToJSON = useCallback(() => {
    if (data.length === 0) return;

    const jsonData = data.map((row) => {
      const newRow: { [key: string]: string | number } = {};
      columns.forEach((col) => {
        if (col.key !== 'rowNumber') {
          newRow[String(col.name)] = row[col.key] ?? "";
        }
      });
      return newRow;
    });

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, "") + "_edited.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [data, columns, fileName]);

  // Add new row
  const addRow = useCallback(() => {
    const newRow: SpreadsheetData = { id: data.length, rowNumber: data.length + 1 };
    columns.forEach((col) => {
      if (col.key !== 'rowNumber') {
        newRow[col.key] = "";
      }
    });
    setData([...data, newRow]);
  }, [data, columns]);

  // Clear all data
  const clearData = useCallback(() => {
    setData([]);
    setColumns([]);
    setFileName("");
    setFileSize(0);
    setColumnMetadata(new Map());
  }, []);

  // Handle row update
  const handleRowsChange = useCallback((rows: SpreadsheetData[]) => {
    setData(rows);
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {data.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Drop spreadsheet here or click to select
          </h3>
          <p className="text-muted-foreground mb-4">
            Supports CSV, XLSX, and XLS files
          </p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInputChange}
          />
          <label htmlFor="file-upload">
            <Button asChild>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </span>
            </Button>
          </label>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{fileName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(fileSize)} • {data.length} rows •{" "}
                {columns.length - 1} columns
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={exportToJSON}>
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button variant="destructive" size="sm" onClick={clearData}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>

          {/* Data Grid */}
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <DataGrid
              columns={columns}
              rows={data}
              onRowsChange={handleRowsChange}
              style={{ height: "600px" }}
              rowKeyGetter={(row) => row.id}
            />
          </div>
        </>
      )}
    </div>
  );
}
