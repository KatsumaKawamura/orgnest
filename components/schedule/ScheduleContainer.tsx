// components/schedule/ScheduleContainer.tsx
"use client";

import { useState, useEffect } from "react";
import MyPageContent from "@/components/schedule/mypage/MyPageContent";
import TeamContent from "@/components/schedule/team/TeamContent";
import ProjectListContent from "@/components/schedule/projectlist/ProjectListContent";
import { MyPageCard } from "@/types/schedule";

export default function ScheduleContainer() {
  const [activeTab, setActiveTab] = useState<"team" | "mypage" | "project">(
    "mypage"
  );

  // === MyPage のカード ===
  const [mypageCards, setMypageCards] = useState<MyPageCard[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("mypage_cards");
      if (saved) setMypageCards(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse mypage_cards", e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("mypage_cards", JSON.stringify(mypageCards));
    } catch (e) {
      console.error("Failed to save mypage_cards", e);
    }
  }, [mypageCards]);

  // === MyPage で使うダミーのプロジェクト名（ローカル表示用） ===
  const [projectList] = useState<string[]>(["プロジェクトA", "プロジェクトB"]);

  // === 画面上部の日付表示 ===
  const today = new Date();
  const datePart = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];
  const formattedDateWithBrackets = `${datePart}（${weekday}）`;

  return (
    <main className="p-6 bg-[#ece9e5] min-h-screen">
      <div className="mb-2 text-lg font-semibold text-gray-800">
        {formattedDateWithBrackets}
      </div>

      {/* タブ */}
      <div className="mb-4 flex space-x-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "team"
              ? "border-b-2 border-gray-800 text-gray-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Team
        </button>
        <button
          onClick={() => setActiveTab("mypage")}
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "mypage"
              ? "border-b-2 border-gray-800 text-gray-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          My Page
        </button>
        <button
          onClick={() => setActiveTab("project")}
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === "project"
              ? "border-b-2 border-gray-800 text-gray-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Project List
        </button>
      </div>

      {/* 本文 */}
      {activeTab === "mypage" && (
        <MyPageContent
          projectList={projectList}
          cards={mypageCards}
          setCards={setMypageCards}
        />
      )}
      {activeTab === "team" && <TeamContent />}

      {/* ここは props なしでOK（hooksで自己完結） */}
      {activeTab === "project" && <ProjectListContent />}
    </main>
  );
}
