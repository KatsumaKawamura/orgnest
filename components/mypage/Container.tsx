// @/components/mypage/Container.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FadeModalWrapper from "@/components/common/FadeModalWrapper";
import SettingsModal from "@/components/account/SettingsModal";
import Header from "@/components/mypage/Header";
import Tabs, { TabKey } from "@/components/mypage/Tabs"; // ★ 追加

export default function Container({
  user: initialUser,
  initialSchedules,
}: any) {
  const router = useRouter();
  const [user] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<TabKey>("myschedule"); // ★ 型をTabsに合わせる
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const today = new Date();
  const datePart = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekdayPart = "日月火水木金土"[today.getDay()];
  const formattedDateWithBrackets = `${datePart}（${weekdayPart}）`;

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <main className="p-6 bg-[#ece9e5] min-h-screen">
      <Header
        dateLabel={formattedDateWithBrackets}
        userName={user.user_name || user.login_id}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        onEditAccount={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
      />

      {/* ★ タブ: 直書き→コンポーネント化（下線がぬるっと移動） */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "myschedule" && <div>MySchedule Content（復元予定）</div>}
      {activeTab === "team" && <div>Team Content（復元予定）</div>}
      {activeTab === "project" && <div>Project List Content（復元予定）</div>}

      {/* アカウント設定モーダル */}
      {showSettingsModal && (
        <FadeModalWrapper onClose={() => setShowSettingsModal(false)} asChild>
          <SettingsModal
            initial={{
              login_id: user.login_id ?? "",
              user_name: user.user_name ?? "",
              contact: user.contact ?? "",
            }}
            onClose={() => setShowSettingsModal(false)}
          />
        </FadeModalWrapper>
      )}
    </main>
  );
}
