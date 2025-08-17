// @ts-nocheck
"use client";
import { TIME_LABEL_WIDTH } from "@/constants/timeline";
import { TimelineHeaderProps } from "@/types/timeline";

export default function TimelineHeader({
  members,
  memberColumnWidth,
}: TimelineHeaderProps) {
  return (
    <div
      className="grid min-w-max"
      style={{
        gridTemplateColumns: `${TIME_LABEL_WIDTH}px repeat(${members.length}, ${memberColumnWidth}px)`,
      }}
    >
      {/* 蟾ｦ遶ｯ・壽凾髢薙Λ繝吶Ν蛻・・繧ｹ繝壹・繧ｹ */}
      <div />
      {/* 繝｡繝ｳ繝舌・蜷阪Μ繧ｹ繝・*/}
      {members.map((m) => (
        <div key={m.id} className="text-center font-semibold text-gray-800">
          {m.name}
        </div>
      ))}
    </div>
  );
}

