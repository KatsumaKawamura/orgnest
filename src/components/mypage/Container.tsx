// @/components/mypage/Container.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import FormModal from "@/components/common/modal/FormModal"; // ← 差し替え
import SettingsModal from "@/components/account/SettingsModal";
import Header from "@/components/mypage/Header";
import Tabs, { TabKey } from "@/components/mypage/Tabs";

// ← 追加：ProjectList を差し込むためのコンテナ
import ProjectListContainer from "@/components/mypage/projectlist/ProjectListContainer";
import MyScheduleContainer from "@/components/mypage/myschedule/MyScheduleContainer";
import TeamContainer from "@/components/mypage/team/TeamContainer";

export default function Container({
  user: initialUser,
  initialSchedules,
}: any) {
  const router = useRouter();

  // ★ 親SSOT：user を state で保持（setUser あり）
  const [user, setUser] = useState(initialUser);

  const [activeTab, setActiveTab] = useState<TabKey>("myschedule");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // ★ 親SSOT: 選択中の日付
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const datePart = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekdayPart = "日月火水木金土"[today.getDay()];
  const formattedDateWithBrackets = `${datePart}（${weekdayPart}）`;

  const handleLogout = async () => {
    await fetch("/api/account/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <main className="p-6 bg-[#ece9e5] min-h-screen">
      <Header
        dateLabel={formattedDateWithBrackets}
        userName={user.user_name || user.login_id}
        onEditAccount={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
      />

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "myschedule" && <MyScheduleContainer />}
      {activeTab === "team" && <TeamContainer />}
      {activeTab === "project" && <ProjectListContainer />}

      {showSettingsModal && (
        <FormModal
          open={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          backdropProps={{ className: "fixed inset-0 z-[1000] bg-black/50" }}
          containerProps={{
            className: "fixed inset-0 grid place-items-center p-4",
          }}
        >
          <SettingsModal
            initial={{
              login_id: user.login_id ?? "",
              user_name: user.user_name ?? "",
              contact: user.contact ?? "",
            }}
            // ★ 成功時に親SSOT更新
            onUpdated={(u) => setUser((prev: any) => ({ ...prev, ...u }))}
            onClose={() => setShowSettingsModal(false)}
          />
        </FormModal>
      )}
    </main>
  );
}
