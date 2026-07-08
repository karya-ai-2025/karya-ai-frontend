import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Providers from '@/components/Providers';
import ChatLauncher from '@/components/ChatLauncher';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata = {
  title: 'Karya AI',
  description: 'AI-powered GTM workspace - From Idea to Customers in 90 Days',
  icons: {
    icon: '/karya-ai-logo.png',
    shortcut: '/karya-ai-logo.png',
    apple: '/karya-ai-logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={`${jakarta.className} bg-white text-gray-900`}>
        <Providers>{children}</Providers>
        <ChatLauncher />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
