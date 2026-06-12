'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Star, Chrome as Home, BookOpen, Gamepad2, FileText, GraduationCap, ChartBar as BarChart3, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const learningItems = [
  { href: '/understand', label: 'فهم الضرب' },
  { href: '/tables', label: 'جداول الضرب' },
  { href: '/practice', label: 'تدريب الكتابة' },
  { href: '/exercises', label: 'الجمع المتكرر' },
  { href: '/commutative', label: 'خاصية التبادل' },
  { href: '/division', label: 'الضرب والقسمة' },
  { href: '/match', label: 'مطابقة النتائج' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const pathname = usePathname();

  const [stars, setStars] = useState(0);

  useEffect(() => {
    const savedStars = localStorage.getItem('studentStars');
    if (savedStars) {
      setStars(parseInt(savedStars, 10));
    }

    const handleStorage = () => {
      const updated = localStorage.getItem('studentStars');
      if (updated) setStars(parseInt(updated, 10));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isActive = (path: string) => pathname === path;
  const isLearningActive = () =>
    ['/understand', '/tables', '/practice', '/exercises', '/commutative', '/division', '/match'].includes(pathname ?? '') ||
    pathname?.startsWith('/tables/');

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">👑</span>
            </div>
            <span className="font-bold text-lg text-sky-700 hidden sm:block">مملكة الضرب</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Learn Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLearn(!showLearn)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isLearningActive()
                    ? 'bg-sky-100 text-sky-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>تعلم</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showLearn ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showLearn && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden"
                  >
                    {learningItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowLearn(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isActive(item.href)
                            ? 'bg-sky-50 text-sky-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/quizzes"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/quizzes')
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>اختبارات</span>
            </Link>

            <Link
              href="/games"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/games')
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>ألعاب</span>
            </Link>

            <Link
              href="/worksheets"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/worksheets')
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>أوراق عمل</span>
            </Link>

            <Link
              href="/teacher"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/teacher')
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>لوحة المعلم</span>
            </Link>

            <Link
              href="/progress"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/progress')
                  ? 'bg-sky-100 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>تقدمي</span>
            </Link>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <span className="font-bold text-yellow-700">{stars}</span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4"
            >
              {learningItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-sky-50 text-sky-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/quizzes"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm transition-colors ${
                  isActive('/quizzes') ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                الاختبارات
              </Link>
              <Link
                href="/games"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm transition-colors ${
                  isActive('/games') ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                الألعاب
              </Link>
              <Link
                href="/worksheets"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm transition-colors ${
                  isActive('/worksheets') ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                أوراق عمل
              </Link>
              <Link
                href="/teacher"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm transition-colors ${
                  isActive('/teacher') ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                لوحة المعلم
              </Link>
              <Link
                href="/progress"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm transition-colors ${
                  isActive('/progress') ? 'bg-sky-50 text-sky-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                تقدمي
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
