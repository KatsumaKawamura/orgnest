// @/components/mypage/projectlist/ProjectListContainer.tsx
"use client";

import { useEffect } from "react";
import { useProjectApi } from "@/hooks/useProjectApi";
import { useProjectList } from "@/hooks/useProjectList";
import ProjectListContent from "./ProjectListContent";

/** データ取得とフック接続だけを担当 */
export default function ProjectListContainer() {
  const api = useProjectApi();
  const state = useProjectList([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.getProjects();
        if (mounted) state.setProjects(data);
      } catch (e) {
        console.error("[ProjectList] fetch error:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []); // 初回のみ

  return <ProjectListContent state={state} api={api} />;
}
