// src/pages/_app.tsx
import Head from "next/head";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import "@/styles/popover-motion.css";
import "@/styles/basemodal-motion.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
}
