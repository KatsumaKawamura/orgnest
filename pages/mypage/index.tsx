import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { GetServerSidePropsContext, GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import Mypage from "@/components/mypage/Container"; // ← 修正

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user_id: string;
    };

    // ユーザー情報を直接取得
    const { data: user, error } = await supabase
      .from("users")
      .select("user_id, login_id, contact, user_name")
      .eq("user_id", decoded.user_id)
      .single();

    if (error || !user) {
      return { redirect: { destination: "/", permanent: false } };
    }

    return { props: { user } };
  } catch {
    return { redirect: { destination: "/", permanent: false } };
  }
};

export default function Page({ user }: { user: any }) {
  return <Mypage user={user} />; // ← 修正
}
