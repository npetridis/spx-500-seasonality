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

interface SP500ChartProps {
  data: ChartData[];
}

export function SP500Chart({ data }: SP500ChartProps) {
  // Use state to ensure chart renders only on client
  const [chartData, setChartData] = useState<{
    labels: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    datasets: any[];
  }>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Format dates for better display
    const labels = data.map((item) => format(parseISO(item.date), "MMM yyyy"));
    const values = data.map((item) => item.value);

    setChartData({
      labels,
      datasets: [
        {
          label: "S&P 500 Index",
          data: values,
          borderColor: "rgb(56, 189, 248)", // Bright blue for dark mode
          backgroundColor: "rgba(56, 189, 248, 0.2)",
          borderWidth: 2,
          tension: 0.2,
          pointBackgroundColor: "rgb(56, 189, 248)",
          pointBorderColor: "#0f172a",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(56, 189, 248)",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    });
  }, [data]);

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
        text: "S&P 500 Index - 10 Year Monthly Data",
        color: "rgba(255, 255, 255, 0.9)",
        font: {
          size: 16,
          weight: "normal",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Value: ${context.parsed.y.toLocaleString()}`,
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
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: (value) => value.toLocaleString(),
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}
