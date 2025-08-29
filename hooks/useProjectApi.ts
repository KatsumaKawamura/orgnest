// @/hooks/useProjectApi.ts
import { useCallback } from "react";

export interface Project {
  id: string; // uuid
  project: string; // name
}

async function jsonFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const j = await res.json();
      msg = j?.error ?? msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export function useProjectApi() {
  const getProjects = useCallback(async (): Promise<Project[]> => {
    return jsonFetch<Project[]>("/api/project-list");
  }, []);

  const addProject = useCallback(async (name: string): Promise<Project> => {
    return jsonFetch<Project>("/api/project-list", {
      method: "POST",
      body: JSON.stringify({ project: name }),
    });
  }, []);

  const updateProject = useCallback(
    async (id: string, name: string): Promise<Project> => {
      return jsonFetch<Project>(`/api/project-list/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ project: name }),
      });
    },
    []
  );

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    await jsonFetch<{ ok: true }>(`/api/project-list/${id}`, {
      method: "DELETE",
    });
  }, []);

  const bulkDeleteProjects = useCallback(
    async (ids: string[]): Promise<void> => {
      // MVP: 単体DELETEを順次実行（件数少想定）
      for (const id of ids) {
        await jsonFetch<{ ok: true }>(`/api/project-list/${id}`, {
          method: "DELETE",
        });
      }
    },
    []
  );

  return {
    getProjects,
    addProject,
    updateProject,
    deleteProject,
    bulkDeleteProjects,
  };
}
