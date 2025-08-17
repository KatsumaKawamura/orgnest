// hooks/useRegisterFormV2.ts
"use client";
import useRegisterFormLegacy from "@/hooks/useRegisterForm"; // 既存フックを流用
import type {
  Availability,
  AvailabilityStatus,
  Checking,
} from "@/types/register";

/**
 * 既存の useRegisterForm をラップし、
 * UIに露出する型を正準化（Availability/Checking）して返す。
 */
export function useRegisterFormV2() {
  const legacy = useRegisterFormLegacy() as any;

  // ---- values / setters はそのまま透過 ----
  const {
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
    fieldErrors,
    hasBlockingError,
  } = legacy;

  // ---- availability の正規化 ----
  // 旧: boolean/null or { userId: "available"|"taken"|"unknown" }
  // 新: Availability = { userId?: AvailabilityStatus }
  let availability: Availability = { userId: "unknown" };
  const a = legacy.availability;
  if (a && typeof a === "object" && "userId" in a) {
    availability = { userId: (a.userId ?? "unknown") as AvailabilityStatus };
  } else if (a === true) {
    availability = { userId: "available" };
  } else if (a === false) {
    availability = { userId: "taken" };
  } else {
    availability = { userId: "unknown" };
  }

  // ---- checking の正規化 ----
  // 旧: boolean or { userId: boolean }
  // 新: Checking = { userId: boolean }
  let checking: Checking = { userId: false };
  const c = legacy.checking;
  if (c && typeof c === "object" && "userId" in c) {
    checking = { userId: !!c.userId };
  } else {
    checking = { userId: !!c };
  }

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

    // ★正準化済み
    availability,
    checking,
  } as const;
}
