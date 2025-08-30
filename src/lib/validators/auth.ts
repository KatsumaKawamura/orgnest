// lib/validators/auth.ts
export const USER_ID_RE = /^[a-z0-9_]{1,32}$/; // 小文字英字 + '_' のみ
export const PASSWORD_RE = /^[\x21-\x7E]+$/; // 可視ASCII（スペース不可）

export type ErrorCode =
  | "REQUIRED"
  | "USER_ID_FORMAT"
  | "PASSWORD_LENGTH"
  | "PASSWORD_CHARSET"
  | "CONFIRM_MISMATCH";

export function validateUserId(v: string): ErrorCode | undefined {
  if (!v) return "REQUIRED";
  if (!USER_ID_RE.test(v)) return "USER_ID_FORMAT";
  return undefined;
}

export function validatePassword(v: string): ErrorCode | undefined {
  if (!v) return "REQUIRED";
  if (v.length < 4 || v.length > 72) return "PASSWORD_LENGTH";
  if (!PASSWORD_RE.test(v)) return "PASSWORD_CHARSET";
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): ErrorCode | undefined {
  if (!confirm) return "REQUIRED";
  if (password !== confirm) return "CONFIRM_MISMATCH";
  return undefined;
}
