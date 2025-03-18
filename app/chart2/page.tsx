import { SP500Chart } from "@/components/SP500Chart2";
import { formatFredData } from "@/lib/utils";

async function getSP500Data() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error(
      "FRED API key is missing. Please add it to your .env.local file."
    );
  }

  // FRED API series ID for S&P 500: SP500
  const seriesId = "SP500";
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&frequency=m&sort_order=desc&limit=120`;

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

export default async function Home() {
  try {
    const sp500Data = await getSP500Data();

    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center">
          S&P 500 Historical Data
        </h1>

        <div className="w-full ">
          <SP500Chart data={sp500Data} />
          <p className="data-source">
            Data source: Federal Reserve Economic Data (FRED)
          </p>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center">
          S&P 500 Historical Data
        </h1>

        <div className="error-message">
          <p>Error: {(error as Error).message}</p>
          <p>Please check your API key and connection.</p>
        </div>
      </div>
    );
  }
}
