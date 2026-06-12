'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, Image, FileImage, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useStudent } from '@/lib/student-context';
import { supabase } from '@/lib/supabase';

export default function WorksheetsPage() {
  const { student } = useStudent();
  const worksheetRef = useRef<HTMLDivElement>(null);

  const [tables, setTables] = useState<number[]>([2, 3, 4]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [title, setTitle] = useState('تدريب على جداول الضرب');
  const [questions, setQuestions] = useState<{ a: number; b: number; answer: number }[]>([]);
  const [generated, setGenerated] = useState(false);

  const toggleTable = (table: number) => {
    setTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  };

  const generateWorksheet = () => {
    const questionCount = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 20 : 30;
    const qs: { a: number; b: number; answer: number }[] = [];

    for (let i = 0; i < questionCount; i++) {
      const a = tables.length > 0 ? tables[Math.floor(Math.random() * tables.length)] : Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      qs.push({ a, b, answer: a * b });
    }

    setQuestions(qs);
    setGenerated(true);
  };

  const exportToPdf = async () => {
    if (!worksheetRef.current) return;

    try {
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('worksheet_' + Date.now() + '.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const exportToImage = async (format: 'png' | 'jpeg') => {
    if (!worksheetRef.current) return;

    try {
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = 'worksheet_' + Date.now() + '.' + format;
      link.href = canvas.toDataURL('image/' + format);
      link.click();
    } catch (error) {
      console.error('Image export error:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const saveToDb = async () => {
    if (!questions.length) return;

    try {
      await supabase.from('worksheets').insert({
        student_id: student?.id || null,
        title,
        tables: tables.map(String),
        difficulty,
        student_name: studentName || null,
        teacher_name: teacherName || null,
        school_name: schoolName || null,
        content: { questions },
      });
      alert('تم حفظ ورقة العمل بنجاح!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const difficultyLabel = difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-pink-700 mb-4">
            مولد أوراق العمل
          </h1>
          <p className="text-lg text-gray-600">
            اصنع أوراق عمل مخصصة واطبعها أو صدّرها بتنسيقات متعددة
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Table Selection */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">اختر الجداول:</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((table) => (
                  <button
                    key={table}
                    onClick={() => toggleTable(table)}
                    className={'py-2 px-3 rounded-xl font-bold transition-colors ' + (
                      tables.includes(table)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {table}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">عدد الأسئلة:</h3>
              <div className="flex gap-4">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={'flex-1 py-3 rounded-xl font-bold transition-colors ' + (
                      difficulty === level
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {level === 'easy' ? '12 سؤال' : level === 'medium' ? '20 سؤال' : '30 سؤال'}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Fields */}
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">عنوان الورقة:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-pink-300 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">اسم الطالب:</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-pink-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">اسم المعلم:</label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-pink-300 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">اسم المدرسة:</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-pink-300 outline-none"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateWorksheet}
              disabled={tables.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:cursor-not-allowed transition-all"
            >
              <FileText className="w-6 h-6 inline ml-2" />
              إنشاء ورقة العمل
            </button>
          </motion.div>

          {/* Worksheet Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">معاينة:</h3>
                {generated && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={exportToPdf} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button onClick={() => exportToImage('png')} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">
                      <Image className="w-4 h-4" />
                      PNG
                    </button>
                    <button onClick={() => exportToImage('jpeg')} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm">
                      <FileImage className="w-4 h-4" />
                      JPG
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm">
                      <Printer className="w-4 h-4" />
                      طباعة
                    </button>
                  </div>
                )}
              </div>

              {/* A4 Worksheet Preview */}
              <div
                ref={worksheetRef}
                className="border-4 border-gray-300 rounded-lg overflow-hidden bg-white"
                style={{
                  fontFamily: 'Cairo, sans-serif',
                  width: '100%',
                  aspectRatio: '210/297',
                  maxHeight: '70vh',
                }}
              >
                {!generated ? (
                  <div className="flex items-center justify-center h-full text-gray-400 p-8 text-center">
                    <div>
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>اختر الجداول واضغط "إنشاء ورقة العمل"</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col p-4 md:p-6 text-right" dir="rtl">
                    {/* Colorful Header */}
                    <div className="bg-gradient-to-l from-pink-400 via-pink-300 to-yellow-300 rounded-xl p-3 md:p-4 mb-3 text-center shadow-lg">
                      <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-md">{title}</h2>
                      {schoolName && <p className="text-white/90 text-xs md:text-sm mt-1">{schoolName}</p>}
                    </div>

                    {/* Student Info Row */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 bg-sky-50 rounded-xl p-2 md:p-3 border border-sky-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">اسم الطالب</p>
                        <div className="border-b-2 border-dashed border-gray-400 pb-1 text-xs md:text-sm font-medium">
                          {studentName || '........................'}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">التاريخ</p>
                        <div className="border-b-2 border-dashed border-gray-400 pb-1 text-xs md:text-sm">
                          {new Date().toLocaleDateString('ar')}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">اسم المعلم</p>
                        <div className="border-b-2 border-dashed border-gray-400 pb-1 text-xs md:text-sm font-medium">
                          {teacherName || '........................'}
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-2 md:p-3 mb-3">
                      <p className="text-center text-xs md:text-sm text-yellow-800 font-medium">
                        اكتب ناتج الضرب في الفراغ
                      </p>
                      <p className="text-center text-xs text-yellow-600 mt-1">
                        الجداول: {tables.join(' - ')} | المستوى: {difficultyLabel}
                      </p>
                    </div>

                    {/* Questions Grid */}
                    <div className="flex-grow bg-gradient-to-b from-white to-gray-50 rounded-xl p-2 md:p-4 border-2 border-gray-200 overflow-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        {questions.map((q, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg px-2 md:px-3 py-2 border-2 border-gray-200"
                          >
                            <div className="flex items-center justify-between gap-1 text-sm md:text-base">
                              <span className="text-xs text-gray-400 font-bold">{idx + 1}.</span>
                              <span>
                                {q.a} × {q.b} = <span className="inline-block w-8 md:w-12 border-b-2 border-dashed border-gray-500"></span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 grid grid-cols-3 gap-2 md:gap-4 bg-gradient-to-l from-green-50 to-emerald-50 rounded-xl p-2 md:p-3 border-2 border-green-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">الدرجة</p>
                        <div className="text-sm md:text-lg font-bold text-green-600">______ / {questions.length}</div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">النسبة</p>
                        <div className="text-sm md:text-lg font-bold text-green-600">______%</div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">توقيع المعلم</p>
                        <div className="border-b-2 border-dashed border-gray-400 pb-1"></div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="flex justify-center gap-1 md:gap-2 mt-2 text-xl md:text-2xl">
                      ⭐ 🎓 ⭐ ⭐ 🎓 ⭐
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              {generated && (
                <button
                  onClick={saveToDb}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold"
                >
                  💾 حفظ الورقة
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
