// lib/validators/auth.ts
export const USER_ID_RE = /^[A-Za-z0-9_]+$/; // 大小英数字 + _
export const PASSWORD_RE = /^[\x21-\x7E]+$/; // 半角英数字 + 記号（スペース不可）

export type RegisterBody = {
  login_id: string;
  password: string;
  contact?: string | null;
  user_name?: string | null;
};

export type LoginBody = {
  login_id: string;
  password: string;
};

export function validateUserId(v: string): string | undefined {
  if (!v) return "入力してください";
  if (v.length > 32) return "32文字以内で入力してください";
  if (!USER_ID_RE.test(v)) return "半角英数字と _ のみ使用できます";
  return undefined;
}

export function validatePassword(v: string): string | undefined {
  if (!v) return "入力してください";
  // ↓ 最小長を 4 に変更
  if (v.length < 4 || v.length > 72) return "4〜72文字で入力してください";
  if (!PASSWORD_RE.test(v))
    return "半角英数字と記号のみ（スペース不可）で入力してください";
  return undefined;
}

// Register は厳密チェック
export function assertValidRegister(body: any): asserts body is RegisterBody {
  const msgId = validateUserId(String(body?.login_id ?? ""));
  if (msgId) throw new Error(msgId);
  const msgPw = validatePassword(String(body?.password ?? ""));
  if (msgPw) throw new Error(msgPw);
}
