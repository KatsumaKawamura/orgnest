// ui/i18n/errorMessages.ts
import type { ErrorCode } from "@/lib/validators/auth";

export const errorMessagesJA: Record<ErrorCode, string> = {
  REQUIRED: "入力してください",
  USER_ID_FORMAT: "小文字英字と _ のみ／1〜32文字",
  PASSWORD_LENGTH: "4〜72文字で入力してください",
  PASSWORD_CHARSET: "半角の英数字・記号のみ（スペース不可）で入力してください",
  CONFIRM_MISMATCH: "PASSWORDが一致しません",
};
