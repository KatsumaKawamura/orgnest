"use client";
import { Clock } from "lucide-react";

interface TimeSelectProps {
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  isEditing: boolean;
  onChange: (
    updated: Partial<{
      startHour: string;
      startMinute: string;
      endHour: string;
      endMinute: string;
    }>
  ) => void;
}

export default function TimeSelect({
  startHour,
  startMinute,
  endHour,
  endMinute,
  isEditing,
  onChange,
}: TimeSelectProps) {
  // 8〜23 → 0〜7 の順で並べる
  const hours = [
    ...Array.from({ length: 16 }, (_, i) => String(i + 8).padStart(2, "0")), // 8〜23
    ...Array.from({ length: 8 }, (_, i) => String(i).padStart(2, "0")), // 0〜7
  ];

  const minutes = Array.from({ length: 12 }, (_, i) =>
    String(i * 5).padStart(2, "0")
  );

  const hourOptions = [
    <option key="--" value="">
      --
    </option>,
    ...hours.map((h) => <option key={h}>{h}</option>),
  ];
  const minuteOptions = [
    <option key="--" value="">
      --
    </option>,
    ...minutes.map((m) => <option key={m}>{m}</option>),
  ];

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-800" />
          <select
            value={startHour || ""}
            onChange={(e) => onChange({ startHour: e.target.value })}
            className="border border-gray-800 rounded px-0.5 py-1 text-gray-800 bg-gray-100"
          >
            {hourOptions}
          </select>
          <span className="text-gray-500">:</span>
          <select
            value={startMinute || ""}
            onChange={(e) => onChange({ startMinute: e.target.value })}
            className="border border-gray-800 rounded px-0.5 py-1 text-gray-800 bg-gray-100"
          >
            {minuteOptions}
          </select>
          <span className="text-gray-800">〜</span>
          <select
            value={endHour || ""}
            onChange={(e) => onChange({ endHour: e.target.value })}
            className="border border-gray-800 rounded px-0.5 py-1 text-gray-800 bg-gray-100"
          >
            {hourOptions}
          </select>
          <span className="text-gray-500">:</span>
          <select
            value={endMinute || ""}
            onChange={(e) => onChange({ endMinute: e.target.value })}
            className="border border-gray-800 rounded px-0.5 py-1 text-gray-800 bg-gray-100"
          >
            {minuteOptions}
          </select>
        </div>
      ) : (
        <p className="flex items-center text-gray-800 text-lg font-medium">
          <Clock className="w-4 h-4 mr-2 text-gray-800" />
          {startHour || "--"}
          <span className="text-gray-500">：</span>
          {startMinute || "--"} 〜 {endHour || "--"}
          <span className="text-gray-500">：</span>
          {endMinute || "--"}
        </p>
      )}
    </div>
  );
}
