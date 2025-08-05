"use client";
import ScheduleCard from "@/components/schedule/mypage/ScheduleCard";
import MyPageActionBar from "./MyPageActionBar";
import { MyPageContentProps } from "@/types/schedule";
import { useMyPageContent } from "@/hooks/useMyPageContent";
import Checkbox from "@/components/common/Checkbox";

export default function MyPageContent({ projectList }: MyPageContentProps) {
  const {
    cards, // ← cardsを直接描画に使用
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
    sortOnSave, // 保存時ソート関数
  } = useMyPageContent();

  return (
    <div>
      <MyPageActionBar
        deleteMode={deleteMode}
        onAdd={addCard}
        onToggleDeleteMode={toggleDeleteMode}
        onShowConfirm={() => setShowConfirmBulk(true)}
        showConfirm={showConfirmBulk}
        onCancelConfirm={() => setShowConfirmBulk(false)}
        onConfirmDelete={removeSelectedCards}
      />

      {deleteMode && cards.length > 0 && (
        <div className="flex justify-start mb-2">
          <button
            onClick={handleSelectAllOrClear}
            className="px-3 py-1 text-sm bg-white border border-gray-800 text-gray-800 rounded hover:bg-gray-100"
          >
            {selectedIds.length === cards.length ? "全て解除" : "全て選択"}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {cards.map(
          (
            card // ← sortedCardsからcardsに変更
          ) => (
            <div key={card.id} className="flex items-start space-x-2">
              {deleteMode && (
                <Checkbox
                  checked={selectedIds.includes(card.id)}
                  onChange={() => handleToggleSelect(card.id)}
                  className="mt-4" // ← ここで高さを調整（不要なら削除や変更も簡単！）
                />
              )}
              <div className="flex-1">
                <ScheduleCard
                  {...card}
                  projectList={projectList}
                  isEditing={editingCardIds.includes(card.id)}
                  onChange={(updated) => updateCard(card.id, updated)}
                  onEditStart={() =>
                    setEditingCardIds((prev) => [...prev, card.id])
                  }
                  onEditEnd={() =>
                    setEditingCardIds((prev) =>
                      prev.filter((id) => id !== card.id)
                    )
                  }
                  sortOnSave={sortOnSave} // 保存時のみソート
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
