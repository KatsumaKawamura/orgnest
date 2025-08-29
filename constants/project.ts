// @/constants/project.ts

/** ---- UI Tokens / Design ---- */
export const PROJECT_TEXT_COLOR = "text-gray-800" as const;

/** ---- Validation ---- */
export const PROJECT_NAME_MIN = 1 as const;
export const PROJECT_NAME_MAX = 100 as const;

/** ---- Placeholders ---- */
export const PROJECT_ADD_PLACEHOLDER = "New Project" as const;
export const PROJECT_EDIT_PLACEHOLDER =
  `プロジェクト名（${PROJECT_NAME_MIN}〜${PROJECT_NAME_MAX}文字）` as const;

/** ---- Messages ---- */
export const PROJECT_VALIDATION_ERROR =
  `${PROJECT_NAME_MIN}〜${PROJECT_NAME_MAX}文字で入力してください。` as const;
export const PROJECT_ADD_ERROR =
  "追加に失敗しました。しばらく待ってからもう一度お試しください。" as const;
export const PROJECT_SAVE_ERROR = "保存に失敗しました。" as const;
export const PROJECT_DELETE_ERROR = "削除に失敗しました。" as const;

export const PROJECT_EMPTY_MESSAGE = `` as const;
