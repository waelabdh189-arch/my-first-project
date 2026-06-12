'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw, Eraser } from 'lucide-react';
import { useStudent } from '@/lib/student-context';

export default function PracticePage() {
  const { updateProgress, updateStars } = useStudent();
  const [tableNumber, setTableNumber] = useState(2);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const questions = Array.from({ length: 12 }, (_, i) => ({
    a: tableNumber,
    b: i + 1,
    answer: tableNumber * (i + 1),
  }));

  const handleCheck = () => {
    let correct = 0;
    questions.forEach((q) => {
      const key = `${q.a}x${q.b}`;
      const userAnswer = parseInt(userAnswers[key] || '0', 10);
      if (userAnswer === q.answer) {
        correct++;
      }
    });
    setScore(correct);
    setChecked(true);
    updateStars(correct);
    updateProgress(tableNumber, correct >= 10);
  };

  const handleReset = () => {
    setUserAnswers({});
    setChecked(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
            تدريب الكتابة
          </h1>
          <p className="text-lg text-gray-600">
            اكتب نتائج جدول الضرب المختار
          </p>
        </motion.div>

        {/* Table Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-md mb-6 text-center"
        >
          <label className="text-gray-700 font-medium ml-3">اختر الجدول:</label>
          <select
            value={tableNumber}
            onChange={(e) => {
              setTableNumber(parseInt(e.target.value, 10));
              handleReset();
            }}
            className="border border-gray-300 rounded-xl px-4 py-2 font-bold text-sky-600"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                جدول {n}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Practice Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg border-2 border-green-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 text-center">
            <h2 className="text-xl font-bold">جدول الضرب {tableNumber}</h2>
            <p className="text-sm opacity-90">اكتب الإجابة الصحيحة في الفراغ</p>
          </div>

          {/* Notebook-style practice area */}
          <div className="p-6 notebook-paper min-h-[400px]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {questions.map((q, index) => {
                const key = `${q.a}x${q.b}`;
                const userAnswer = userAnswers[key];
                const isCorrect = parseInt(userAnswer || '0', 10) === q.answer;
                const showResult = checked && userAnswer;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-2 bg-white/80 rounded-xl p-3 border border-gray-200"
                  >
                    <span className="text-lg font-medium text-gray-800">
                      {q.a} × {q.b} =
                    </span>
                    <input
                      type="number"
                      value={userAnswer || ''}
                      onChange={(e) =>
                        setUserAnswers((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      disabled={checked}
                      className={`w-16 text-xl font-bold text-center py-1 rounded-lg border transition-colors ${
                        checked
                          ? isCorrect
                            ? 'bg-green-100 border-green-400 text-green-700'
                            : showResult
                            ? 'bg-red-100 border-red-400 text-red-700'
                            : 'bg-gray-100 border-gray-300'
                          : 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500'
                      } outline-none`}
                    />
                    {showResult && (
                      <span className="text-xl">
                        {isCorrect ? '✓' : `✗ (${q.answer})`}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Score */}
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 p-4 text-center border-t border-green-200"
            >
              <p className="text-2xl font-bold text-green-700">
                النتيجة: {score} / {questions.length}
              </p>
              <p className="text-green-600 mt-1">
                {score === questions.length
                  ? 'ممتاز! أتقنت الجدول!'
                  : score >= questions.length / 2
                  ? 'جيد! واصل التدرب!'
                  : 'استمر في المحاولة!'}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 mt-6"
        >
          {!checked ? (
            <button
              onClick={handleCheck}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-colors"
            >
              <Check className="w-5 h-5" />
              تحقق من الإجابات
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              تدرب مرة أخرى
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Eraser className="w-5 h-5" />
            مسح
          </button>
        </motion.div>
      </div>
    </div>
  );
}
