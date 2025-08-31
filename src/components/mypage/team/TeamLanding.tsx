// components/mypage/team/TeamLanding.tsx
"use client";

import Button from "@/components/common/Button";

type Props = {
  onCreateClick?: () => void;
  onJoinClick?: () => void;
};

export default function TeamLanding({ onCreateClick, onJoinClick }: Props) {
  return (
    <section className="w-full text-gray-800">
      {/* モバイル: 2カラムグリッド / PC: flex-row */}
      <div className="grid grid-cols-2 gap-3 text-center sm:flex sm:flex-row sm:text-left">
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={onJoinClick}
            className="w-full sm:w-auto"
          >
            チーム参加
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={onCreateClick}
            className="w-full sm:w-auto"
          >
            チーム作成
          </Button>
        </div>
      </div>
    </section>
  );
}
