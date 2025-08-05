// /hooks/useProjectApi.ts
import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Project {
  id: number;
  name: string;
}

export function useProjectApi() {
  // 一覧取得
  const getProjects = useCallback(async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      console.error("Error fetching projects:", error.message);
      return [];
    }
    return data || [];
  }, []);

  // 追加
  const addProject = useCallback(
    async (name: string): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ name }])
        .select()
        .single();
      if (error) {
        console.error("Error adding project:", error.message);
        return null;
      }
      return data;
    },
    []
  );

  // 更新
  const updateProject = useCallback(
    async (id: number, name: string): Promise<Project | null> => {
      const { data, error } = await supabase
        .from("projects")
        .update({ name })
        .eq("id", id)
        .select()
        .single();
      if (error) {
        console.error("Error updating project:", error.message);
        return null;
      }
      return data;
    },
    []
  );

  // 削除（単体）
  const deleteProject = useCallback(async (id: number): Promise<boolean> => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      console.error("Error deleting project:", error.message);
      return false;
    }
    return true;
  }, []);

  // 削除（複数）
  const bulkDeleteProjects = useCallback(
    async (ids: number[]): Promise<boolean> => {
      const { error } = await supabase.from("projects").delete().in("id", ids);
      if (error) {
        console.error("Error bulk deleting projects:", error.message);
        return false;
      }
      return true;
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
