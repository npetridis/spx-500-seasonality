"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

interface YearSelectorProps {
  years: string[];
  selectedYear: string;
}

export function YearSelector({ years, selectedYear }: YearSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleYearChange = (year: string) => {
    router.push(`${pathname}?${createQueryString("year", year)}`);
  };

  return (
    <div className="flex items-center mb-4">
      <label htmlFor="year-select" className="mr-2 text-sky-200">
        Select Year:
      </label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={(e) => handleYearChange(e.target.value)}
        className="bg-slate-700 text-white border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
