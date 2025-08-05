"use client";
import { Pencil, Check } from "lucide-react";
import Button from "@/components/common/Button";
import Checkbox from "@/components/common/Checkbox";

interface ProjectListItemProps {
  id: number; // 追加: IDを受け取る
  name: string;
  deleteMode: boolean;
  selected: boolean;
  isEditing: boolean;
  editValue: string;
  onSelect: (id: number) => void; // id付きでコールバック
  onEditStart: (id: number, name: string) => void;
  onEditChange: (value: string) => void;
  onEditConfirm: (id: number) => void;
}

export default function ProjectListItem({
  id,
  name,
  deleteMode,
  selected,
  isEditing,
  editValue,
  onSelect,
  onEditStart,
  onEditChange,
  onEditConfirm,
}: ProjectListItemProps) {
  return (
    <li className="flex justify-between items-center text-gray-800 border-b border-gray-300 pb-1">
      <div className="flex items-center space-x-2">
        {deleteMode && (
          <Checkbox checked={selected} onChange={() => onSelect(id)} />
        )}
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onEditConfirm(id)}
            onBlur={() => onEditConfirm(id)} // フォーカス外れたら確定
            autoFocus
            className="bg-transparent border-none focus:outline-none px-0 py-0 text-gray-800 w-auto"
            style={{ minWidth: "1em" }}
          />
        ) : (
          <span>{name}</span>
        )}
      </div>

      {!deleteMode &&
        (isEditing ? (
          <Button variant="icon" size="sm" onClick={() => onEditConfirm(id)}>
            <Check className="w-5 h-5 text-green-600" />
          </Button>
        ) : (
          <Button
            variant="icon"
            size="sm"
            onClick={() => onEditStart(id, name)}
          >
            <Pencil className="w-5 h-5 text-gray-800" />
          </Button>
        ))}
    </li>
  );
}
