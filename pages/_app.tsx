import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import "@/styles/popover-motion.css";
import "@/styles/basemodal-motion.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
