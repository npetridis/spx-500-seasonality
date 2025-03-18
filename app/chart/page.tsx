// app/sp500/page.js
import SP500Chart from "@/components/SP500Chart";

export const metadata = {
  title: "S&P 500 Historical Chart",
  description: "Interactive chart showing historical S&P 500 data from FRED",
};

export default function SP500Page() {
  return (
    <main className="">
      <h1 className="text-2xl font-bold mb-6">
        S&P 500 Historical Performance
      </h1>
      <SP500Chart />
    </main>
  );
}
