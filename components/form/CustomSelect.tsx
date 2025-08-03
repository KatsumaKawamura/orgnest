"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled: boolean;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  disabled,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex justify-between items-center border border-gray-800 rounded px-3 py-1 text-black ${
          disabled ? "bg-white cursor-default" : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <span>{value}</span>
        {!disabled && <ChevronDown className="w-4 h-4 text-black" />}
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full border border-gray-800 bg-white rounded shadow-lg max-h-40 overflow-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="px-3 py-1 hover:bg-gray-200 cursor-pointer"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
