import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportMenuProps {
  data: unknown;
  filename: string;
  disabled?: boolean;
}

function convertToCSV(data: unknown): string {
  if (!data) return "";
  if (Array.isArray(data)) {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = (row as Record<string, unknown>)[h];
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const sheets: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        sheets.push(`--- ${key} ---`);
        sheets.push(convertToCSV(value));
        sheets.push("");
      }
    }
    if (sheets.length > 0) return sheets.join("\n");
    const headers = Object.keys(obj);
    const values = headers.map((h) => String(obj[h] ?? ""));
    return [headers.join(","), values.join(",")].join("\n");
  }
  return String(data);
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportMenu({ data, filename, disabled }: ExportMenuProps) {
  const handleExportCSV = () => {
    const csv = convertToCSV(data);
    downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, "application/json");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} data-testid="button-export">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} data-testid="button-export-csv">
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON} data-testid="button-export-json">
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
