// @/components/common/MenuDropdown.tsx
"use client";

import { useEffect, useState } from "react";

export type DropdownItem = {
  label: string;
  onClick: () => void;
  refCallback?: (el: HTMLButtonElement | null) => void;
};

interface Props {
  items: DropdownItem[];
  onClose: () => void; // Dropdown を閉じる
}

export default function AccountMenuDropdown({ items, onClose }: Props) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={[
        "absolute right-0 mt-2 w-48 z-50 overflow-hidden",
        "rounded-lg border border-gray-200 bg-white shadow-lg",
        "origin-top-right transition-[opacity,transform] duration-200 ease-out",
        entered
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0   scale-95  translate-y-2",
      ].join(" ")}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          ref={item.refCallback}
          onClick={() => {
            onClose(); // 先に閉じる
            item.onClick();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
