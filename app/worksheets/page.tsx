'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, Image, FileImage, Sparkles, CircleAlert as AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useStudent } from '@/lib/student-context';
import { supabase } from '@/lib/supabase';

type WorksheetMode = 'random' | 'full-table';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

export default function WorksheetsPage() {
  const { student } = useStudent();
  const worksheetRef = useRef<HTMLDivElement>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const [worksheetMode, setWorksheetMode] = useState<WorksheetMode>('full-table');
  const [tables, setTables] = useState<number[]>([6]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
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

  // Generate full table for specific tables (1×N through 12×N)
  const generateFullTableQuestions = (selectedTables: number[]): { a: number; b: number; answer: number }[] => {
    const qs: { a: number; b: number; answer: number }[] = [];

    // For each selected table, generate all 12 facts (1×table through 12×table)
    selectedTables.forEach(tableNum => {
      for (let i = 1; i <= 12; i++) {
        qs.push({
          a: i,
          b: tableNum,
          answer: i * tableNum,
        });
      }
    });

    return qs;
  };

  // Generate random questions
  const generateRandomQuestions = (selectedTables: number[], count: number): { a: number; b: number; answer: number }[] => {
    const qs: { a: number; b: number; answer: number }[] = [];

    for (let i = 0; i < count; i++) {
      const a = selectedTables.length > 0
        ? selectedTables[Math.floor(Math.random() * selectedTables.length)]
        : Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      qs.push({ a, b, answer: a * b });
    }

    return qs;
  };

  const generateWorksheet = () => {
    setExportError(null);
    let qs: { a: number; b: number; answer: number }[] = [];

    if (worksheetMode === 'full-table') {
      // Full table mode: generate all 12 facts for each selected table
      qs = generateFullTableQuestions(tables);
    } else {
      // Random mode: generate specified number of questions
      const questionCount = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 20 : 30;
      qs = generateRandomQuestions(tables, questionCount);
    }

    setQuestions(qs);
    setGenerated(true);
  };

  // Validate before export
  const validateBeforeExport = (): boolean => {
    if (worksheetMode === 'full-table') {
      // Each table should have exactly 12 questions
      const expectedCount = tables.length * 12;
      if (questions.length !== expectedCount) {
        setExportError(`خطأ: يجب أن يحتوي ورقة العمل على ${expectedCount} سؤال (${tables.length} جداول × 12 سؤال). يوجد حالياً ${questions.length} سؤال.`);
        return false;
      }
    }

    if (questions.length === 0) {
      setExportError('خطأ: لا توجد أسئلة في ورقة العمل.');
      return false;
    }

    setExportError(null);
    return true;
  };

  // Export to PDF with multi-page support
  const exportToPdf = async () => {
    if (!validateBeforeExport()) return;
    if (!worksheetRef.current) return;

    try {
      // Capture the entire content including overflow
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        height: worksheetRef.current.scrollHeight, // Important: capture full height
        windowHeight: worksheetRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate scaling to fit width
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / (imgWidth / 2); // divide by 2 because of scale factor
      const scaledHeight = (imgHeight / 2) * ratio;

      // Check if we need multiple pages
      if (scaledHeight <= pdfHeight) {
        // Single page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
      } else {
        // Multiple pages needed
        let yPosition = 0;
        let pageNumber = 1;

        while (yPosition < scaledHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }

          // Calculate the portion of image to show on this page
          const pageHeight = pdfHeight;
          const sourceY = (yPosition / scaledHeight) * imgHeight;

          // Add the image section for this page
          pdf.addImage(imgData, 'PNG', 0, -yPosition * (pdfWidth / (imgWidth / 2)), pdfWidth, scaledHeight);

          yPosition += pageHeight / ratio * (imgWidth / 2);
          pageNumber++;
        }
      }

      pdf.save('worksheet_' + Date.now() + '.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
      setExportError('حدث خطأ أثناء تصدير PDF');
    }
  };

  // Export to image (captures full content)
  const exportToImage = async (format: 'png' | 'jpeg') => {
    if (!validateBeforeExport()) return;
    if (!worksheetRef.current) return;

    try {
      // Capture entire content including overflow
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        height: worksheetRef.current.scrollHeight,
        windowHeight: worksheetRef.current.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = 'worksheet_' + Date.now() + '.' + format;
      link.href = canvas.toDataURL('image/' + format, 0.95);
      link.click();
    } catch (error) {
      console.error('Image export error:', error);
      setExportError('حدث خطأ أثناء تصدير الصورة');
    }
  };

  const handlePrint = () => {
    if (!validateBeforeExport()) return;
    window.print();
  };

  const saveToDb = async () => {
    if (!questions.length) return;

    try {
      await supabase.from('worksheets').insert({
        student_id: student?.id || null,
        title,
        tables: tables.map(String),
        difficulty: worksheetMode === 'full-table' ? 'full-table' : difficulty,
        student_name: studentName || null,
        teacher_name: teacherName || null,
        school_name: schoolName || null,
        content: { questions, mode: worksheetMode },
      });
      alert('تم حفظ ورقة العمل بنجاح!');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const difficultyLabel = worksheetMode === 'full-table'
    ? `جدول كامل (${tables.length * 12} سؤال)`
    : difficulty === 'easy' ? 'سهل (12 سؤال)'
    : difficulty === 'medium' ? 'متوسط (20 سؤال)'
    : 'صعب (30 سؤال)';

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
            اصنع أوراق عمل مخصصة لجميع حقائق الضرب
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Mode Selection */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 mb-4">نوع ورقة العمل:</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setWorksheetMode('full-table')}
                  className={'flex-1 py-3 rounded-xl font-bold transition-colors ' + (
                    worksheetMode === 'full-table'
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  جدول كامل (1-12)
                </button>
                <button
                  onClick={() => setWorksheetMode('random')}
                  className={'flex-1 py-3 rounded-xl font-bold transition-colors ' + (
                    worksheetMode === 'random'
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  أسئلة عشوائية
                </button>
              </div>
            </div>

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
              {worksheetMode === 'full-table' && tables.length > 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  سيتم إنشاء {tables.length * 12} سؤال ({tables.length} جداول × 12 سؤال)
                </p>
              )}
            </div>

            {/* Difficulty (only for random mode) */}
            {worksheetMode === 'random' && (
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
            )}

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
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-6 h-6" />
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
                <h3 className="font-bold text-gray-800">معاينة {generated && `(${questions.length} سؤال)`}:</h3>
                {generated && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={exportToPdf} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button onClick={() => exportToImage('png')} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                      <Image className="w-4 h-4" />
                      PNG
                    </button>
                    <button onClick={() => exportToImage('jpeg')} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                      <FileImage className="w-4 h-4" />
                      JPG
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                      <Printer className="w-4 h-4" />
                      طباعة
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {exportError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-red-700 text-sm">{exportError}</div>
                </div>
              )}

              {/* Worksheet Content Container */}
              <div className="border-4 border-gray-300 rounded-lg overflow-hidden bg-white" style={{ maxHeight: '70vh' }}>
                <div
                  ref={worksheetRef}
                  className="p-4 md:p-6 text-right"
                  dir="rtl"
                  style={{
                    fontFamily: 'Cairo, sans-serif',
                    minHeight: generated ? 'auto' : '400px',
                  }}
                >
                  {!generated ? (
                    <div className="flex items-center justify-center py-20 text-gray-400 text-center">
                      <div>
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>اختر الجداول واضغط "إنشاء ورقة العمل"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="bg-gradient-to-l from-pink-400 via-pink-300 to-yellow-300 rounded-xl p-4 text-center shadow-lg">
                        <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">{title}</h2>
                        {schoolName && <p className="text-white/90 text-sm mt-1">{schoolName}</p>}
                      </div>

                      {/* Student Info */}
                      <div className="grid grid-cols-3 gap-3 bg-sky-50 rounded-xl p-3 border border-sky-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">اسم الطالب</p>
                          <div className="border-b-2 border-dashed border-gray-400 pb-1 text-sm font-medium">
                            {studentName || '........................'}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">التاريخ</p>
                          <div className="border-b-2 border-dashed border-gray-400 pb-1 text-sm">
                            {new Date().toLocaleDateString('ar')}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">اسم المعلم</p>
                          <div className="border-b-2 border-dashed border-gray-400 pb-1 text-sm font-medium">
                            {teacherName || '........................'}
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3">
                        <p className="text-center text-sm text-yellow-800 font-medium">
                          اكتب ناتج الضرب في الفراغ
                        </p>
                        <p className="text-center text-xs text-yellow-600 mt-1">
                          {worksheetMode === 'full-table'
                            ? `جداول: ${tables.sort((a,b) => a-b).join('، ')}`
                            : `الجداول: ${tables.join(' - ')} | المستوى: ${difficultyLabel}`}
                        </p>
                      </div>

                      {/* Questions Grid - Full visibility */}
                      <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-3 border-2 border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {questions.map((q, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-lg px-3 py-2 border-2 border-gray-200"
                            >
                              <div className="flex items-center justify-between gap-1 text-sm md:text-base">
                                <span className="text-xs text-gray-400 font-bold">{idx + 1}.</span>
                                <span>
                                  {q.a} × {q.b} = <span className="inline-block w-10 border-b-2 border-dashed border-gray-500"></span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="grid grid-cols-3 gap-3 bg-gradient-to-l from-green-50 to-emerald-50 rounded-xl p-3 border-2 border-green-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">الدرجة</p>
                          <div className="text-lg font-bold text-green-600">______ / {questions.length}</div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">النسبة</p>
                          <div className="text-lg font-bold text-green-600">______%</div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">توقيع المعلم</p>
                          <div className="border-b-2 border-dashed border-gray-400 pb-1"></div>
                        </div>
                      </div>

                      {/* Decorative */}
                      <div className="flex justify-center gap-2 text-2xl">
                        ⭐ 🎓 ⭐ ⭐ 🎓 ⭐
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {generated && (
                <button
                  onClick={saveToDb}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors"
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
