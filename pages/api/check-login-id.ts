// pages/api/check-login-id.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { login_id } = req.body;
  if (!login_id) return res.status(400).json({ error: "login_id is required" });

  const { data, error } = await supabase
    .from("users")
    .select("login_id")
    .eq("login_id", login_id)
    .single();

  if (error && error.code !== "PGRST116")
    return res.status(500).json({ error: error.message });

  return res.status(200).json({ available: !data }); // dataがなければ利用可能
}
