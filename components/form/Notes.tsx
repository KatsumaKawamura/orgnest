"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface NotesProps {
  notes: string;
  isEditing: boolean;
  onChange: (updated: { notes: string }) => void;
}

export default function Notes({ notes, isEditing, onChange }: NotesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* 開閉ボタン */}
      <div className="mt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-gray-800 hover:underline focus:outline-none flex items-center"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 mr-1" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-1" />
          )}
          Notes
        </button>
      </div>

      {/* 開いた時のテキストエリア */}
      {isOpen && (
        <div className="mt-2">
          <textarea
            value={notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Notes"
            disabled={!isEditing}
            rows={4}
            className={`w-full border border-gray-800 rounded px-3 py-2 text-gray-800 placeholder-gray-500 ${
              isEditing ? "bg-gray-100" : "bg-white"
            }`}
          />
        </div>
      )}
    </div>
  );
}
