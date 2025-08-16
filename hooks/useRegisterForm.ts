// hooks/useRegisterForm.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  validateUserId,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validators/auth";

/** USER_IDの利用可否:
 *  - true  : 利用可（未登録）
 *  - false : 利用不可（重複あり）
 *  - null  : 未判定/判定不能
 */
type Availability = boolean | null;

type FieldErrors = {
  userId?: string;
  password?: string;
  confirmPassword?: string;
  contact?: string;
  userName?: string;
};

export function useRegisterForm() {
  // --- 入力値 ---
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  // --- USER_ID重複チェック ---
  const [availability, setAvailability] = useState<Availability>(null);
  const [checking, setChecking] = useState(false);

  // 直近問い合わせの識別（レース対策）
  const seqRef = useRef(0);

  // 入力バリデーション（形式チェック）
  const fieldErrors: FieldErrors = useMemo(() => {
    const errs: FieldErrors = {};

    const msgId = validateUserId(userId.trim());
    if (msgId) errs.userId = msgId;

    const msgPw = validatePassword(password);
    if (msgPw) errs.password = msgPw;

    const msgConfirm = validateConfirmPassword(password, confirmPassword);
    if (msgConfirm) errs.confirmPassword = msgConfirm;

    return errs;
  }, [userId, password, confirmPassword]);

  // 「登録」ボタンをブロックすべきか（形式エラー or USER_ID重複 or 照会中）
  const hasBlockingError = useMemo(() => {
    if (
      fieldErrors.userId ||
      fieldErrors.password ||
      fieldErrors.confirmPassword
    )
      return true;
    if (availability === false) return true; // 重複
    if (checking) return true;
    return false;
  }, [fieldErrors, availability, checking]);

  // USER_IDの重複チェック（debounce）
  useEffect(() => {
    const raw = userId.trim();

    // 入力が空 or 形式不正のときは問い合わせしない
    if (!raw || validateUserId(raw)) {
      setAvailability(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    setAvailability(null);

    const currentSeq = ++seqRef.current;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch("/api/check-login-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login_id: raw }),
        });

        if (seqRef.current !== currentSeq) return; // 古い応答は破棄

        if (!res.ok) {
          setAvailability(null);
          setChecking(false);
          return;
        }

        const json: { available?: boolean } = await res.json();
        setAvailability(
          json.available === true
            ? true
            : json.available === false
            ? false
            : null
        );
      } catch {
        setAvailability(null);
      } finally {
        if (seqRef.current === currentSeq) setChecking(false);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [userId]);

  return {
    // 値
    userId,
    password,
    confirmPassword,
    contact,
    userName,

    // セッター
    setUserId,
    setPassword,
    setConfirmPassword,
    setContact,
    setUserName,

    // 可用性
    availability, // true=利用可 / false=重複 / null=未判定
    setAvailability, // 互換のために残す
    checking,

    // バリデーション表示用
    fieldErrors,
    hasBlockingError,
  } as const;
}

export default useRegisterForm;
