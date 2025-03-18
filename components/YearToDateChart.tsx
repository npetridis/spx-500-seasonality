"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
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

interface ChartData {
  date: string;
  value: number;
}

interface YTDChartProps {
  data: ChartData[];
  year: string;
}

export function YTDChart({ data, year }: YTDChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      borderWidth: number;
      tension: number;
      pointBackgroundColor: string;
      pointBorderColor: string;
      pointHoverBackgroundColor: string;
      pointHoverBorderColor: string;
      pointRadius: number;
      pointHoverRadius: number;
      fill: boolean;
    }[];
  }>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Format dates to show just month names
    const labels = data.map((item) => format(parseISO(item.date), "MMM"));
    const values = data.map((item) => item.value);

    // Find if the year's data is positive or negative overall
    const isPositive = data.length > 0 && data[data.length - 1].value >= 0;

    // Change color based on whether the year was positive or negative
    const lineColor = isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)";
    const backgroundColor = isPositive
      ? "rgba(34, 197, 94, 0.2)"
      : "rgba(239, 68, 68, 0.2)";

    setChartData({
      labels,
      datasets: [
        {
          label: `S&P 500 YTD Performance (${year})`,
          data: values,
          borderColor: lineColor,
          backgroundColor: backgroundColor,
          borderWidth: 2,
          tension: 0.2,
          pointBackgroundColor: lineColor,
          pointBorderColor: "#0f172a",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: lineColor,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
        },
      ],
    });
  }, [data, year]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    color: "rgba(255, 255, 255, 0.7)",
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            weight: "lighter",
          },
        },
      },
      title: {
        display: true,
        text: `S&P 500 Year-to-Date Performance (${year})`,
        color: "rgba(255, 255, 255, 0.9)",
        font: {
          size: 16,
          weight: "bolder",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Change: ${context.parsed.y.toFixed(2)}%`,
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            if (index !== undefined && data[index]) {
              return format(parseISO(data[index].date), "MMMM yyyy");
            }
            return "";
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
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          // drawZero: true,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value) => `${Number(value).toFixed(2)}%`,
        },
        suggestedMin: Math.min(...data.map((d) => d.value), 0) - 5,
        suggestedMax: Math.max(...data.map((d) => d.value), 0) + 5,
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}
