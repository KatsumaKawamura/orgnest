// @/components/mypage/team/timeline/TimelineHeader.tsx
"use client";

type Props = {
  members: { id: string; name: string }[];
  memberColumnWidth: number;
  includeTimeLabelSpacer?: boolean; // 互換のため残すが、内部では常時 true として扱う
};

export default function TimelineHeader({ members, memberColumnWidth }: Props) {
  const cols = `var(--time-label-w) repeat(${members.length}, ${memberColumnWidth}px)`;

  return (
    <div
      className="grid items-center bg-transparent"
      style={{ gridTemplateColumns: cols }}
    >
      {/* 先頭：ラベル用スペーサー（空） */}
      <div className="bg-transparent" />
      {/* メンバー名ヘッダ */}
      {members.map((m) => (
        <div
          key={m.id}
          className="truncate text-gray-700 text-sm font-semibold text-center px-2 py-2"
          title={m.name}
        >
          {m.name}
        </div>
      ))}
    </div>
  );
}
