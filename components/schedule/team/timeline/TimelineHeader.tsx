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
      <div />

      {members.map((m) => (
        <div key={m.id} className="text-center font-semibold text-gray-800">
          {m.name}
        </div>
      ))}
    </div>
  );
}
