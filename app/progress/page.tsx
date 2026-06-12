'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Clock, Target, TrendingUp, Award } from 'lucide-react';
import { useStudent } from '@/lib/student-context';
import { supabase } from '@/lib/supabase';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export default function ProgressPage() {
  const { student, tableProgress, loading, refreshProgress } = useStudent();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    loadAchievements();
    refreshProgress();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*');

      let earnedIds: string[] = [];
      if (student) {
        const { data: studentAchievements } = await supabase
          .from('student_achievements')
          .select('achievement_id')
          .eq('student_id', student.id);

        earnedIds = studentAchievements?.map(s => s.achievement_id) || [];
      }

      setAchievements(
        (allAchievements || []).map(a => ({
          ...a,
          earned: earnedIds.includes(a.id),
        }))
      );
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">ابدأ رحلتك!</h2>
          <p className="text-gray-600 mb-4">عد للصفحة الرئيسية لإنشاء ملفك الشخصي</p>
          <a href="/" className="text-purple-600 hover:underline">← العودة للرئيسية</a>
        </div>
      </div>
    );
  }

  const totalMastery = tableProgress.length > 0
    ? Math.round(tableProgress.reduce((sum, p) => sum + p.mastery, 0) / tableProgress.length)
    : 0;

  const masteredTables = tableProgress.filter(p => p.mastery >= 80).length;
  const accuracy = student.total_questions > 0
    ? Math.round((student.correct_answers / student.total_questions) * 100)
    : 0;

  const weakTables = tableProgress
    .filter(p => p.mastery < 50 && p.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-3xl">
              {['🦁', '🐼', '🦊', '🐰', '🐻', '🦄', '🐨', '🐯'][student.avatar % 8]}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-purple-700">
              تقدم {student.name}
            </h1>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-yellow-400" />
            <p className="text-3xl font-bold text-gray-800">{student.stars}</p>
            <p className="text-sm text-gray-500">نجمة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{accuracy}%</p>
            <p className="text-sm text-gray-500">دقة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{masteredTables}/12</p>
            <p className="text-sm text-gray-500">جداول متقنة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{student.streak}</p>
            <p className="text-sm text-gray-500">أيام متتالية</p>
          </motion.div>
        </div>

        {/* Table Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            إتقان الجداول
          </h2>

          <div className="space-y-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
              const progress = tableProgress.find(p => p.table_number === num);
              const mastery = progress?.mastery || 0;
              const color = mastery >= 80 ? 'bg-green-500' : mastery >= 50 ? 'bg-yellow-500' : mastery > 0 ? 'bg-orange-500' : 'bg-gray-200';

              return (
                <div key={num} className="flex items-center gap-3">
                  <span className="w-8 text-center font-bold text-gray-700">{num}</span>
                  <div className="flex-grow h-6 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery}%` }}
                      transition={{ delay: 0.3 + num * 0.05 }}
                      className={`h-full ${color} rounded-full`}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-medium text-gray-600">
                    {mastery}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recommendations */}
        {weakTables.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-amber-50 rounded-2xl p-6 mb-6 border border-amber-200"
          >
            <h3 className="font-bold text-amber-800 mb-3">💡 توصيات</h3>
            <p className="text-amber-700 mb-3">تحتاج لمزيد من التدريب على:</p>
            <div className="flex gap-2 flex-wrap">
              {weakTables.map(p => (
                <a
                  key={p.table_number}
                  href={`/tables/${p.table_number}`}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-xl font-bold transition-colors"
                >
                  جدول {p.table_number}
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            الإنجازات ({achievements.filter(a => a.earned).length}/{achievements.length})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl text-center transition-colors ${
                  achievement.earned
                    ? 'bg-yellow-50 border-2 border-yellow-300'
                    : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                }`}
              >
                <span className="text-3xl mb-2 block">{achievement.earned ? achievement.icon : '🔒'}</span>
                <p className="font-bold text-sm text-gray-800">{achievement.name}</p>
                <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl">
            <p className="text-lg font-bold">
              {totalMastery >= 80
                ? '🏆 ممتاز! أنت بطل جداول الضرب!'
                : totalMastery >= 60
                ? '⭐ أحسنت! واصل التقدم!'
                : totalMastery >= 40
                ? '💪 جيد! استمر في التدريب!'
                : '🎯 استمر! كل تدريب يقربك من الهدف!'}
            </p>
            <p className="text-sm opacity-80 mt-1">
              متوسط الإتقان: {totalMastery}%
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
