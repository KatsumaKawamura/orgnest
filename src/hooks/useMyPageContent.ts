// useMyPageContent.ts
import { MyPageCard } from "@/types/schedule";
import { SORT_DELAY_MS } from "@/constants/mypage";
import {
  createNewCard,
  sortCards,
  toggleSelection,
  selectAllOrClear,
} from "@/utils/mypageUtils";
import { useState } from "react";

export function useMyPageContent(
  cards: MyPageCard[],
  setCards: React.Dispatch<React.SetStateAction<MyPageCard[]>>
) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);
  const [editingCardIds, setEditingCardIds] = useState<string[]>([]);

  const addCard = () => setCards((prev) => [...prev, createNewCard()]);
  const removeSelectedCards = () => {
    setCards((c) => c.filter((card) => !selectedIds.includes(card.id)));
    setSelectedIds([]);
    setDeleteMode(false);
    setShowConfirmBulk(false);
  };
  const updateCard = (id: string, updated: Partial<MyPageCard>) => {
    setCards((c) =>
      c.map((card) => (card.id === id ? { ...card, ...updated } : card))
    );
  };

  const handleToggleSelect = (id: string) =>
    setSelectedIds((prev) => toggleSelection(prev, id));
  const handleSelectAllOrClear = () =>
    setSelectedIds(selectAllOrClear(selectedIds, cards));
  const toggleDeleteMode = () => {
    setSelectedIds([]);
    setDeleteMode((prev) => !prev);
  };
  const sortOnSave = () => {
    setTimeout(() => {
      setCards((prev) => sortCards(prev)); // ← 第二引数 [] を削除
    }, SORT_DELAY_MS);
  };

  return {
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
