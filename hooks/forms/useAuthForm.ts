// hooks/forms/useAuthForm.ts
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  validateUserId,
  validatePassword,
  validateConfirmPassword,
  USER_ID_RE,
  type ErrorCode,
} from "@/lib/validators/auth";
import { checkLoginIdAvailable } from "@/lib/api/authClient";

type Mode = "create" | "update";

export type FieldErrors = Partial<{
  userId: ErrorCode;
  password: ErrorCode;
  confirmPassword: ErrorCode;
  contact: ErrorCode; // 任意
  userName: ErrorCode; // 任意
}>;

type Initial = Partial<{
  login_id: string;
  user_name: string | null;
  contact: string | null;
}>;

type Options = {
  mode: Mode;
  initial?: Initial;
  debounceMs?: number; // default 450
};

type Availability = "unknown" | "available" | "taken" | "error";

export function useAuthForm({ mode, initial, debounceMs = 450 }: Options) {
  // ---- values ----
  const [userId, setUserId] = useState(initial?.login_id ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [userName, setUserName] = useState(initial?.user_name ?? "");

  // ---- touched flags（UIで赤エラーを出すタイミング制御用）----
  const [touched, setTouched] = useState({
    userId: false,
    password: false,
    confirmPassword: false,
  });
  const touch = {
    userId: () => setTouched((t) => ({ ...t, userId: true })),
    password: () => setTouched((t) => ({ ...t, password: true })),
    confirmPassword: () => setTouched((t) => ({ ...t, confirmPassword: true })),
    all: () =>
      setTouched({ userId: true, password: true, confirmPassword: true }),
  };

  // ---- sync field errors (ErrorCode) ----
  const fieldErrors: FieldErrors = useMemo(() => {
    const e: FieldErrors = {};
    // USER_ID
    e.userId = validateUserId(userId);
    // PASSWORD / CONFIRM
    if (mode === "create") {
      e.password = validatePassword(password);
    } else {
      if (password) e.password = validatePassword(password); // update: 空は未変更
    }
    if (password) {
      const ce = validateConfirmPassword(password, confirmPassword);
      if (ce) e.confirmPassword = ce;
    } else if (mode === "create") {
      const ce = validateConfirmPassword(password, confirmPassword); // create: confirm も必須
      if (ce) e.confirmPassword = ce;
    }
    return e;
  }, [mode, userId, password, confirmPassword]);

  const hasBlockingError = useMemo(
    () =>
      Boolean(
        fieldErrors.userId ||
          fieldErrors.password ||
          fieldErrors.confirmPassword
      ),
    [fieldErrors]
  );

  // ---- dirty (update only meaningful) ----
  const dirty = useMemo(() => {
    if (mode === "create") return true;
    const baseId = initial?.login_id ?? "";
    const baseName = initial?.user_name ?? "";
    const baseContact = initial?.contact ?? "";
    return (
      userId !== baseId ||
      userName !== baseName ||
      contact !== baseContact ||
      password.length > 0
    );
  }, [mode, initial, userId, userName, contact, password]);

  // ---- availability (format OK のときだけ非同期チェック) ----
  const userIdFormatError = useMemo<ErrorCode | undefined>(() => {
    if (!userId) return "REQUIRED";
    if (!USER_ID_RE.test(userId)) return "USER_ID_FORMAT";
    return undefined;
  }, [userId]);

  // update で未変更なら即 available
  const skipCheck = mode === "update" && userId === (initial?.login_id ?? "");

  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<Availability>("unknown");

  const timerRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    const id = (userId ?? "").trim();

    // 入力なし or 形式NGならチェックしない
    if (!id || userIdFormatError) {
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
          const ans = await checkLoginIdAvailable(id); // boolean | "unknown"
          if (ans === "unknown") result = "error"; // ネットワーク等
          else result = ans ? "available" : "taken";
        } catch {
          result = "error";
        }

        if (seqRef.current !== mySeq) return; // 古い応答を破棄
        setAvailability(result);
      } finally {
        if (seqRef.current === mySeq) setChecking(false);
      }
    }, debounceMs) as unknown as number;

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [userId, userIdFormatError, skipCheck, debounceMs]);

  // ---- can submit ----
  const canSubmit = useMemo(() => {
    if (checking) return false;
    if (hasBlockingError) return false;
    if (mode === "update" && !dirty) return false;
    if (availability === "taken") return false;
    return true;
  }, [mode, dirty, checking, hasBlockingError, availability]);

  // ---- utilities ----
  const reset = useCallback(() => {
    setUserId(initial?.login_id ?? "");
    setPassword("");
    setConfirmPassword("");
    setContact(initial?.contact ?? "");
    setUserName(initial?.user_name ?? "");
    setAvailability("unknown");
    setChecking(false);
    setTouched({ userId: false, password: false, confirmPassword: false });
  }, [initial]);

  return {
    // 値と setter
    values: { userId, password, confirmPassword, contact, userName },
    setters: {
      setUserId,
      setPassword,
      setConfirmPassword,
      setContact,
      setUserName,
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

export type UseAuthFormReturn = ReturnType<typeof useAuthForm>;
