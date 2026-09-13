import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Alight Motion - Aktivasi Premium Free',
  description: 'Dashboard aktivasi akun alight motion premium.',
  openGraph: {
    title: 'Alight Motion - Aktivasi Premium Free',
    description: 'Dashboard aktivasi akun alight motion premium.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alight Motion - Aktivasi Premium Free',
    description: 'Dashboard aktivasi akun alight motion premium.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
