'use client';

import { ChevronDown } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

interface FilterPanelProps {
  filters: Filter[];
}

export default function FilterPanel({ filters }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <div key={filter.label} className="relative">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
      ))}
    </div>
  );
}