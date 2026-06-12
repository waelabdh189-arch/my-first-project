'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, RotateCcw } from 'lucide-react';

export default function CommutativePage() {
  const [num1, setNum1] = useState(4);
  const [num2, setNum2] = useState(6);

  const examples = useMemo(() => {
    // Generate some examples showing commutative property
    return [
      { a: 2, b: 5 },
      { a: 3, b: 7 },
      { a: 4, b: 8 },
      { a: 6, b: 9 },
      { a: num1, b: num2 },
    ];
  }, [num1, num2]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-violet-700 mb-4">
            خاصية التبادل
          </h1>
          <p className="text-lg text-gray-600">
            تعلم أن ترتيب الأعداد في الضرب لا يهم
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6 border border-violet-100"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">جرّب بنفسك</h2>

            <div className="flex justify-center gap-4 mb-6">
              <input
                type="number"
                min="1"
                max="12"
                value={num1}
                onChange={(e) => setNum1(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-2xl font-bold text-center py-2 border-2 border-violet-300 rounded-xl focus:border-violet-500 outline-none"
              />
              <span className="text-3xl self-center">×</span>
              <input
                type="number"
                min="1"
                max="12"
                value={num2}
                onChange={(e) => setNum2(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-2xl font-bold text-center py-2 border-2 border-violet-300 rounded-xl focus:border-violet-500 outline-none"
              />
            </div>

            <button
              onClick={() => {
                const temp = num1;
                setNum1(num2);
                setNum2(temp);
              }}
              className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-6 py-2 rounded-xl flex items-center gap-2 mx-auto transition-colors"
            >
              <Shuffle className="w-5 h-5" />
              بدّل الأماكن
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* First expression */}
            <motion.div
              key={`first-${num1}-${num2}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-violet-50 rounded-2xl p-6 text-center border-2 border-violet-200"
            >
              <div className="text-3xl font-bold text-violet-700 mb-4">
                {num1} × {num2}
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: num2 }).map((_, groupIndex) => (
                  <div key={groupIndex} className="bg-white rounded-lg p-2">
                    <div className="flex gap-1">
                      {Array.from({ length: num1 }).map((_, i) => (
                        <span key={i} className="text-lg">🔵</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-4xl font-bold text-green-600">= {num1 * num2}</div>
            </motion.div>

            {/* Second expression */}
            <motion.div
              key={`second-${num2}-${num1}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-pink-50 rounded-2xl p-6 text-center border-2 border-pink-200"
            >
              <div className="text-3xl font-bold text-pink-700 mb-4">
                {num2} × {num1}
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: num1 }).map((_, groupIndex) => (
                  <div key={groupIndex} className="bg-white rounded-lg p-2">
                    <div className="flex gap-1">
                      {Array.from({ length: num2 }).map((_, i) => (
                        <span key={i} className="text-lg">🔴</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-4xl font-bold text-green-600">= {num1 * num2}</div>
            </motion.div>
          </div>

          {/* Equality sign */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-6"
          >
            <div className="inline-block bg-gradient-to-r from-violet-500 to-pink-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold">
              {num1} × {num2} = {num2} × {num1} ✓
            </div>
          </motion.div>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">أمثلة أخرى</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {examples.slice(0, 5).map((ex, index) => (
              <motion.div
                key={`${ex.a}-${ex.b}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <div className="text-lg font-medium text-gray-700">
                  {ex.a} × {ex.b} = {ex.b} × {ex.a}
                </div>
                <div className="text-xl font-bold text-green-600 mt-1">
                  = {ex.a * ex.b}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 rounded-2xl p-6 mt-6 border border-yellow-200"
        >
          <h3 className="font-bold text-yellow-800 mb-2">💡 القاعدة</h3>
          <p className="text-yellow-700 text-lg">
            في الضرب، ترتيب الأعداد لا يهم. نسمي هذا <strong>خاصية التبادل</strong>.
          </p>
          <p className="text-yellow-600 mt-2">
            3 × 4 = 12 و 4 × 3 = 12 🎯
          </p>
        </motion.div>
      </div>
    </div>
  );
}
