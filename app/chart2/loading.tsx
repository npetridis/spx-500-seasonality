export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      <p className="mt-4 text-lg text-sky-200">Loading S&P 500 data...</p>
    </div>
  );
}
