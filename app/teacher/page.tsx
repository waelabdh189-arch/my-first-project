'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, FileText, Users, Trash2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Worksheet {
  id: string;
  title: string;
  tables: string[];
  difficulty: string;
  student_name: string;
  teacher_name: string;
  school_name: string;
  content: { questions: { a: number; b: number; answer: number }[] };
  created_at: string;
}

export default function TeacherPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorksheets();
  }, []);

  const loadWorksheets = async () => {
    try {
      const { data, error } = await supabase
        .from('worksheets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWorksheets(data || []);
    } catch (error) {
      console.error('Error loading worksheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorksheet = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الورقة؟')) return;

    try {
      const { error } = await supabase
        .from('worksheets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWorksheets(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting worksheet:', error);
    }
  };

  const exportWorksheet = (worksheet: Worksheet) => {
    // Simple CSV export for worksheet questions
    const questions = worksheet.content?.questions || [];
    let csv = 'تدريب جداول الضرب\n\n';
    csv += worksheet.title + '\n';
    csv += 'الطالب: ' + (worksheet.student_name || '---') + '\n';
    csv += 'المعلم: ' + (worksheet.teacher_name || '---') + '\n';
    csv += 'التاريخ: ' + new Date(worksheet.created_at).toLocaleDateString('ar') + '\n\n';

    questions.forEach((q, idx) => {
      csv += (idx + 1) + '. ' + q.a + ' x ' + q.b + ' = ____\n';
    });

    const blob = new Blob([csv], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = worksheet.title + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-4">
            لوحة المعلم
          </h1>
          <p className="text-lg text-gray-600">
            إدارة أوراق العمل ومتابعة التقدم
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <FileText className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">{worksheets.length}</p>
            <p className="text-sm text-gray-500">أوراق العمل</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">
              {new Set(worksheets.filter(w => w.student_name).map(w => w.student_name)).size || 0}
            </p>
            <p className="text-sm text-gray-500">طلاب</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6 text-center"
          >
            <GraduationCap className="w-8 h-8 text-sky-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-800">
              {new Set(worksheets.filter(w => w.school_name).map(w => w.school_name)).size || 0}
            </p>
            <p className="text-sm text-gray-500">مدارس</p>
          </motion.div>
        </div>

        {/* Worksheets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">أوراق العمل المحفوظة</h2>
            <span className="text-sm opacity-80">آخر 20 ورقة</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : worksheets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>لا توجد أوراق عمل محفوظة</p>
              <p className="text-sm mt-2">اذهب لمولد أوراق العمل لإنشاء ورقة جديدة</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {worksheets.map((ws) => (
                <div
                  key={ws.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-gray-800">{ws.title}</h3>
                    <p className="text-sm text-gray-500">
                      {ws.student_name && 'الطالب: ' + ws.student_name + ' | '}
                      الجدول: {ws.tables.join(', ')} | {ws.difficulty === 'easy' ? 'سهل' : ws.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ws.created_at).toLocaleString('ar')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => exportWorksheet(ws)}
                      className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
                      title="تصدير"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteWorksheet(ws.id)}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <a
            href="/worksheets"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            إنشاء ورقة عمل جديدة
          </a>
        </motion.div>
      </div>
    </div>
  );
}
