"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TeamRegisterFormCard, {
  TeamRegisterValues,
  TeamRegisterSetters,
  TeamRegisterFieldErrors,
  TeamRegisterAvailability,
  TeamRegisterTouched,
  TeamRegisterTouch,
} from "@/components/teamauth/TeamRegisterFormCard";
import TeamRegisterReviewDialog from "@/components/teamauth/TeamRegisterReviewDialog";
import ProgressDialog from "@/components/common/modal/ProgressDialog";
import { USER_ID_RE, PASSWORD_RE } from "@/lib/validators/auth";

type ViewMode = "form" | "review";

export interface TeamRegisterModalProps {
  onClose: () => void;
  onRegistered?: (team: { team_id: string; team_name: string | null }) => void;
}

export default function TeamRegisterModal({
  onClose,
  onRegistered,
}: TeamRegisterModalProps) {
  const [mode, setMode] = useState<ViewMode>("form");
  const [generalError, setGeneralError] = useState<string | null>(null);

  // 進捗ダイアログ
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressStatus, setProgressStatus] = useState<
    "processing" | "done" | "error"
  >("processing");
  const [progressMessage, setProgressMessage] = useState<string | undefined>();

  // ---- フォーム状態（USER版 useAuthForm の最小移植） ----
  const [values, setValues] = useState<TeamRegisterValues>({
    teamId: "",
    password: "",
    confirmPassword: "",
    contact: "",
    teamName: "",
  });

  const setters: TeamRegisterSetters = {
    setTeamId: (v) => setValues((s) => ({ ...s, teamId: v })),
    setPassword: (v) => setValues((s) => ({ ...s, password: v })),
    setConfirmPassword: (v) => setValues((s) => ({ ...s, confirmPassword: v })),
    setContact: (v) => setValues((s) => ({ ...s, contact: v })),
    setTeamName: (v) => setValues((s) => ({ ...s, teamName: v })),
  };

  const [touched, setTouched] = useState<TeamRegisterTouched>({
    teamId: false,
    password: false,
    confirmPassword: false,
  });
  const touch: TeamRegisterTouch = {
    teamId: () => setTouched((t) => ({ ...t, teamId: true })),
    password: () => setTouched((t) => ({ ...t, password: true })),
    confirmPassword: () => setTouched((t) => ({ ...t, confirmPassword: true })),
  };

  // 単項目＋相関（confirm）バリデーション
  const fieldErrors: TeamRegisterFieldErrors = useMemo(() => {
    const errs: TeamRegisterFieldErrors = {};
    const id = values.teamId.trim();
    const pw = values.password;
    const cf = values.confirmPassword;

    if (!id) errs.teamId = "REQUIRED";
    else if (!USER_ID_RE.test(id)) errs.teamId = "USER_ID_FORMAT";

    if (!pw) errs.password = "REQUIRED";
    else if (pw.length < 4 || pw.length > 72) errs.password = "PASSWORD_LENGTH";
    else if (!PASSWORD_RE.test(pw)) errs.password = "PASSWORD_CHARSET";

    if (!cf) errs.confirmPassword = "REQUIRED";
    else if (pw !== cf) errs.confirmPassword = "CONFIRM_MISMATCH";

    return errs;
  }, [values.teamId, values.password, values.confirmPassword]);

  const canSubmit = Object.keys(fieldErrors).length === 0;

  // ---- TEAM_ID 重複チェック（/api/team/check-team-login-id） ----
  const [availability, setAvailability] =
    useState<TeamRegisterAvailability>("unknown");
  const [checking, setChecking] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const id = values.teamId.trim();
    setAvailability("unknown");

    // 形式不正なら問い合わせない
    if (!id || !USER_ID_RE.test(id)) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch(
          `/api/team/check-team-login-id?team_login_id=${encodeURIComponent(
            id
          )}`,
          {
            method: "GET",
            credentials: "same-origin",
            headers: { "cache-control": "no-store" },
          }
        );
        const data = await res.json().catch(() => ({}));
        if (res.ok && typeof data?.available === "boolean") {
          setAvailability(data.available ? "available" : "taken");
        } else {
          setAvailability("error");
        }
      } catch {
        setAvailability("error");
      } finally {
        setChecking(false);
      }
    }, 400); // USER版と同等の体感になるよう軽めに
  }, [values.teamId]);

  // ---- 画面遷移制御 ----
  const handleToReview = () => {
    setGeneralError(null);
    if (!canSubmit) return;
    setMode("review");
  };

  const doRegister = async () => {
    setGeneralError(null);
    setProgressMessage("チームを作成しています…");
    setProgressStatus("processing");
    setProgressOpen(true);

    try {
      const res = await fetch("/api/team/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          team_login_id: values.teamId.trim(),
          password: values.password,
          contact: values.contact || null,
          team_name: values.teamName || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error || "INTERNAL_ERROR";

        let msg = "登録処理でエラーが発生しました";
        if (code === "LOGIN_ID_TAKEN")
          msg = "この TEAM_ID は既に使用されています";
        else if (code === "LOGIN_ID_INVALID") msg = "TEAM_ID の形式が不正です";
        else if (code === "PASSWORD_INVALID") msg = "PASSWORD の形式が不正です";
        else if (code === "INVALID_PAYLOAD") msg = "入力内容を確認してください";

        setProgressMessage(msg);
        setProgressStatus("error");
        setGeneralError(msg);
        return;
      }

      const data = await res.json(); // { ok:true, team_id, team_login_id }
      setProgressMessage("登録が完了しました。タブを切り替えています…");
      setProgressStatus("done");

      // A案：即タブ内切替（暫定データ）
      onRegistered?.({
        team_id: data?.team_id ?? values.teamId.trim(),
        team_name: values.teamName || null,
      });

      onClose();
    } catch {
      setGeneralError("ネットワークエラーが発生しました");
      setProgressMessage("ネットワークエラーが発生しました");
      setProgressStatus("error");
    }
  };

  // 入力が1つでもあれば true（touched ではなく値の有無で判定）
  const hasAnyInput =
    !!values.teamId ||
    !!values.password ||
    !!values.confirmPassword ||
    !!values.contact ||
    !!values.teamName;

  const handleCancelFromForm = () => {
    if (hasAnyInput) {
      // USER版は確認ダイアログ別モーダルだが、PhaseAは最小：そのまま閉じるか、必要ならDialog接続可
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <>
      {mode === "form" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <TeamRegisterFormCard
            values={values}
            setters={setters}
            fieldErrors={fieldErrors}
            availability={availability}
            checking={checking}
            canSubmit={canSubmit && availability !== "taken"}
            onCancel={handleCancelFromForm}
            onSubmit={handleToReview}
            touched={touched}
            touch={touch}
          />
          {generalError && (
            <p
              className="mt-3 text-center text-sm text-red-600"
              aria-live="polite"
            >
              {generalError}
            </p>
          )}
        </div>
      )}

      {mode === "review" && (
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
          <TeamRegisterReviewDialog
            values={values}
            onBack={() => setMode("form")}
            onConfirm={doRegister}
          />
        </div>
      )}

      <ProgressDialog
        open={progressOpen}
        status={progressStatus}
        message={progressMessage}
        actions={progressStatus === "processing" ? "none" : undefined}
        onClose={() => {
          if (progressStatus === "error") setProgressOpen(false);
        }}
      />
    </>
  );
}
