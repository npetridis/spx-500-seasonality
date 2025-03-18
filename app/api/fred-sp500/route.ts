// app/api/fred-sp500/route.js
export async function GET() {
  try {
    const FRED_API_KEY = process.env.FRED_API_KEY;
    const SP500_SERIES_ID = "SP500";

    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=${SP500_SERIES_ID}&api_key=${FRED_API_KEY}&file_type=json&frequency=m&observation_start=1950-01-01`,
      { next: { revalidate: 86400 } } // Revalidate once per day
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from FRED");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching FRED data:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
