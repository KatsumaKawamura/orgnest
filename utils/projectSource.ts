// @/utils/projectSource.ts
import { useProjectApi, Project } from "@/hooks/useProjectApi";

// ※ サーバー/クライアントの両方から扱える単純な取得関数に分離
//   MyScheduleContainer（client）から呼び出すユーティリティ
export async function fetchProjectList(): Promise<string[]> {
  // 直接 useProjectApi は使えないので、API経由のフェッチに揃える
  // ここは単純に同じエンドポイントを叩く
  const res = await fetch("/api/project-list", {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    // 候補は空でも動作するため、失敗は空配列で返す
    return [];
  }
  const data = (await res.json()) as Project[];
  return data.map((p) => p.project);
}
