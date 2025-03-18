interface FredObservation {
  date: string;
  value: string;
  [key: string]: any;
}

interface ChartData {
  date: string;
  value: number;
}

/**
 * Formats raw FRED API data for use in the chart
 */
export function formatFredData(observations: FredObservation[]): ChartData[] {
  return observations
    .filter((obs) => obs.value !== ".")
    .map((obs) => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }))
    .reverse(); // Chronological order
}

/**
 * Groups FRED data by year
 */
export function groupDataByYear(
  data: ChartData[]
): Record<string, ChartData[]> {
  const groupedData: Record<string, ChartData[]> = {};

  for (const item of data) {
    const year = item.date.substring(0, 4);
    if (!groupedData[year]) {
      groupedData[year] = [];
    }
    groupedData[year].push(item);
  }

  return groupedData;
}

/**
 * Calculates percentage change from the first value in the array
 */
export function calculateYearToDateChange(data: ChartData[]): ChartData[] {
  if (data.length === 0) return [];

  const firstValue = data[0].value;

  return data.map((item) => ({
    date: item.date,
    value: (item.value / firstValue - 1) * 100, // Percentage change
  }));
}

/**
 * Get the range of available years in the dataset
 */
export function getAvailableYears(data: ChartData[]): string[] {
  const years = new Set<string>();

  for (const item of data) {
    const year = item.date.substring(0, 4);
    years.add(year);
  }

  return Array.from(years).sort().reverse(); // Most recent years first
}

/**
 * Convert date to day of year (0-based)
 */
export function convertToDayOfYear(dateStr: string): number {
  const date = new Date(dateStr);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffInMs = date.getTime() - startOfYear.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Process data for multi-year comparison chart with ROI calculation as ratio
 */
export function processYearlyDataForComparison(
  groupedData: Record<string, ChartData[]>
): Record<string, { day: number; value: number }[]> {
  const processedData: Record<string, { day: number; value: number }[]> = {};

  for (const [year, yearData] of Object.entries(groupedData)) {
    if (yearData.length === 0) continue;

    // Get the first value of the year to calculate ROI
    const firstValue = yearData[0].value;

    processedData[year] = yearData.map((item) => ({
      day: convertToDayOfYear(item.date),
      // Calculate ROI as ratio (current/initial)
      value: item.value / firstValue,
    }));
  }

  return processedData;
}
