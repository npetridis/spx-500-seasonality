import { MultiYearChart } from "@/components/MultiYearChart";
import {
  formatFredData,
  getAvailableYears,
  groupDataByYear,
  processYearlyDataForComparison,
} from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

async function getSP500Data() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error(
      "FRED API key is missing. Please add it to your .env.local file."
    );
  }

  // FRED API series ID for S&P 500: SP500
  const seriesId = "SP500";
  // Get enough data for multiple years
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&frequency=d&sort_order=desc&limit=3000`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }, // Revalidate data once per day
    });

    if (!response.ok) {
      throw new Error(
        `FRED API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.observations || !Array.isArray(data.observations)) {
      throw new Error("Invalid data format received from FRED API");
    }

    return formatFredData(data.observations);
  } catch (error) {
    console.error("Error fetching S&P 500 data:", error);
    throw error;
  }
}

export default async function YearToDatePage() {
  try {
    const sp500Data = await getSP500Data();
    const groupedData = groupDataByYear(sp500Data);
    const availableYears = getAvailableYears(sp500Data);
    const processedData = processYearlyDataForComparison(groupedData);

    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-center text-sky-400">
          S&P 500 Year-by-Year Comparison
        </h1>

        <div className="flex gap-4 mb-6">
          <Link
            href="/"
            className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition"
          >
            10-Year Overview
          </Link>
          <a
            href="/year-to-date"
            className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
          >
            Year Comparison
          </a>
        </div>

        <div className="w-full max-w-5xl bg-slate-800 p-6 rounded-lg shadow-xl">
          <div className="text-slate-300 text-sm mb-6">
            <p>
              Select years to compare S&P 500 performance. The x-axis shows days
              from the start of each year.
            </p>
            <p>Click on the year buttons below to toggle visibility.</p>
          </div>

          <Suspense
            fallback={
              <div className="chart-container flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
              </div>
            }
          >
            <MultiYearChart yearlyData={processedData} />
          </Suspense>

          <p className="data-source mt-4">
            Data source: Federal Reserve Economic Data (FRED) | Chart shows S&P
            500 index in dollars
          </p>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center text-sky-400">
          S&P 500 Year Comparison
        </h1>

        <div className="error-message">
          <p>Error: {(error as Error).message}</p>
          <p>Please check your API key and connection.</p>
        </div>
      </div>
    );
  }
}
