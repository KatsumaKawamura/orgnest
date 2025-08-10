"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AccountSettingsModal from "@/components/mypage/AccountSettingsModal";
import Header from "@/components/mypage/Header";

export default function Container({
  user: initialUser,
  initialSchedules,
}: any) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<"team" | "myschedule" | "project">(
    "myschedule"
  );
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
        userName={user.user_name || user.user_id}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        onEditAccount={() => setShowSettingsModal(true)}
        onLogout={handleLogout}
      />

      {/* タブ */}
      <div className="mb-4 flex space-x-4 border-b border-gray-300">
        {["team", "myschedule", "project"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === tab
                ? "border-b-2 border-gray-800 text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "team"
              ? "Team"
              : tab === "myschedule"
              ? "My Schedule"
              : "Project List"}
          </button>
        ))}
      </div>

      {activeTab === "myschedule" && <div>MySchedule Content（復元予定）</div>}
      {activeTab === "team" && <div>Team Content（復元予定）</div>}
      {activeTab === "project" && <div>Project List Content（復元予定）</div>}

      {showSettingsModal && (
        <AccountSettingsModal
          title="アカウント設定"
          initialName={user.user_name || ""}
          initialEmail={user.contact || ""}
          onClose={() => setShowSettingsModal(false)}
          onUpdated={(newData) =>
            setUser((prev: any) => ({ ...prev, ...newData }))
          }
        />
      )}
    </main>
  );
}
