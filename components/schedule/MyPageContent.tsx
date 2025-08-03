"use client";
import { useState } from "react";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import ConfirmDialog from "@/components/common/ConfirmDialog"; // ←追加

interface MyPageContentProps {
  projectList: string[];
}

export default function MyPageContent({ projectList }: MyPageContentProps) {
  const [cards, setCards] = useState<
    {
      id: number;
      startHour: string;
      startMinute: string;
      endHour: string;
      endMinute: string;
      project: string;
      notes: string;
      flag: string;
    }[]
  >([]);

  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);

  // カード追加
  const addCard = () => {
    setCards([
      ...cards,
      {
        id: Date.now(),
        startHour: "",
        startMinute: "",
        endHour: "",
        endMinute: "",
        project: "",
        notes: "",
        flag: "内勤",
      },
    ]);
  };

  // 一括削除
  const removeSelectedCards = () => {
    setCards(cards.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    setDeleteMode(false);
    setShowConfirmBulk(false);
  };

  // カード更新
  const updateCard = (id: number, updated: Partial<(typeof cards)[0]>) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  // ソート
  const sortedCards = [...cards].sort((a, b) => {
    const startA =
      parseInt(a.startHour || "0") * 60 + parseInt(a.startMinute || "0");
    const startB =
      parseInt(b.startHour || "0") * 60 + parseInt(b.startMinute || "0");
    return startA - startB;
  });

  // 選択モード関連
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const toggleDeleteMode = () => {
    if (deleteMode) {
      setSelectedIds([]);
      setDeleteMode(false);
    } else {
      setSelectedIds([]);
      setDeleteMode(true);
    }
  };
  const selectAllOrClear = () => {
    if (selectedIds.length === cards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cards.map((c) => c.id));
    }
  };

  return (
    <div>
      {/* 上部操作ボタン */}
      <div className="flex space-x-2 mb-4 relative">
        <button
          onClick={addCard}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          ＋カード追加
        </button>
        <button
          onClick={toggleDeleteMode}
          className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          {deleteMode ? "戻る" : "選択"}
        </button>
        {deleteMode && (
          <div className="relative">
            <button
              onClick={() => setShowConfirmBulk(true)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              削除
            </button>
            {showConfirmBulk && (
              <ConfirmDialog
                message="削除しますか？"
                onCancel={() => setShowConfirmBulk(false)}
                onConfirm={removeSelectedCards}
              />
            )}
          </div>
        )}
      </div>

      {deleteMode && cards.length > 0 && (
        <div className="flex justify-start mb-2">
          <button
            onClick={selectAllOrClear}
            className="px-3 py-1 text-sm bg-white border border-gray-800 text-gray-800 rounded hover:bg-gray-100"
          >
            {selectedIds.length === cards.length ? "全解除" : "全選択"}
          </button>
        </div>
      )}

      {/* カードリスト */}
      <div className="space-y-4">
        {sortedCards.map((card) => (
          <div key={card.id} className="flex items-start space-x-2">
            {deleteMode && (
              <input
                type="checkbox"
                checked={selectedIds.includes(card.id)}
                onChange={() => toggleSelect(card.id)}
                className="w-5 h-5 mt-4 appearance-none border-2 border-gray-800 rounded bg-white 
                  checked:before:content-['✔'] checked:before:text-gray-800 
                  checked:before:font-bold checked:before:block checked:before:text-center checked:before:leading-5"
              />
            )}
            <div className="flex-1">
              <ScheduleCard
                {...card}
                projectList={projectList}
                onChange={(updated) => updateCard(card.id, updated)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
