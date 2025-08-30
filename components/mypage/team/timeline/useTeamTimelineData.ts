// components/mypage/team/timeline/useTeamTimelineData.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { Schedule } from "@/types/schedule";
import { assignSlots } from "@/utils/scheduleUtils";

type ApiItem = {
  id: string;
  user_id: string;
  date: string; // 未使用
  start_min: number;
  end_min: number;
  project: string;
  notes: string | null;
  flag: string;
  created_at: string;
  updated_at: string;
};

type ApiResponse = {
  ok: boolean;
  items: ApiItem[];
};

/**
 * チーム用タイムライン（スケジュール専用）
 * - enabled=false ならフェッチしない
 * - members は別フック（useTeamMembers）で取得
 */
export function useTeamTimelineData(enabled: boolean = true) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!enabled) {
      setSchedules([]);
      setLoading(false);
      setError(null);
      return () => {
        mounted = false;
      };
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/team/schedules", {
          method: "GET",
          credentials: "same-origin",
          headers: { "cache-control": "no-store" },
        });
        if (!mounted) return;

        if (!res.ok) {
          setError(`HTTP ${res.status}`);
          setLoading(false);
          return;
        }

        const data = (await res.json()) as ApiResponse;
        const items = Array.isArray(data?.items) ? data.items : [];

        // スケジュール（minベース）
        const raw: Schedule[] = items
          .filter(
            (it) =>
              typeof it.start_min === "number" &&
              typeof it.end_min === "number" &&
              it.end_min > it.start_min
          )
          .map((it) => ({
            id: it.id,
            userId: it.user_id,
            startMin: it.start_min,
            endMin: it.end_min,
            flag: it.flag ?? "",
            project: it.project ?? "",
            notes: it.notes ?? null,
            slotIndex: 0,
            slotCount: 1,
          }));

        const slotted = assignSlots(raw);

        setSchedules(slotted);
        setLoading(false);
      } catch {
        if (!mounted) return;
        setError("NETWORK_ERROR");
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return useMemo(
    () => ({ schedules, loading, error }),
    [schedules, loading, error]
  );
}
