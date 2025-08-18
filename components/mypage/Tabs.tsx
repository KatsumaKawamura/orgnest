// @/components/mypage/Tabs.tsx
"use client";

export default function Tabs({
  activeTab,
  onChange,
}: {
  activeTab: "team" | "myschedule" | "project";
  onChange: (tab: "team" | "myschedule" | "project") => void;
}) {
  return (
    <div className="mb-4 flex space-x-4 border-b border-gray-300">
      {[
        { key: "team", label: "Team" },
        { key: "myschedule", label: "My Schedule" },
        { key: "project", label: "Project List" },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key as any)}
          className={`px-4 py-2 text-sm font-semibold ${
            activeTab === tab.key
              ? "border-b-2 border-gray-800 text-gray-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
