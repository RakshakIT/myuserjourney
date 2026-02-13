import { useState, useMemo, useCallback } from "react";
import { format, subDays, subMonths, startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInDays, isAfter, isBefore, startOfWeek, endOfWeek } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, ArrowLeftRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export interface DateRangeValue {
  from: Date;
  to: Date;
}

export interface ComparisonValue {
  from: Date;
  to: Date;
  label: string;
}

export interface DateRangePickerProps {
  period: string;
  onPeriodChange: (period: string) => void;
  dateRange?: DateRangeValue;
  onDateRangeChange?: (range: DateRangeValue) => void;
  comparisonRange?: ComparisonValue | null;
  onComparisonChange?: (range: ComparisonValue | null) => void;
  compareEnabled?: boolean;
  onCompareToggle?: (enabled: boolean) => void;
}

const PRESETS = [
  { value: "today", label: "Today", getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { value: "yesterday", label: "Yesterday", getRange: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { value: "last_7_days", label: "Last 7 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { value: "last_28_days", label: "Last 28 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 27)), to: endOfDay(new Date()) }) },
  { value: "last_30_days", label: "Last 30 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { value: "last_90_days", label: "Last 90 days", getRange: () => ({ from: startOfDay(subDays(new Date(), 89)), to: endOfDay(new Date()) }) },
  { value: "last_12_months", label: "Last 12 months", getRange: () => ({ from: startOfDay(subMonths(new Date(), 12)), to: endOfDay(new Date()) }) },
  { value: "this_week", label: "This week", getRange: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfDay(new Date()) }) },
  { value: "this_month", label: "This month", getRange: () => ({ from: startOfMonth(new Date()), to: endOfDay(new Date()) }) },
  { value: "last_month", label: "Last month", getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
];

const COMPARISON_OPTIONS = [
  { value: "previous_period", label: "Previous period" },
  { value: "previous_year", label: "Same period last year" },
  { value: "custom", label: "Custom" },
];

function getComparisonRange(range: DateRangeValue, type: string): ComparisonValue {
  const days = differenceInDays(range.to, range.from);
  if (type === "previous_period") {
    return {
      from: startOfDay(subDays(range.from, days + 1)),
      to: endOfDay(subDays(range.from, 1)),
      label: "Previous period",
    };
  }
  return {
    from: startOfDay(subMonths(range.from, 12)),
    to: endOfDay(subMonths(range.to, 12)),
    label: "Same period last year",
  };
}

