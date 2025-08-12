import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Mypage from "@/components/mypage/Container";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookies = context.req.headers.cookie
    ? parse(context.req.headers.cookie)
    : {};
  const token = cookies.session;

  if (!token) {
    return { redirect: { destination: "/", permanent: false } };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // ✅ sub / user_id の両対応。login_id でもフォールバック
    const userId: string | null = decoded?.user_id ?? decoded?.sub ?? null;
    const loginId: string | null =
      decoded?.login_id ?? decoded?.loginId ?? decoded?.loginID ?? null;

    if (!userId && !loginId) {
      return { redirect: { destination: "/", permanent: false } };
    }

    // まず user_id で検索 → 見つからなければ login_id で検索
    let user: {
      user_id: string;
      login_id: string;
      contact: string | null;
      user_name: string | null;
    } | null = null;

    if (userId) {
      const { data } = await supabase
        .from("users")
        .select("user_id, login_id, contact, user_name")
        .eq("user_id", userId)
        .single();
      user = data ?? null;
    }

    if (!user && loginId) {
      const { data } = await supabase
        .from("users")
        .select("user_id, login_id, contact, user_name")
        .eq("login_id", loginId)
        .single();
      user = data ?? null;
    }

    if (!user) {
      return { redirect: { destination: "/", permanent: false } };
    }

    return { props: { user } };
  } catch {
    return { redirect: { destination: "/", permanent: false } };
  }
};

export default function Page({ user }: { user: any }) {
  return <Mypage user={user} />;
}
