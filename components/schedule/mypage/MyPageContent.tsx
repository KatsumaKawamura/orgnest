// @ts-nocheck
"use client";
import ScheduleCard from "@/components/schedule/mypage/ScheduleCard";
import MyPageActionBar from "./MyPageActionBar";
import { MyPageContentProps, MyPageCard } from "@/types/schedule";
import { useMyPageContent } from "@/hooks/useMyPageContent";
import Checkbox from "@/components/common/Checkbox";

interface Props extends MyPageContentProps {
  cards: MyPageCard[];
  setCards: React.Dispatch<React.SetStateAction<MyPageCard[]>>;
}

export default function MyPageContent({ projectList, cards, setCards }: Props) {
  const {
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
  } = useMyPageContent(cards, setCards);

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
            {selectedIds.length === cards.length ? "蜈ｨ縺ｦ隗｣髯､" : "蜈ｨ縺ｦ驕ｸ謚・}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {cards.map(
          (
            card // 竊・sortedCards縺九ｉcards縺ｫ螟画峩
          ) => (
            <div key={card.id} className="flex items-start space-x-2">
              {deleteMode && (
                <Checkbox
                  checked={selectedIds.includes(card.id)}
                  onChange={() => handleToggleSelect(card.id)}
                  className="mt-4" // 竊・縺薙％縺ｧ鬮倥＆繧定ｪｿ謨ｴ・井ｸ崎ｦ√↑繧牙炎髯､繧・､画峩繧らｰ｡蜊假ｼ・ｼ・
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
                  sortOnSave={sortOnSave} // 菫晏ｭ俶凾縺ｮ縺ｿ繧ｽ繝ｼ繝・
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

