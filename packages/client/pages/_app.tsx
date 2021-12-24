import '../styles/globals.css';
import 'tailwindcss/tailwind.css';
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen bg-dark-tertiary">
					<Component {...pageProps} />
				</div>
  )
}

export default MyApp
