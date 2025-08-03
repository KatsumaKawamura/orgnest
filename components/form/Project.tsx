"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ProjectProps {
  value: string;
  options: string[];
  flag: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onFlagChange: (flag: string) => void;
}

const flagOptions = ["事務所", "現場", "打ち合わせ"];

export default function Project({
  value,
  options,
  flag,
  isEditing,
  onChange,
  onFlagChange,
}: ProjectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 外側クリックでリスト閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-2" ref={wrapperRef}>
      {/* === 編集モード時のみフラグプルダウン === */}
      {isEditing && (
        <select
          value={flag}
          onChange={(e) => onFlagChange(e.target.value)}
          className="w-full border border-gray-800 rounded px-3 py-1 bg-gray-100 text-gray-800"
        >
          {flagOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      )}

      {/* === Project入力 === */}
      {isEditing ? (
        <>
          <div
            className="flex items-center border border-gray-800 rounded px-3 py-1 bg-gray-100 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-800"
              placeholder="Project"
            />
            <ChevronDown className="w-4 h-4 text-gray-800" />
          </div>
          {isOpen && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-800 rounded shadow">
              {options.map((opt) => (
                <li
                  key={opt}
                  className="px-3 py-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p
          className="text-gray-800 px-1 pb-1 relative inline-block
            after:content-[''] after:block after:h-[2px] 
            after:bg-gradient-to-r after:from-gray-800 after:to-gray-400
            after:absolute after:bottom-0 after:left-0 after:w-[calc(100%+4em)]
            before:content-[''] before:block before:h-[1px] before:bg-gray-400 
            before:absolute before:bottom-[4px] before:left-0 before:w-[calc(100%+3em)]"
        >
          <span className="font-medium mr-1">Project：</span>
          {value || "—"}
        </p>
      )}
    </div>
  );
}