export function DateRangePicker({
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  comparisonRange,
  onComparisonChange,
  compareEnabled = false,
  onCompareToggle,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(period === "custom");
  const [compareType, setCompareType] = useState("previous_period");
  const [customCompareRange, setCustomCompareRange] = useState<DateRange | undefined>();
  const [showCompareCalendar, setShowCompareCalendar] = useState(false);

  const currentRange = useMemo(() => {
    if (isCustom && dateRange) return dateRange;
    const preset = PRESETS.find(p => p.value === period);
    return preset ? preset.getRange() : PRESETS[4].getRange();
  }, [period, isCustom, dateRange]);

  const [tempRange, setTempRange] = useState<DateRange | undefined>({
    from: currentRange.from,
    to: currentRange.to,
  });

  const activeLabel = useMemo(() => {
    if (isCustom && dateRange) {
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
    return PRESETS.find(p => p.value === period)?.label || "Select period";
  }, [period, isCustom, dateRange]);

  const handlePresetSelect = useCallback((presetValue: string) => {
    setIsCustom(false);
    onPeriodChange(presetValue);
    const preset = PRESETS.find(p => p.value === presetValue);
    if (preset && onDateRangeChange) {
      const range = preset.getRange();
      onDateRangeChange(range);
      setTempRange({ from: range.from, to: range.to });
    }
    if (compareEnabled && onComparisonChange) {
      const preset2 = PRESETS.find(p => p.value === presetValue);
      if (preset2) {
        const range = preset2.getRange();
        onComparisonChange(getComparisonRange(range, compareType));
      }
    }
    setOpen(false);
  }, [onPeriodChange, onDateRangeChange, compareEnabled, onComparisonChange, compareType]);

  const handleCustomApply = useCallback(() => {
    if (tempRange?.from && tempRange?.to) {
      const range = { from: startOfDay(tempRange.from), to: endOfDay(tempRange.to) };
      setIsCustom(true);
      onPeriodChange("custom");
      onDateRangeChange?.(range);
      if (compareEnabled && onComparisonChange) {
        if (compareType === "custom" && customCompareRange?.from && customCompareRange?.to) {
          onComparisonChange({
            from: startOfDay(customCompareRange.from),
            to: endOfDay(customCompareRange.to),
            label: "Custom comparison",
          });
        } else {
          onComparisonChange(getComparisonRange(range, compareType));
        }
      }
      setOpen(false);
    }
  }, [tempRange, onPeriodChange, onDateRangeChange, compareEnabled, onComparisonChange, compareType, customCompareRange]);

  const handleCompareToggle = useCallback(() => {
    const newState = !compareEnabled;
    onCompareToggle?.(newState);
    if (newState && onComparisonChange) {
      onComparisonChange(getComparisonRange(currentRange, compareType));
    } else if (!newState) {
      onComparisonChange?.(null);
    }
  }, [compareEnabled, onCompareToggle, onComparisonChange, currentRange, compareType]);

  const handleCompareTypeChange = useCallback((type: string) => {
    setCompareType(type);
    setShowCompareCalendar(type === "custom");
    if (type !== "custom" && compareEnabled && onComparisonChange) {
      onComparisonChange(getComparisonRange(currentRange, type));
    }
  }, [compareEnabled, onComparisonChange, currentRange]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[180px] justify-start text-left font-normal" data-testid="button-date-range">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm">{activeLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 ml-auto shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 max-h-[85vh] overflow-y-auto max-w-[calc(100vw-2rem)]"
          align="end"
          sideOffset={8}
          collisionPadding={16}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="border-b sm:border-b-0 sm:border-r p-2 sm:min-w-[160px]">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">Presets</p>
              <div className="flex flex-wrap gap-1 sm:flex-col sm:gap-0 sm:space-y-0.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset.value)}
                    className={cn(
                      "text-left text-sm px-2 py-1.5 rounded-md transition-colors whitespace-nowrap",
                      period === preset.value && !isCustom
                        ? "bg-primary text-primary-foreground"
                        : "hover-elevate"
                    )}
                    data-testid={`button-preset-${preset.value}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 overflow-x-auto">
              <p className="text-xs font-medium text-muted-foreground mb-2">Custom Range</p>
              <div className="hidden md:block">
                <Calendar
                  mode="range"
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={2}
                  disabled={(date) => isAfter(date, new Date())}
                  defaultMonth={subMonths(new Date(), 1)}
                />
              </div>
              <div className="md:hidden">
                <Calendar
                  mode="range"
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={1}
                  disabled={(date) => isAfter(date, new Date())}
                  defaultMonth={new Date()}
                />
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={compareEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={handleCompareToggle}
                    className="gap-1.5"
                    data-testid="button-compare-toggle"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Compare
                  </Button>
                  {compareEnabled && (
                    <div className="flex gap-1 flex-wrap">
                      {COMPARISON_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleCompareTypeChange(opt.value)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-md transition-colors",
                            compareType === opt.value
                              ? "bg-secondary text-secondary-foreground"
                              : "text-muted-foreground hover-elevate"
                          )}
                          data-testid={`button-compare-${opt.value}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleCustomApply}
                  disabled={!tempRange?.from || !tempRange?.to}
                  data-testid="button-apply-range"
                >
                  Apply
                </Button>
              </div>
              {compareEnabled && showCompareCalendar && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Comparison Range</p>
                  <div className="hidden md:block">
                    <Calendar
                      mode="range"
                      selected={customCompareRange}
                      onSelect={setCustomCompareRange}
                      numberOfMonths={2}
                      disabled={(date) => isAfter(date, new Date())}
                      defaultMonth={subMonths(new Date(), 1)}
                    />
                  </div>
                  <div className="md:hidden">
                    <Calendar
                      mode="range"
                      selected={customCompareRange}
                      onSelect={setCustomCompareRange}
                      numberOfMonths={1}
                      disabled={(date) => isAfter(date, new Date())}
                      defaultMonth={new Date()}
                    />
                  </div>
                </div>
              )}
              {compareEnabled && comparisonRange && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Comparing to: {format(comparisonRange.from, "MMM d, yyyy")} - {format(comparisonRange.to, "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {compareEnabled && comparisonRange && (
        <Badge variant="secondary" className="text-xs gap-1" data-testid="badge-comparison">
          <ArrowLeftRight className="h-3 w-3" />
          vs {comparisonRange.label}
        </Badge>
      )}
    </div>
  );
}
