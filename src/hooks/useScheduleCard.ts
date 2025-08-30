// hooks/useScheduleCard.ts
import { useState } from "react";
import { validateTimeRange, setDefaultTimes } from "@/utils/mypageUtils";
import { MyPageCard } from "@/types/schedule";

export function useScheduleCard(
  startHour: string,
  startMinute: string,
  endHour: string,
  endMinute: string,
  onChange: (updated: Partial<MyPageCard>) => void,
  onEditEnd?: () => void
) {
  const [dialogType, setDialogType] = useState<
    "none" | "autoAdjust" | "errorConfirm"
  >("none");
  const [dialogMessage, setDialogMessage] = useState<string | string[]>("");

  // 保存ボタン押下時の処理
  const handleSave = () => {
    const isStartEmpty = !startHour || !startMinute;
    const isEndEmpty = !endHour || !endMinute;

    // 両方空
    if (isStartEmpty && isEndEmpty) {
      setDialogType("errorConfirm");
      setDialogMessage([
        "開始時間と終了時間が未入力です。",
        "変更を破棄して編集を終了しますか？",
      ]);
      return;
    }

    // どちらか空
    if (isStartEmpty || isEndEmpty) {
      let msg = "以下の項目が未入力です。\n";
      if (isStartEmpty) msg += "開始時間 → 8:30\n";
      if (isEndEmpty) msg += "終了時間 → 23:55\n";
      msg += "自動で調整して保存しますか？";

      setDialogType("autoAdjust");
      setDialogMessage(msg.split("\n"));
      return;
    }

    // バリデーション
    const error = validateTimeRange(startHour, startMinute, endHour, endMinute);
    if (error) {
      setDialogType("errorConfirm");
      setDialogMessage([error, "変更を破棄して編集を終了しますか？"]);
      return;
    }

    // 正常
    if (onEditEnd) onEditEnd();
  };

  // ダイアログ確認
  const handleDialogConfirm = () => {
    if (dialogType === "autoAdjust") {
      const adjusted = setDefaultTimes(
        startHour,
        startMinute,
        endHour,
        endMinute
      );
      onChange(adjusted);
      if (onEditEnd) onEditEnd();
    } else if (dialogType === "errorConfirm") {
      if (onEditEnd) onEditEnd();
    }
    setDialogType("none");
  };

  const handleDialogCancel = () => setDialogType("none");

  return {
    dialogType,
    dialogMessage,
    handleSave,
    handleDialogConfirm,
    handleDialogCancel,
  };
}
