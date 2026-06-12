import type { Metadata } from 'next';
import './globals.css';
import { StudentProvider } from '@/lib/student-context';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'مملكة جدول الضرب - Multiplication Kingdom',
  description: 'تطبيق تعليمي تفاعلي لتعلم جداول الضرب للأطفال',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <StudentProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </StudentProvider>
      </body>
    </html>
  );
}
