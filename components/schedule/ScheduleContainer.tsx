"use client";
import { useState } from "react";
import MyPageContent from "@/components/schedule/mypage/MyPageContent";
import TeamContent from "@/components/schedule/TeamContent";
import ProjectListContent from "@/components/schedule/projectlist/ProjectListContent";

export default function ScheduleContainer() {
  const [activeTab, setActiveTab] = useState<"team" | "mypage" | "project">(
    "mypage"
  );

  // === プロジェクトリストを親で管理 ===
  const [projectList, setProjectList] = useState<string[]>(["案件A", "案件B"]);

  // 1件追加
  const addProject = (name: string) => {
    if (name && !projectList.includes(name)) {
      setProjectList([...projectList, name]);
    }
  };

  // 1件削除
  const removeProject = (name: string) => {
    setProjectList(projectList.filter((p) => p !== name));
  };

  // まとめ削除
  const replaceProjects = (newList: string[]) => {
    setProjectList(newList);
  };

  // 今日の日付
  const today = new Date();
  const datePart = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekdayPart = "日月火水木金土"[today.getDay()];
  const formattedDateWithBrackets = `${datePart}（${weekdayPart}）`;

  return (
    <main className="p-6 bg-[#ece9e5] min-h-screen">
      {/* 日付表示 */}
      <div className="mb-2 text-lg font-semibold text-gray-800">
        {formattedDateWithBrackets}
      </div>

      {/* タブ切替 */}
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

      {/* コンテンツ切替 */}
      {activeTab === "mypage" && <MyPageContent projectList={projectList} />}
      {activeTab === "team" && <TeamContent />}
      {activeTab === "project" && (
        <ProjectListContent
          projectList={projectList}
          onAdd={addProject}
          onRemove={removeProject}
          onReplace={replaceProjects}
        />
      )}
    </main>
  );
}
