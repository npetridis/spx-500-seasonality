"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define a colorful palette for different years
const CHART_COLORS = [
  {
    borderColor: "rgb(56, 189, 248)",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
  }, // Sky blue
  {
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  }, // Green
  {
    borderColor: "rgb(239, 68, 68)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  }, // Red
  {
    borderColor: "rgb(250, 204, 21)",
    backgroundColor: "rgba(250, 204, 21, 0.1)",
  }, // Yellow
  {
    borderColor: "rgb(168, 85, 247)",
    backgroundColor: "rgba(168, 85, 247, 0.1)",
  }, // Purple
  {
    borderColor: "rgb(251, 146, 60)",
    backgroundColor: "rgba(251, 146, 60, 0.1)",
  }, // Orange
  {
    borderColor: "rgb(20, 184, 166)",
    backgroundColor: "rgba(20, 184, 166, 0.1)",
  }, // Teal
  {
    borderColor: "rgb(236, 72, 153)",
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  }, // Pink
  {
    borderColor: "rgb(129, 140, 248)",
    backgroundColor: "rgba(129, 140, 248, 0.1)",
  }, // Indigo
];

interface YearlyDataPoint {
  day: number;
  value: number;
}

interface MultiYearChartProps {
  yearlyData: Record<string, YearlyDataPoint[]>;
  maxDays?: number;
}

export function MultiYearChart({
  yearlyData,
  maxDays = 366,
}: MultiYearChartProps) {
  // State for tracking which years are visible
  const [activeYears, setActiveYears] = useState<Record<string, boolean>>({});
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Initialize active years on first render
  useEffect(() => {
    const initialActiveYears: Record<string, boolean> = {};

    // Get top 3 most recent years and activate them by default
    const years = Object.keys(yearlyData).sort().reverse();
    const yearsToActivate = years.slice(0, 3);

    years.forEach((year) => {
      initialActiveYears[year] = yearsToActivate.includes(year);
    });

    setActiveYears(initialActiveYears);
  }, [yearlyData]);

  // Update chart when active years change
  useEffect(() => {
    // Generate day labels (0 to max day)
    const days = Array.from({ length: maxDays }, (_, i) => i);

    // Create datasets for each active year
    const datasets = Object.entries(yearlyData)
      .filter(([year]) => activeYears[year])
      .map(([year, data], index) => {
        const colorIndex = index % CHART_COLORS.length;
        const { borderColor, backgroundColor } = CHART_COLORS[colorIndex];

        // Create a full array of days, filling in missing data with null
        const values = Array(maxDays).fill(null);
        data.forEach((point) => {
          if (point.day < maxDays) {
            values[point.day] = point.value;
          }
        });

        return {
          label: `${year}`,
          data: values,
          borderColor,
          backgroundColor,
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 5,
          spanGaps: true, // Connect lines across missing data points
        };
      });

    setChartData({
      labels: days,
      datasets,
    });
  }, [yearlyData, activeYears, maxDays]);

  const toggleYear = (year: string) => {
    setActiveYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    color: "rgba(255, 255, 255, 0.7)",
    plugins: {
      legend: {
        display: false, // Hide default legend since we're using custom toggles
      },
      title: {
        display: true,
        text: "S&P 500 Year-by-Year Comparison",
        color: "rgba(255, 255, 255, 0.9)",
        font: {
          size: 16,
          weight: "600",
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            if (items.length > 0) {
              return `Day ${items[0].label}`;
            }
            return "";
          },
          label: (context) => {
            const yearLabel = context.dataset.label || "";
            const value =
              context.raw !== null
                ? `$${Number(context.raw).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "No data";
            return `${yearLabel}: ${value}`;
          },
        },
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "rgba(255, 255, 255, 0.9)",
        bodyColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days from Start of Year",
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value) => {
            // Show ticks at 0, 30, 60, 90, etc.
            return Number(value) % 30 === 0 ? value : "";
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "S&P 500 Index Value",
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(activeYears).map(([year, isActive], index) => {
          const colorIndex = index % CHART_COLORS.length;
          const { borderColor } = CHART_COLORS[colorIndex];

          return (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-3 py-1.5 rounded-md font-medium text-sm transition-colors flex items-center
                ${
                  isActive
                    ? "bg-slate-700 text-white border border-slate-600"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                }`}
              style={{
                borderLeftColor: isActive ? borderColor : "transparent",
                borderLeftWidth: "4px",
              }}
            >
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: borderColor }}
              ></span>
              {year}
            </button>
          );
        })}
      </div>

      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
