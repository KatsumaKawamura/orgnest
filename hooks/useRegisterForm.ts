// hooks/useRegisterForm.ts
"use client";

import { useMemo, useState } from "react";
import { validateUserId, validatePassword } from "@/lib/validators/auth";

type FieldErrors = {
  userId?: string;
  password?: string;
  confirmPassword?: string;
};

type Availability = boolean | null;

export function useRegisterForm() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [userName, setUserName] = useState("");

  const [availability, setAvailability] = useState<Availability>(null);
  const [checking, setChecking] = useState(false);

  const fieldErrors: FieldErrors = useMemo(() => {
    const e: FieldErrors = {};
    e.userId = validateUserId(userId);
    e.password = validatePassword(password);
    if (!confirmPassword) e.confirmPassword = "入力してください";
    else if (password !== confirmPassword)
      e.confirmPassword = "PASSWORD が一致しません";
    return e;
  }, [userId, password, confirmPassword]);

  const hasBlockingError =
    !!fieldErrors.userId ||
    !!fieldErrors.password ||
    !!fieldErrors.confirmPassword ||
    availability === false;

  return {
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
    availability,
    setAvailability,
    checking,
    setChecking,
    fieldErrors,
    hasBlockingError,
  } as const;
}

export default useRegisterForm;
