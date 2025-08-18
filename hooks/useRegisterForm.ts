// hooks/useRegisterForm.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Availability,
  AvailabilityStatus,
  Checking,
} from "@/types/register";

type FieldErrors = {
  userId?: string;
  password?: string;
  confirmPassword?: string;
  contact?: string;
  userName?: string;
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function useRegisterForm() {
  // 入力値
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [userName, setUserName] = useState("");

  // availability / checking（正準型）
  const [availabilityStatus, setAvailabilityStatus] =
    useState<AvailabilityStatus>("unknown");
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);

  // ユーザーID重複チェックのデバウンス & 世代管理
  const timerRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    // 入力が空なら確認不要
    if (!userId.trim()) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setIsCheckingUserId(false);
      setAvailabilityStatus("unknown");
      return;
    }

    // デバウンス
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const mySeq = ++seqRef.current;
    setIsCheckingUserId(true);

    timerRef.current = window.setTimeout(async () => {
      try {
        // まず POST を試す
        let available: boolean | undefined;
        try {
          const res = await fetch("/api/check-login-id", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login_id: userId }),
            credentials: "same-origin",
          });
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            if (typeof data?.available === "boolean") {
              available = data.available;
            } else if (data?.status === "available") {
              available = true;
            } else if (data?.status === "taken") {
              available = false;
            }
          }
        } catch {
          /* noop: POST 失敗時は GET にフォールバック */
        }

        // フォールバック: GET
        if (available === undefined) {
          try {
            const res = await fetch(
              `/api/check-login-id?login_id=${encodeURIComponent(userId)}`,
              { credentials: "same-origin" }
            );
            if (res.ok) {
              const data = await res.json().catch(() => ({}));
              if (typeof data?.available === "boolean") {
                available = data.available;
              } else if (data?.status === "available") {
                available = true;
              } else if (data?.status === "taken") {
                available = false;
              }
            }
          } catch {
            /* 最終的に undefined のままなら unknown */
          }
        }

        if (seqRef.current !== mySeq) return; // 古い応答は破棄

        setAvailabilityStatus(
          available === true
            ? "available"
            : available === false
            ? "taken"
            : "unknown"
        );
      } finally {
        if (seqRef.current === mySeq) setIsCheckingUserId(false);
      }
    }, 450);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [userId]);

  // バリデーション（文言は最低限・「入力してください。」を出す）
  const fieldErrors: FieldErrors = useMemo(() => {
    const e: FieldErrors = {};

    if (!userId.trim()) e.userId = "入力してください。";

    if (!password) e.password = "入力してください。";
    else if (password.length < 4) e.password = "4文字以上で入力してください。";

    if (!confirmPassword) e.confirmPassword = "入力してください。";
    else if (confirmPassword !== password)
      e.confirmPassword = "PASSWORDが一致しません。";

    if (contact && !isEmail(contact))
      e.contact = "メールアドレスの形式が正しくありません。";

    // userName は任意入力（エラーなし）
    return e;
  }, [userId, password, confirmPassword, contact]);

  const hasBlockingError = useMemo(
    () =>
      Boolean(
        fieldErrors.userId ||
          fieldErrors.password ||
          fieldErrors.confirmPassword ||
          fieldErrors.contact ||
          fieldErrors.userName
      ),
    [fieldErrors]
  );

  // 返却（正準型）
  const availability: Availability = { userId: availabilityStatus };
  const checking: Checking = { userId: isCheckingUserId };

  return {
    // 値とsetter
    userId,
    password,
    confirmPassword,
    contact,
    userName,
    setUserId,
    setPassword,
    setConfirmPassword,
    setContact,
    setUserName,

    // バリデーション関連
    fieldErrors,
    hasBlockingError,

    // 正準型
    availability,
    checking,
  } as const;
}
