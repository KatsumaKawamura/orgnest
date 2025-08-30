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
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" onClick={onJoinClick}>
          チーム参加
        </Button>
        <Button variant="secondary" onClick={onCreateClick}>
          チーム作成
        </Button>
      </div>
    </section>
  );
}
