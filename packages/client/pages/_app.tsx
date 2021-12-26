import "../styles/globals.css";
import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import {fetcher} from '../lib/fetcher';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 120000,
        revalidateOnFocus: false,
      }}
    >
      <div className="flex flex-col min-h-screen bg-dark-tertiary">
        <Component {...pageProps} />
      </div>
    </SWRConfig>
  );
}

export default MyApp;
