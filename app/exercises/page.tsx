'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, RefreshCw } from 'lucide-react';

export default function ExercisesPage() {
  const [tableNumber, setTableNumber] = useState(2);
  const [multiplier, setMultiplier] = useState(3);

  const exercises = useMemo(() => {
    // Generate repeated addition exercises
    return Array.from({ length: multiplier }, (_, i) => ({
      value: tableNumber,
      index: i + 1,
    }));
  }, [tableNumber, multiplier]);

  const total = tableNumber * multiplier;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-amber-700 mb-4">
            الجمع المتكرر
          </h1>
          <p className="text-lg text-gray-600">
            فهم الضرب كجمع متكرر
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-md mb-6 flex flex-wrap justify-center gap-6"
        >
          <div className="text-center">
            <label className="block text-sm text-gray-600 mb-1">العدد الأساسي</label>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
              className="text-xl font-bold text-amber-600 border border-gray-300 rounded-xl px-4 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <label className="block text-sm text-gray-600 mb-1">عدد المرات</label>
            <select
              value={multiplier}
              onChange={(e) => setMultiplier(parseInt(e.target.value, 10))}
              className="text-xl font-bold text-amber-600 border border-gray-300 rounded-xl px-4 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setTableNumber(Math.floor(Math.random() * 12) + 1);
                setMultiplier(Math.floor(Math.random() * 12) + 1);
              }}
              className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              عشوائي
            </button>
          </div>
        </motion.div>

        {/* Visual Representation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg border border-amber-100 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 text-center">
            <h2 className="text-xl font-bold">التمثيل المرئي</h2>
          </div>

          <div className="p-6">
            {/* Objects grid */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {exercises.map((item, groupIndex) => (
                <motion.div
                  key={groupIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200"
                >
                  <div className="text-center mb-2 text-sm text-amber-600 font-medium">
                    المجموعة {item.index}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
                    {Array.from({ length: item.value }).map((_, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.1 + idx * 0.02 }}
                        className="text-2xl"
                      >
                        🍎
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Equation */}
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-6 text-center">
              <div className="mb-4">
                <p className="text-lg text-gray-700 mb-2">المعادلة:</p>
                <p className="text-2xl font-bold text-amber-800">
                  {exercises.map((e, i) => (
                    <span key={i}>
                      {e.value}
                      {i < exercises.length - 1 ? ' + ' : ''}
                    </span>
                  ))}
                </p>
              </div>

              <div className="border-t border-amber-300 pt-4">
                <p className="text-xl text-gray-700">وهذا يعادل:</p>
                <p className="text-3xl font-bold text-amber-700 mt-2">
                  {tableNumber} × {multiplier} = <span className="text-green-600">{total}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 rounded-2xl p-6 border border-green-200"
        >
          <h3 className="font-bold text-green-800 mb-2">💡 هل تعلم؟</h3>
          <p className="text-green-700">
            الضرب هو طريقة سريعة لكتابة جمع متكرر. بدلاً من كتابة{' '}
            <span className="font-bold">{Array.from({ length: multiplier }, () => tableNumber).join(' + ')}</span>
            {' '}نكتب <span className="font-bold text-green-600">{tableNumber} × {multiplier}</span>
          </p>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4 mt-8"
        >
          <Link href="/understand">
            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors">
              <ChevronRight className="w-5 h-5" />
              فهم الضرب
            </button>
          </Link>
          <Link href="/practice">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              تدريب الكتابة
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
