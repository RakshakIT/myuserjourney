import { ExportMenu } from "@/components/export-menu";
import { DateRangePicker, type DateRangeValue, type ComparisonValue } from "@/components/date-range-picker";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AnalyticsHeaderProps {
  title: string;
  icon: LucideIcon;
  period: string;
  onPeriodChange: (value: string) => void;
  dateRange?: DateRangeValue;
  onDateRangeChange?: (range: DateRangeValue) => void;
  comparisonRange?: ComparisonValue | null;
  onComparisonChange?: (range: ComparisonValue | null) => void;
  compareEnabled?: boolean;
  onCompareToggle?: (enabled: boolean) => void;
  exportData?: unknown;
  exportFilename?: string;
  children?: ReactNode;
}

export function AnalyticsHeader({
  title,
  icon: Icon,
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  comparisonRange,
  onComparisonChange,
  compareEnabled,
  onCompareToggle,
  exportData,
  exportFilename,
  children,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">{title}</h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        <DateRangePicker
          period={period}
          onPeriodChange={onPeriodChange}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          comparisonRange={comparisonRange}
          onComparisonChange={onComparisonChange}
          compareEnabled={compareEnabled}
          onCompareToggle={onCompareToggle}
        />
        {exportData && exportFilename && (
          <ExportMenu data={exportData} filename={exportFilename} />
        )}
      </div>
    </div>
  );
}
