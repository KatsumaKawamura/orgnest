// @/hooks/useAccountForm.ts
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** 共通仕様：login_id は小文字英字と _ のみ、1〜32 文字 */
const LOGIN_ID_RE = /^[a-z_]{1,32}$/;

type Mode = "create" | "update";

export type AccountValues = {
  userId: string; // = login_id
  password: string;
  confirmPassword: string;
  contact: string;
  userName: string;
};

export type Availability = {
  userId?: "unknown" | "available" | "taken";
};

export type Checking = {
  userId: boolean;
};

export type AccountFieldErrors = Partial<{
  userId: string;
  password: string;
  confirmPassword: string;
  contact: string;
  userName: string;
}>;

type Initial = Partial<{
  login_id: string;
  user_name: string | null;
  contact: string | null;
}>;

type Options = {
  mode: Mode;
  initial?: Initial; // update時のみ使用
  checkDelayMs?: number; // デフォルト 450ms
};

export function useAccountForm({ mode, initial, checkDelayMs = 450 }: Options) {
  // ---- state ----
  const [userId, setUserId] = useState(initial?.login_id ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [userName, setUserName] = useState(initial?.user_name ?? "");

  // ---- availability / checking ----
  const [availability, setAvailability] = useState<Availability>({
    userId: "unknown",
  });
  const [checking, setChecking] = useState<Checking>({ userId: false });

  // デバウンス＆キャンセル用
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ---- field errors（同期バリデーション）----
  const fieldErrors: AccountFieldErrors = useMemo(() => {
    const e: AccountFieldErrors = {};
    // USER_ID（必須 + 文字種）
    if (!userId) e.userId = "入力してください";
    else if (!LOGIN_ID_RE.test(userId))
      e.userId = "小文字英字と _ のみ使用できます（1〜32文字）";

    // PASSWORD / CONFIRM
    if (mode === "create") {
      if (!password) e.password = "入力してください";
    }
    if (password) {
      if (password !== confirmPassword)
        e.confirmPassword = "PASSWORDが一致しません";
    }
    // contact / userName は任意（必要ならここに追記）
    return e;
  }, [mode, userId, password, confirmPassword]);

  const hasBlockingError = useMemo(() => {
    // create: userId必須 + 形式 + password必須 + confirm一致
    // update: userId必須 + 形式 + (password入っていれば一致)
    return Boolean(
      fieldErrors.userId || fieldErrors.password || fieldErrors.confirmPassword
    );
  }, [fieldErrors]);

  // ---- dirty（update時のみ意味がある）----
  const dirty = useMemo(() => {
    if (mode === "create") return true; // 新規は常に「変更あり」と扱う
    const baseId = initial?.login_id ?? "";
    const baseName = initial?.user_name ?? "";
    const baseContact = initial?.contact ?? "";
    const idChanged = userId !== baseId;
    const nameChanged = userName !== baseName;
    const contactChanged = contact !== baseContact;
    const passwordChanged = password.length > 0; // 空は未変更扱い
    return idChanged || nameChanged || contactChanged || passwordChanged;
  }, [mode, initial, userId, userName, contact, password]);

  // ---- submit可否 ----
  const canSubmit = useMemo(() => {
    if (checking.userId) return false;
    if (hasBlockingError) return false;
    if (mode === "update" && !dirty) return false;
    return true;
  }, [mode, dirty, checking.userId, hasBlockingError]);

  // ---- 重複チェック（userIdの変更時のみ / update は初期値と同じならスキップ）----
  useEffect(() => {
    // フロントでも入力をはじく仕様のため、形式不正・空は即 unknown / checking false
    if (!userId || !LOGIN_ID_RE.test(userId)) {
      setChecking((p) => ({ ...p, userId: false }));
      setAvailability((p) => ({ ...p, userId: "unknown" }));
      // 中断
      if (abortRef.current) abortRef.current.abort();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      return;
    }

    // update で初期値と同じなら API 叩かない
    if (mode === "update" && userId === (initial?.login_id ?? "")) {
      setChecking((p) => ({ ...p, userId: false }));
      setAvailability((p) => ({ ...p, userId: "available" })); // 自分のIDはOK扱い
      return;
    }

    // デバウンス開始
    setChecking((p) => ({ ...p, userId: true }));
    setAvailability((p) => ({ ...p, userId: "unknown" }));

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortRef.current) abortRef.current.abort();

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(
          `/api/check-login-id?login_id=${encodeURIComponent(userId)}`,
          {
            method: "GET",
            credentials: "same-origin",
            signal: controller.signal,
          }
        );

        const data = await res.json().catch(() => ({} as any));
        if (!res.ok) {
          // 400 などのバリデーションエラーは「unknown」のままにしてフォームに任せる
          setAvailability((p) => ({ ...p, userId: "unknown" }));
        } else {
          const ok =
            typeof data?.available === "boolean"
              ? data.available
              : data?.status === "available";
          setAvailability((p) => ({
            ...p,
            userId: ok ? "available" : "taken",
          }));
        }
      } catch {
        // ネットワーク系は unknown のまま
        setAvailability((p) => ({ ...p, userId: "unknown" }));
      } finally {
        setChecking((p) => ({ ...p, userId: false }));
      }
    }, checkDelayMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, mode, initial?.login_id, checkDelayMs]);

  // ---- utilities ----
  const reset = useCallback(() => {
    setUserId(initial?.login_id ?? "");
    setPassword("");
    setConfirmPassword("");
    setContact(initial?.contact ?? "");
    setUserName(initial?.user_name ?? "");
    setAvailability({ userId: "unknown" });
    setChecking({ userId: false });
  }, [initial]);

  // ---- exports ----
  return {
    // 値
    values: {
      userId,
      password,
      confirmPassword,
      contact,
      userName,
    } as AccountValues,
    // セッター
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
    availability,
    checking,
    // 送信可否・差分
    dirty,
    canSubmit,
    // ユーティリティ
    reset,
  };
}

export type UseAccountFormReturn = ReturnType<typeof useAccountForm>;
