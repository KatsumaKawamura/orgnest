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

// USER_ID の形式チェック
export function validateUserId(v: string) {
  if (!v) return "入力してください";
  // 形式のみ（既存運用の「半角英数字と _ のみ」を維持）
  if (!USER_ID_RE.test(v)) return "半角英数字と _ のみ使用できます";
  return undefined;
}

// PASSWORD の形式チェック
export function validatePassword(v: string) {
  if (!v) return "入力してください";
  // 既存実装に合わせて 4〜72 文字（提示いただいた現行ファイルの文言を踏襲）
  if (v.length < 4 || v.length > 72) return "4〜72文字で入力してください";
  if (!PASSWORD_RE.test(v))
    return "半角英数字と記号のみ（スペース不可）で入力してください";
  return undefined;
}

// CONFIRM PASSWORD（確認用）
// USER_ID / PASSWORD と同じ「入力してください」をバリデータ側で返す方針に統一
export function validateConfirmPassword(password: string, confirm: string) {
  if (!confirm) return "入力してください";
  if (password !== confirm) return "確認用パスワードが一致しません";
  return undefined;
}

// Register は厳密チェック
export function assertValidRegister(body: any): asserts body is RegisterBody {
  const msgId = validateUserId(String(body?.login_id ?? ""));
  if (msgId) throw new Error(msgId);
  const msgPw = validatePassword(String(body?.password ?? ""));
  if (msgPw) throw new Error(msgPw);
}
