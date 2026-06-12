'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, Image, FileImage } from 'lucide-react';
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
    const questionCount = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 18 : 24;
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
              <h3 className="font-bold text-gray-800 mb-4">مستوى الصعوبة:</h3>
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
                    {level === 'easy' ? 'سهل (12)' : level === 'medium' ? 'متوسط (18)' : 'صعب (24)'}
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

              {/* Worksheet Content */}
              <div
                ref={worksheetRef}
                className="border-2 border-gray-300 rounded-xl p-6 min-h-[600px] bg-white"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              >
                {!generated ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>اختر الجداول واضغط "إنشاء ورقة العمل"</p>
                  </div>
                ) : (
                  <div className="min-h-full p-4" style={{ background: 'linear-gradient(transparent 39px, #e5e7eb 39px), linear-gradient(to right, #fee2e2 1px, transparent 1px)', backgroundSize: '100% 40px, 30px 100%' }}>
                    {/* Header */}
                    <div className="text-center mb-6 border-b-2 border-dashed pb-4">
                      <div className="flex justify-around mb-4 text-sm text-gray-600">
                        {studentName && <span>الطالب: {studentName}</span>}
                        <span>التاريخ: {new Date().toLocaleDateString('ar')}</span>
                        {teacherName && <span>المعلم: {teacherName}</span>}
                      </div>
                      <h2 className="text-2xl font-bold text-pink-600">{title}</h2>
                      {schoolName && <p className="text-gray-500 mt-1">{schoolName}</p>}
                      <p className="text-sm text-gray-500 mt-2">
                        الجدول: {tables.join(' , ')} | المستوى: {difficultyLabel}
                      </p>
                    </div>

                    {/* Questions */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 text-center"
                        >
                          <span className="text-lg">
                            {q.a} × {q.b} = <span className="text-gray-300">.....</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t-2 border-dashed text-center">
                      <div className="flex justify-around text-sm text-gray-500">
                        <span>الدرجة: /{questions.length}</span>
                        <span>التوقيع:</span>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="mt-4 flex justify-center gap-4 text-2xl">
                      ⭐ 🎓 ⭐
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
