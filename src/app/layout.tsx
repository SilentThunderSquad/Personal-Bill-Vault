import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import './globals.css';

// All pages use Clerk auth — force dynamic rendering to avoid build-time env errors
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Warranty Vault — Never Lose a Bill Again',
  description:
    'Store, organize, and track all your purchase bills and warranties in one secure place. Get smart reminders before warranties expire.',
  keywords: ['warranty tracker', 'bill organizer', 'invoice storage', 'warranty reminder'],
  openGraph: {
    title: 'Warranty Vault',
    description: 'Your digital vault for bills and warranties',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#3B82F6',
          colorBackground: '#0F172A',
          colorText: '#F9FAFB',
          colorInputBackground: '#050816',
          colorInputText: '#F9FAFB',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'border border-[rgba(212,165,116,0.25)]',
          formButtonPrimary:
            'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg',
          footerActionLink: 'text-[#D4A574] hover:text-[#F4E3C3]',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased" suppressHydrationWarning>{children}</body>
      </html>
    </ClerkProvider>
  );
}
