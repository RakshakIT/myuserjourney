import { useState, useMemo, useCallback } from "react";
import { subDays, startOfDay, endOfDay } from "date-fns";
import type { DateRangeValue, ComparisonValue } from "@/components/date-range-picker";

const PRESET_RANGES: Record<string, () => DateRangeValue> = {
  today: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  yesterday: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }),
  last_7_days: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }),
  last_28_days: () => ({ from: startOfDay(subDays(new Date(), 27)), to: endOfDay(new Date()) }),
  last_30_days: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }),
  last_90_days: () => ({ from: startOfDay(subDays(new Date(), 89)), to: endOfDay(new Date()) }),
  last_12_months: () => ({ from: startOfDay(subDays(new Date(), 364)), to: endOfDay(new Date()) }),
};

export function useDateRange(defaultPeriod = "last_30_days") {
  const [period, setPeriod] = useState(defaultPeriod);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>();
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparisonRange, setComparisonRange] = useState<ComparisonValue | null>(null);

  const queryParams = useMemo(() => {
    if (period === "custom" && dateRange) {
      return `from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
    }
    return `period=${period}`;
  }, [period, dateRange]);

  const comparisonQueryParams = useMemo(() => {
    if (!compareEnabled || !comparisonRange) return null;
    return `from=${comparisonRange.from.toISOString()}&to=${comparisonRange.to.toISOString()}`;
  }, [compareEnabled, comparisonRange]);

  const headerProps = useMemo(() => ({
    period,
    onPeriodChange: setPeriod,
    dateRange,
    onDateRangeChange: setDateRange,
    compareEnabled,
    onCompareToggle: setCompareEnabled,
    comparisonRange,
    onComparisonChange: setComparisonRange,
  }), [period, dateRange, compareEnabled, comparisonRange]);

  return {
    period,
    setPeriod,
    dateRange,
    setDateRange,
    compareEnabled,
    setCompareEnabled,
    comparisonRange,
    setComparisonRange,
    queryParams,
    comparisonQueryParams,
    headerProps,
  };
}
