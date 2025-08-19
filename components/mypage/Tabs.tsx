"use client";

import { LayoutGroup, motion, MotionConfig } from "framer-motion";

export type TabKey = "team" | "myschedule" | "project";

const labels: Record<TabKey, string> = {
  team: "Team",
  myschedule: "My Schedule",
  project: "Project List",
};

export default function Tabs({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const keys: TabKey[] = ["team", "myschedule", "project"];

  // 最長ラベルの長さを取得
  const maxLabelLength = Math.max(...keys.map((k) => labels[k].length));
  // 文字数ベースで幅を決める（ちょっと余裕を足す）
  const tabWidthEm = maxLabelLength - 2; // ex) 最長+2文字分

  return (
    <div className="mb-4 border-b border-gray-300">
      <MotionConfig reducedMotion="never">
        <LayoutGroup>
          <div className="flex space-x-4">
            {keys.map((key) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className={[
                    "relative px-4 py-2 text-sm font-semibold text-center",
                    isActive
                      ? "text-gray-800"
                      : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                  style={{ width: `${tabWidthEm}em` }}
                >
                  {labels[key]}

                  {isActive && (
                    <motion.span
                      layoutId="tabs-underline"
                      className="absolute left-0 right-0 bottom-0 h-[2px] bg-gray-800 rounded"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                        mass: 0.2,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}
