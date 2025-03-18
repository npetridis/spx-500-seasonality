/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";

export default function SP500Chart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSP500Data = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/fred-sp500");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // Process the data
        const chartData = data.observations
          .filter((item: { value: string }) => item.value !== ".")
          .map((item: { date: string | number | Date; value: string }) => ({
            x: new Date(item.date),
            y: parseFloat(item.value),
          }));

        createChart(chartData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching S&P 500 data:", err);
        setError((err as any)?.message);
        setIsLoading(false);
      }
    };

    const createChart = (data: any) => {
      if (chartInstance.current) {
        (chartInstance.current as any)?.destroy();
      }

      const ctx = chartRef.current?.getContext("2d");

      chartInstance.current = new Chart(ctx!, {
        type: "line",
        data: {
          datasets: [
            {
              label: "S&P 500",
              data: data,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 2,
              pointRadius: 0,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: "year",
                tooltipFormat: "MMM yyyy",
              },
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              type: "logarithmic",
              title: {
                display: true,
                text: "S&P 500 Index (Log Scale)",
              },
            },
          },
          plugins: {
            tooltip: {
              mode: "index",
              intersect: false,
            },
            title: {
              display: true,
              text: "S&P 500 Historical Performance",
              font: {
                size: 18,
              },
            },
            subtitle: {
              display: true,
              text: "Data source: Federal Reserve Economic Data (FRED)",
              font: {
                size: 12,
              },
            },
          },
        },
      });
    };

    fetchSP500Data();

    return () => {
      if (chartInstance.current) {
        (chartInstance.current as Chart).destroy();
      }
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 py-10">Error: {error}</div>
      )}
      <div style={{ height: "600px", display: isLoading ? "none" : "block" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
