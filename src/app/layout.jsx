import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Karya AI',
  description: 'AI-powered GTM workspace - From Idea to Customers in 90 Days',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
