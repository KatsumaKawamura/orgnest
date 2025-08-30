// components/mypage/team/timeline/useTeamTimelineData.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { Member, Schedule } from "@/types/schedule";
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
  user: {
    user_id: string;
    login_id: string;
    user_name: string | null;
  };
};

type ApiResponse = {
  ok: boolean;
  items: ApiItem[];
};

/**
 * チーム用タイムラインデータ取得
 * - 常に hook は呼び、enabled で fetch の有無のみ切り替え（hooks ルール順守）
 */
export function useTeamTimelineData(enabled: boolean = true) {
  const [members, setMembers] = useState<Member[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // enabled=false のときは no-op（状態は初期化して待機しない）
    if (!enabled) {
      setMembers([]);
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

        // メンバー抽出（user_name ?? login_id）
        const mMap = new Map<string, Member>();
        for (const it of items) {
          const id = it.user?.user_id || it.user_id;
          if (!id) continue;
          if (!mMap.has(id)) {
            mMap.set(id, {
              id,
              name: it.user?.user_name ?? it.user?.login_id ?? "(no name)",
            });
          }
        }
        const ms = Array.from(mMap.values());

        // スケジュール（dateは無視・minベース）
        const rawSchedules: Schedule[] = items
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

        const slotted = assignSlots(rawSchedules);

        setMembers(ms);
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
    () => ({ members, schedules, loading, error }),
    [members, schedules, loading, error]
  );
}
