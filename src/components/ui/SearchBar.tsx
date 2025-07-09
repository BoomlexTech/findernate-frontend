'use client';
import { Search } from 'lucide-react';

interface searchBarProps {
  onChange: React.ChangeEventHandler<HTMLElement>;
  placeholder: string;
  className?: string;
  value?: string;
}

export default function SearchBar({onChange,placeholder,className,value}:searchBarProps) {
  return (
    <div className="relative w-full max-w-5xl">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        onChange={onChange}
        value={value}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-5 text-black placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all
          ${className}`}
      />
    </div>
  );
}
