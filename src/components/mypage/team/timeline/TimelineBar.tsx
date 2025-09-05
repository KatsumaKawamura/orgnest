// components/mypage/team/timeline/TimelineBar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TimelineBarProps } from "@/types/timeline";
import { getFlagColor, calculateBarPosition } from "@/utils/timeline";
import { BAR_PADDING } from "@/constants/timeline";
import Tooltip from "@/components/common/Tooltip";

/**
 * 仕様:
 * - PC: pointerenter/leave で hover 表示/非表示（従来通り）
 * - モバイル: pointerup（=タップ完了）かつ移動閾値10px未満 → 開閉
 * - 自動クローズ: 外側タップ / スクロール / リサイズ / ルート遷移
 * - 同時表示は1つのみ（新規オープン前に全閉イベントを発火）
 */

const EVT_FORCE_CLOSE = "timeline:tooltip:force-close";

export default function TimelineBar({
  schedule,
  members,
  startHour,
  pxPerMinute,
  memberColumnWidth,
}: TimelineBarProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  // メンバー列インデックス（userId一致で探索。見つからなければ0列）
  const memberIndex = useMemo(() => {
    const idx = members.findIndex((m) => m.id === schedule.userId);
    return idx >= 0 ? idx : 0;
  }, [members, schedule.userId]);

  // 単一表示制御用キー
  const tipKey = useMemo(
    () =>
      String(
        schedule.id ??
          `${schedule.userId}-${schedule.startMin}-${schedule.endMin}`
      ),
    [schedule]
  );

  // 位置と色（既存APIに準拠）
  const pos = calculateBarPosition(
    schedule.startMin,
    schedule.endMin,
    startHour,
    pxPerMinute,
    memberIndex,
    memberColumnWidth,
    schedule.slotIndex,
    schedule.slotCount,
    BAR_PADDING
  );
  const colorClass = getFlagColor(schedule.flag);

  // --- PC hover は据え置き ---
  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovered(true);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovered(false);
  };

  // --- タップ判定（移動閾値）---
  const downPos = useRef<{ x: number; y: number } | null>(null);
  const TAP_MOVE_THRESHOLD = 10; // px

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    downPos.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    const d = downPos.current;
    downPos.current = null;
    if (!d) return;

    const dx = Math.abs(e.clientX - d.x);
    const dy = Math.abs(e.clientY - d.y);
    const moved = dx > TAP_MOVE_THRESHOLD || dy > TAP_MOVE_THRESHOLD;
    if (moved) {
      // スワイプ扱い：開かない
      return;
    }

    // 同一カードの再タップで閉じる／未表示なら開く（明確な開閉）
    if (!hovered) {
      // 新規に開く前に他ツールチップを閉じる
      window.dispatchEvent(
        new CustomEvent(EVT_FORCE_CLOSE, { detail: { except: tipKey } })
      );
      setHovered(true);
    } else {
      setHovered(false);
    }
  };

  // 他カードからの「閉じて」イベント
  useEffect(() => {
    const onForceClose = (ev: Event) => {
      const ce = ev as CustomEvent<{ except?: string }>;
      if (ce.detail?.except === tipKey) return;
      setHovered(false);
    };
    window.addEventListener(EVT_FORCE_CLOSE, onForceClose as EventListener);
    return () =>
      window.removeEventListener(
        EVT_FORCE_CLOSE,
        onForceClose as EventListener
      );
  }, [tipKey]);

  const tooltipContent = (
    <div className="text-left">
      <div className="font-semibold">{schedule.project || "(no project)"}</div>
      {schedule.notes ? (
        <div className="mt-0.5 text-xs opacity-80">{schedule.notes}</div>
      ) : null}
      <div className="mt-0.5 text-[10px] opacity-60">
        {Math.round(schedule.startMin / 60)
          .toString()
          .padStart(2, "0")}
        :{(schedule.startMin % 60).toString().padStart(2, "0")}
        {" - "}
        {Math.round(schedule.endMin / 60)
          .toString()
          .padStart(2, "0")}
        :{(schedule.endMin % 60).toString().padStart(2, "0")}
      </div>
    </div>
  );

  return (
    <div
      ref={anchorRef}
      className="absolute"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        height: pos.height,
        padding: BAR_PADDING,
        zIndex: 10,
        touchAction: "manipulation",
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div
        className={`h-full w-full flex flex-col items-center
                    rounded border border-gray-400/50 p-1
                    text-gray-800 cursor-pointer text-center ${colorClass}`}
      >
        <div className="w-full min-w-0 font-semibold truncate">
          {schedule.project || "(no project)"}
        </div>
        {schedule.notes ? (
          <div className="w-full min-w-0 text-xs opacity-80 truncate">
            {schedule.notes}
          </div>
        ) : null}
      </div>

      <Tooltip
        content={tooltipContent}
        visible={hovered}
        position="top"
        anchorRef={anchorRef}
        onRequestClose={() => setHovered(false)}
      />
    </div>
  );
}
