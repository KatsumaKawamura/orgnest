// hooks/forms/useTeamAuthForm.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  validateUserId,
  validatePassword,
  validateConfirmPassword,
  USER_ID_RE, // TEAM_ID も同仕様を踏襲
  type ErrorCode,
} from "@/lib/validators/auth";

/** /api/team/check-team-login-id?team_login_id=xxx を叩く */
async function checkTeamLoginIdAvailable(
  teamLoginId: string
): Promise<boolean | "unknown"> {
  try {
    const res = await fetch(
      `/api/team/check-team-login-id?team_login_id=${encodeURIComponent(
        teamLoginId
      )}`,
      {
        method: "GET",
        credentials: "same-origin",
        headers: { "cache-control": "no-store" },
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data?.available !== "boolean") return "unknown";
    return !!data.available;
  } catch {
    return "unknown";
  }
}

type Mode = "create" | "update";

/** 無印のフォームカードと同じ“狭いユニオン”に揃える */
export type TeamFieldErrors = Partial<{
  teamId: "REQUIRED" | "USER_ID_FORMAT";
  password: "REQUIRED" | "PASSWORD_LENGTH" | "PASSWORD_CHARSET";
  confirmPassword: "REQUIRED" | "CONFIRM_MISMATCH";
}>;

type Initial = Partial<{
  team_login_id: string;
  team_name: string | null;
  contact: string | null;
}>;

type Options = {
  mode: Mode;
  initial?: Initial;
  debounceMs?: number; // 無印に合わせて既定は 450ms
};

type Availability = "unknown" | "available" | "taken" | "error";

export function useTeamAuthForm({ mode, initial, debounceMs = 450 }: Options) {
  // ---- values ----
  const [teamId, setTeamId] = useState(initial?.team_login_id ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [teamName, setTeamName] = useState(initial?.team_name ?? "");

  // ---- touched ----
  const [touched, setTouched] = useState({
    teamId: false,
    password: false,
    confirmPassword: false,
  });
  const touch = {
    teamId: () => setTouched((t) => ({ ...t, teamId: true })),
    password: () => setTouched((t) => ({ ...t, password: true })),
    confirmPassword: () => setTouched((t) => ({ ...t, confirmPassword: true })),
    all: () =>
      setTouched({ teamId: true, password: true, confirmPassword: true }),
  };

  // ---- sync field errors（狭いユニオンで返す）----
  const fieldErrors: TeamFieldErrors = useMemo(() => {
    const e: TeamFieldErrors = {};
    // TEAM_ID
    const idErr = validateUserId(teamId);
    if (idErr) e.teamId = idErr as TeamFieldErrors["teamId"];
    // PASSWORD / CONFIRM
    if (mode === "create") {
      const pwErr = validatePassword(password);
      if (pwErr) e.password = pwErr as TeamFieldErrors["password"];
    } else {
      if (password) {
        const pwErr = validatePassword(password);
        if (pwErr) e.password = pwErr as TeamFieldErrors["password"];
      }
    }
    if (password) {
      const ce = validateConfirmPassword(password, confirmPassword);
      if (ce) e.confirmPassword = ce as TeamFieldErrors["confirmPassword"];
    } else if (mode === "create") {
      const ce = validateConfirmPassword(password, confirmPassword); // create: confirm も必須
      if (ce) e.confirmPassword = ce as TeamFieldErrors["confirmPassword"];
    }
    return e;
  }, [mode, teamId, password, confirmPassword]);

  const hasBlockingError = useMemo(
    () =>
      Boolean(
        fieldErrors.teamId ||
          fieldErrors.password ||
          fieldErrors.confirmPassword
      ),
    [fieldErrors]
  );

  // ---- dirty (update のみ意味あり) ----
  const dirty = useMemo(() => {
    if (mode === "create") return true;
    const baseId = initial?.team_login_id ?? "";
    const baseName = initial?.team_name ?? "";
    const baseContact = initial?.contact ?? "";
    return (
      teamId !== baseId ||
      teamName !== baseName ||
      contact !== baseContact ||
      password.length > 0
    );
  }, [mode, initial, teamId, teamName, contact, password]);

  // ---- availability（形式OKのときだけ非同期チェック）----
  const teamIdFormatError = useMemo<ErrorCode | undefined>(() => {
    if (!teamId) return "REQUIRED";
    if (!USER_ID_RE.test(teamId)) return "USER_ID_FORMAT";
    return undefined;
  }, [teamId]);

  // update で未変更なら即 available
  const skipCheck =
    mode === "update" && teamId === (initial?.team_login_id ?? "");

  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<Availability>("unknown");
  const timerRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    const id = (teamId ?? "").trim();

    // 入力なし or 形式NGならチェックしない
    if (!id || teamIdFormatError) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setChecking(false);
      setAvailability("unknown");
      return;
    }

    // update: 初期値と同じならAPI叩かない
    if (skipCheck) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setChecking(false);
      setAvailability("available");
      return;
    }

    // デバウンス
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const mySeq = ++seqRef.current;
    setChecking(true);

    timerRef.current = window.setTimeout(async () => {
      try {
        let result: Availability = "unknown";
        try {
          const ans = await checkTeamLoginIdAvailable(id); // boolean | "unknown"
          if (ans === "unknown") result = "error";
          else result = ans ? "available" : "taken";
        } catch {
          result = "error";
        }
        if (seqRef.current !== mySeq) return; // 古い応答は破棄
        setAvailability(result);
      } finally {
        if (seqRef.current === mySeq) setChecking(false);
      }
    }, debounceMs) as unknown as number;

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [teamId, teamIdFormatError, skipCheck, debounceMs]);

  // ---- can submit（無印と同様に taken で false を内包）----
  const canSubmit = useMemo(() => {
    if (checking) return false;
    if (hasBlockingError) return false;
    if (mode === "update" && !dirty) return false;
    if (availability === "taken") return false;
    return true;
  }, [mode, dirty, checking, hasBlockingError, availability]);

  // ---- utilities ----
  const reset = useCallback(() => {
    setTeamId(initial?.team_login_id ?? "");
    setPassword("");
    setConfirmPassword("");
    setContact(initial?.contact ?? "");
    setTeamName(initial?.team_name ?? "");
    setAvailability("unknown");
    setChecking(false);
    setTouched({ teamId: false, password: false, confirmPassword: false });
  }, [initial]);

  return {
    // 値と setter（Team 用のキー名で提供）
    values: { teamId, password, confirmPassword, contact, teamName },
    setters: {
      setTeamId,
      setPassword,
      setConfirmPassword,
      setContact,
      setTeamName,
    },

    // 同期エラー/状態
    fieldErrors,
    hasBlockingError,

    // 可用性
    availability, // "unknown" | "available" | "taken" | "error"
    checking,

    // 送信可否・差分
    dirty,
    canSubmit,

    // UI補助
    touched,
    touch,

    // ユーティリティ
    reset,
  } as const;
}

export type UseTeamAuthFormReturn = ReturnType<typeof useTeamAuthForm>;
