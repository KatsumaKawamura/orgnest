// hooks/useRegisterForm.ts
"use client";
import { useEffect, useMemo, useState } from "react";

export type Availability = null | boolean;

export function useRegisterForm() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [userName, setUserName] = useState("");

  const [availability, setAvailability] = useState<Availability>(null);
  const [checking, setChecking] = useState(false);

  // USER_ID 可用性（遅延 500ms）
  useEffect(() => {
    if (!userId) {
      setAvailability(null);
      return;
    }
    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch("/api/check-login-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login_id: userId }),
        });
        const data = await res.json();
        setAvailability(data.available);
      } catch {
        setAvailability(null);
      } finally {
        setChecking(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [userId]);

  // リアルタイム検証
  const fieldErrors = useMemo(() => {
    const e: { userId?: string; password?: string; confirmPassword?: string } =
      {};
    if (!userId) e.userId = "入力してください";
    if (!password) e.password = "入力してください";
    if (!confirmPassword) e.confirmPassword = "入力してください";
    if (userId && availability === false)
      e.userId = "このUSER_IDは使用できません";
    if (password && confirmPassword && password !== confirmPassword) {
      e.confirmPassword = "パスワードが一致しません";
    }
    return e;
  }, [userId, password, confirmPassword, availability]);

  const hasBlockingError =
    !!fieldErrors.userId ||
    !!fieldErrors.password ||
    !!fieldErrors.confirmPassword;

  return {
    // values
    userId,
    password,
    confirmPassword,
    contact,
    userName,
    // setters
    setUserId,
    setPassword,
    setConfirmPassword,
    setContact,
    setUserName,
    // validation
    availability,
    checking,
    fieldErrors,
    hasBlockingError,
  };
}
