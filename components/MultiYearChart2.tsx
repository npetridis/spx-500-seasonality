"use client";

import React, { useEffect, useState, useRef } from "react";
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
import ChartDataLabels from "chartjs-plugin-datalabels";
import annotationPlugin from "chartjs-plugin-annotation";

// Register Chart.js components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels, // Register the plugin here directly
  annotationPlugin // Register annotation plugin for crosshairs
);

// Define a colorful palette for different years - matching colors from the image
const CHART_COLORS = [
  {
    borderColor: "rgb(65, 105, 225)",
    backgroundColor: "rgba(65, 105, 225, 0.1)",
  }, // Royal Blue (2020)
  {
    borderColor: "rgb(210, 180, 140)",
    backgroundColor: "rgba(210, 180, 140, 0.1)",
  }, // Tan (2023)
  {
    borderColor: "rgb(75, 192, 192)",
    backgroundColor: "rgba(75, 192, 192, 0.1)",
  }, // Teal
  {
    borderColor: "rgb(153, 102, 255)",
    backgroundColor: "rgba(153, 102, 255, 0.1)",
  }, // Purple
  {
    borderColor: "rgb(255, 159, 64)",
    backgroundColor: "rgba(255, 159, 64, 0.1)",
  }, // Orange
  {
    borderColor: "rgb(255, 99, 132)",
    backgroundColor: "rgba(255, 99, 132, 0.1)",
  }, // Red
  {
    borderColor: "rgb(54, 162, 235)",
    backgroundColor: "rgba(54, 162, 235, 0.1)",
  }, // Blue
  {
    borderColor: "rgb(255, 206, 86)",
    backgroundColor: "rgba(255, 206, 86, 0.1)",
  }, // Yellow
  {
    borderColor: "rgb(50, 205, 50)",
    backgroundColor: "rgba(50, 205, 50, 0.1)",
  }, // Lime Green
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
  maxDays = 400,
}: MultiYearChartProps) {
  // State for tracking which years are visible
  const [activeYears, setActiveYears] = useState<Record<string, boolean>>({});
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Ref for the chart instance
  const chartRef = useRef<any>(null);

  // State for crosshair positions
  const [crosshairPos, setCrosshairPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Update the chart instance after data changes
  useEffect(() => {
    // Force a reset of the chart's min/max values for y-axis
    if (chartRef.current) {
      const chart = chartRef.current;
      if (chart.scales && chart.scales.y) {
        // Force the chart to redraw with the correct boundaries
        chart.update();
      }
    }
  }, [chartData]); // Event handlers for crosshair
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel positions to chart scale values
    const xValue = chart.scales.x.getValueForPixel(x);

    // Only set the y value if it's within the chart area
    let yValue = chart.scales.y.getValueForPixel(y);

    // Get the current y-axis boundaries
    const yMin = chart.scales.y.min;
    const yMax = chart.scales.y.max;

    // Clamp the y value to the current chart boundaries
    yValue = Math.max(yMin, Math.min(yMax, yValue));

    // Ensure x value stays within the chart's x boundaries
    const xMin = chart.scales.x.min;
    const xMax = chart.scales.x.max;
    const clampedXValue = Math.max(xMin, Math.min(xMax, xValue));

    setCrosshairPos({ x: clampedXValue, y: yValue });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

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
    const days = Array.from({ length: 401 }, (_, i) => i); // 0-400 inclusive

    // Create datasets for each active year
    const datasets = Object.entries(yearlyData)
      .filter(([year]) => activeYears[year])
      .map(([year, data], index) => {
        const colorIndex = index % CHART_COLORS.length;
        const { borderColor, backgroundColor } = CHART_COLORS[colorIndex];

        // Create a full array of days, filling in missing data with null
        const values = Array(401).fill(null); // Ensure we have up to 400 days
        data.forEach((point) => {
          if (point.day <= 400) {
            // Include points up to day 400
            values[point.day] = point.value;
          }
        });

        return {
          label: year, // Just the year
          data: values,
          borderColor,
          backgroundColor,
          borderWidth: 2,
          pointRadius: 0, // Hide points to match reference image
          pointHoverRadius: 4,
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
        text: "S&P 500 Year-To-Date ROI",
        color: "rgba(255, 255, 255, 0.9)",
        font: {
          size: 16,
          weight: "600",
        },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        position: "nearest",
        callbacks: {
          title: (items) => {
            if (items.length > 0) {
              return `Day ${Math.round(items[0].parsed.x)}`;
            }
            return "";
          },
          label: (context) => {
            const yearLabel = context.dataset.label || "";
            const value =
              context.raw !== null ? Number(context.raw).toFixed(3) : "No data";
            return `${yearLabel}: ${value}`;
          },
        },
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "rgba(255, 255, 255, 0.9)",
        bodyColor: "rgba(255, 255, 255, 0.7)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
      },
      // Annotation plugin configuration for crosshairs
      annotation: {
        annotations: {
          xLine: {
            type: "line",
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderWidth: 1,
            borderDash: [5, 5],
            display: isHovering,
            scaleID: "y",
            value: crosshairPos.y,
            label: {
              display: false,
            },
            // Ensure line stays within chart boundaries
            drawTime: "afterDraw",
          },
          yLine: {
            type: "line",
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderWidth: 1,
            borderDash: [5, 5],
            display: isHovering,
            scaleID: "x",
            value: crosshairPos.x,
            label: {
              display: false,
            },
            // Ensure line stays within chart boundaries
            drawTime: "afterDraw",
          },
        },
      },
      // Simplified datalabels configuration that only shows at the end of each line
      datalabels: {
        align: "right",
        anchor: "end",
        backgroundColor: function (context) {
          return "rgba(15, 23, 42, 0.7)"; // Semi-transparent dark background
        },
        borderRadius: 4,
        color: function (context) {
          return context.dataset.borderColor;
        },
        font: {
          weight: "bold",
          size: 11,
        },
        formatter: function (value, context) {
          return context.dataset.label;
        },
        padding: {
          top: 2,
          right: 4,
          bottom: 2,
          left: 4,
        },
        // Only show for the last valid data point of each dataset
        display: function (context) {
          const dataset = context.dataset;
          const index = context.dataIndex;

          // Find the last non-null data point
          let lastIndex = -1;
          for (let i = dataset.data.length - 1; i >= 0; i--) {
            if (dataset.data[i] !== null) {
              lastIndex = i;
              break;
            }
          }

          // Only show label for the last valid point
          return index === lastIndex;
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days Of The Year",
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        min: 0,
        max: 400,
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value) => {
            // Show ticks at 0, 25, 50, 75, etc. up to 400
            return Number(value) % 25 === 0 ? value : "";
          },
          // Ensure we see all the 25-day interval ticks
          stepSize: 25,
        },
      },
      y: {
        type: "linear",
        title: {
          display: true,
          text: "ROI",
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value) => value.toFixed(1),
        },
        // Add a grid line at 1.0 (no change)
        // grid: {
        //   color: (context) => {
        //     if (context.tick.value === 1.0) {
        //       return "rgba(255, 255, 255, 0.3)"; // Make baseline more visible
        //     }
        //     return "rgba(255, 255, 255, 0.1)";
        //   },
        //   lineWidth: (context) => {
        //     if (context.tick.value === 1.0) {
        //       return 2; // Thicker baseline
        //     }
        //     return 1;
        //   },
        // },
        // Prevent the scale from adapting to the crosshair position
        grace: "0%",
      },
    },
    // Animation and interaction configuration
    animation: false,
    hover: {
      mode: "index",
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.1, // Slight smoothing, but not too much
      },
      point: {
        radius: 0, // Hide all points except on hover to match reference image
        hitRadius: 10, // Larger hit area for interaction
        hoverRadius: 4, // Show points on hover
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

      <div
        className="chart-container relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
}
