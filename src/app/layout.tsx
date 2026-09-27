import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'School Relief Planning Platform | Automated Substitute Assignment',
  description:
    'Comprehensive School Relief Planning web app with welfare constraint checks, fixed period timings, and automated venue & recess remarks generation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} School Relief Planning System • Welfare Compliant & Automated Remarks</p>
        </footer>
      </body>
    </html>
  );
}
