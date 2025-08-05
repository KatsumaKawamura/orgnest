import { useState, useEffect, useRef } from "react";

interface UseDropdownControllerProps<T> {
  options: T[];
  getOptionValue: (opt: T) => string;
  value: string;
  onSelect: (val: string) => void;
  onClose?: () => void;
}

export function useDropdownController<T>({
  options,
  getOptionValue,
  value,
  onSelect,
  onClose,
}: UseDropdownControllerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // 各リスト項目の参照（スクロール用）
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // ハイライト項目へスクロール（smooth）
  const scrollToHighlighted = (index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  // ドロップダウンを開いたときだけ現在値に同期
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((o) => getOptionValue(o) === value);
      setHighlightIndex(idx);
      if (idx >= 0) scrollToHighlighted(idx);
    }
  }, [isOpen]); // isOpen のみに依存

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev < options.length - 1 ? prev + 1 : prev; // 末尾で止まる
        scrollToHighlighted(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        const next = prev > 0 ? prev - 1 : prev; // 先頭で止まる
        scrollToHighlighted(next);
        return next;
      });
    } else if (e.key === "Enter" || e.key === " ") {
      // Spaceでも決定
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        onSelect(getOptionValue(options[highlightIndex]));
        setIsOpen(false);
        onClose?.();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      onClose?.();
    }
  };

  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    onClose?.();
  };
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    highlightIndex,
    setHighlightIndex,
    open,
    close,
    toggle,
    handleKeyDown,
    itemRefs, // ← liで参照を受け取る
  };
}
