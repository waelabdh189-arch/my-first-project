'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, BookOpen, Gamepad2, Star, Crown, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStudent } from '@/lib/student-context';
import { avatarOptions } from '@/lib/utils';

export default function HomePage() {
  const { student, setStudent } = useStudent();
  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) {
      setShowSetup(true);
    }
  }, [student]);

  const handleCreateStudent = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          name: name.trim(),
          avatar: selectedAvatar,
          stars: 0,
          streak: 0,
          total_questions: 0,
          correct_answers: 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        localStorage.setItem('studentId', data.id);
        localStorage.setItem('studentStars', '0');
        setStudent(data);
        setShowSetup(false);
      }
    } catch (error) {
      console.error('Error creating student:', error);
    } finally {
      setLoading(false);
    }
  };

  const tableNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-white py-12 md:py-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 right-10 text-6xl opacity-20"
          >
            ⭐
          </motion.div>
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-40 left-20 text-5xl opacity-20"
          >
            🌟
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute bottom-20 right-1/4 text-4xl opacity-10"
          >
            ✨
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-xl"
              >
                <Crown className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-sky-700 mb-4">
              مملكة جدول الضرب
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              تعلم جداول الضرب بطريقة ممتعة وتفاعلية! ابدأ رحلتك الآن واجمع النجوم والإنجازات
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/understand">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-colors"
                >
                  <Play className="w-6 h-6" />
                  ابدأ الرحلة
                </motion.button>
              </Link>

              <Link href="/games">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-colors"
                >
                  <Gamepad2 className="w-6 h-6" />
                  العب الآن
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Kingdom Map */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              خريطة المملكة
            </h2>
            <p className="text-gray-600">اختر جدولاً لتبدأ التعلم</p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {tableNumbers.map((num, index) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/tables/${num}`}>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  >
                    <span className="text-3xl md:text-4xl font-bold">{num}</span>
                    <span className="text-xs md:text-sm opacity-80">جدول</span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-b from-white to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/understand">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow h-full border border-sky-100">
                  <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="w-7 h-7 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">تعلم</h3>
                  <p className="text-gray-600">تعلم جداول الضرب بطريقة مرئية وتفاعلية</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/games">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow h-full border border-pink-100">
                  <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                    <Gamepad2 className="w-7 h-7 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">العب</h3>
                  <p className="text-gray-600">ألعاب تعليمية ممتعة لتثبيت المعلومات</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/progress">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow h-full border border-yellow-100">
                  <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                    <Star className="w-7 h-7 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">تقدم</h3>
                  <p className="text-gray-600">تتبع تقدمك واجمع النجوم والإنجازات</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Student Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">مرحباً بك!</h2>
              <p className="text-gray-600 mt-2">اختر اسمك والأفاتار المفضل</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسمك</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اكتب اسمك هنا..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اختر الأفاتار</label>
                <div className="grid grid-cols-4 gap-3">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(index)}
                      className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all ${
                        selectedAvatar === index
                          ? 'bg-sky-100 ring-2 ring-sky-500 scale-110'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateStudent}
                disabled={!name.trim() || loading}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإنشاء...' : 'ابدأ المغامرة!'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
