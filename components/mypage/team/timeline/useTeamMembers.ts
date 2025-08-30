// components/mypage/team/timeline/useTeamMembers.ts
"use client";

import { useEffect, useState } from "react";
import { Member } from "@/types/schedule";

export function useTeamMembers(enabled: boolean = true) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setMembers([]);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/team/members", {
          method: "GET",
          credentials: "same-origin",
          headers: { "cache-control": "no-store" },
        });

        if (!mounted) return;

        if (!res.ok) {
          setError(`HTTP_${res.status}`);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const ms: Member[] = (data.members ?? []).map((m: any) => ({
          id: m.id,
          name: m.name ?? m.loginId ?? "(no name)",
        }));

        setMembers(ms);
        setError(null);
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

  return { members, loading, error };
}
