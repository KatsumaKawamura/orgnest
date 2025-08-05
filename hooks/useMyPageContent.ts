import { useState, useEffect } from "react";
import { MyPageCard } from "@/types/schedule";
import { SORT_DELAY_MS } from "@/constants/mypage";
import {
  createNewCard,
  sortCards,
  toggleSelection,
  selectAllOrClear,
} from "@/utils/mypageUtils";

const STORAGE_KEY = "mypage_cards";

export function useMyPageContent() {
  // 初期値はlocalStorageから取得
  const [cards, setCards] = useState<MyPageCard[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // パースエラー時は初期化
          console.error("Failed to parse saved cards:", e);
        }
      }
    }
    return [];
  });

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);
  const [editingCardIds, setEditingCardIds] = useState<number[]>([]);

  // 変更があったらlocalStorageに保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards]);

  const addCard = () => setCards((prev) => [...prev, createNewCard()]);

  const removeSelectedCards = () => {
    setCards((c) => c.filter((card) => !selectedIds.includes(card.id)));
    setSelectedIds([]);
    setDeleteMode(false);
    setShowConfirmBulk(false);
  };

  const updateCard = (id: number, updated: Partial<MyPageCard>) => {
    setCards((c) =>
      c.map((card) => (card.id === id ? { ...card, ...updated } : card))
    );
  };

  const handleToggleSelect = (id: number) =>
    setSelectedIds((prev) => toggleSelection(prev, id));

  const handleSelectAllOrClear = () =>
    setSelectedIds(selectAllOrClear(selectedIds, cards));

  const toggleDeleteMode = () => {
    setSelectedIds([]);
    setDeleteMode((prev) => !prev);
  };

  const sortOnSave = () => {
    setTimeout(() => {
      setCards((prev) => sortCards(prev, []));
    }, SORT_DELAY_MS);
  };

  return {
    cards,
    deleteMode,
    selectedIds,
    showConfirmBulk,
    editingCardIds,
    setEditingCardIds,
    addCard,
    removeSelectedCards,
    updateCard,
    handleToggleSelect,
    handleSelectAllOrClear,
    toggleDeleteMode,
    setShowConfirmBulk,
    sortOnSave,
  };
}
