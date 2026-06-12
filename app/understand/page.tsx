'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

const examples = [
  { count: 2, groups: 3, label: 'تفاح', emoji: '🍎' },
  { count: 4, groups: 2, label: 'برتقال', emoji: '🍊' },
  { count: 3, groups: 4, label: 'موز', emoji: '🍌' },
  { count: 5, groups: 3, label: 'فراولة', emoji: '🍓' },
  { count: 2, groups: 5, label: 'كرز', emoji: '🍒' },
];

export default function UnderstandPage() {
  const [currentExample, setCurrentExample] = useState(0);
  const example = examples[currentExample];

  const nextExample = () => {
    setCurrentExample((prev) => (prev + 1) % examples.length);
  };

  const prevExample = () => {
    setCurrentExample((prev) => (prev - 1 + examples.length) % examples.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-4">
            فهم جدول الضرب
          </h1>
          <p className="text-lg text-gray-600">
            تعلم مفهوم الضرب بطريقة مرئية وممتعة
          </p>
        </motion.div>

        {/* Explanation Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-sky-100 mb-8"
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">ما هو الضرب؟</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                الضرب هو طريقة سريعة لجمع أعداد متساوية. بدلاً من أن نكتب{' '}
                <span className="font-bold text-sky-600">٣ + ٣ + ٣ + ٣</span>،
                نكتب <span className="font-bold text-sky-600">٣ × ٤</span>!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Visual Example */}
        <motion.div
          key={currentExample}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-sky-100 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevExample}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
            <h3 className="text-xl font-bold text-gray-800">مثال مرئي</h3>
            <button
              onClick={nextExample}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-sky-600 mb-2">
              {example.count} × {example.groups} = {example.count * example.groups}
            </p>
            <p className="text-gray-600">
              {example.groups} مجموعات، كل مجموعة فيها {example.count} {example.label}
            </p>
          </div>

          {/* Visual Grid */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {Array.from({ length: example.groups }).map((_, groupIndex) => (
              <motion.div
                key={groupIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="bg-sky-50 rounded-xl p-3 border-2 border-sky-200"
              >
                <div className="flex gap-2">
                  {Array.from({ length: example.count }).map((_, itemIndex) => (
                    <motion.span
                      key={itemIndex}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 + itemIndex * 0.05 }}
                      className="text-3xl"
                    >
                      {example.emoji}
                    </motion.span>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-1">
                  {example.count} {example.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Addition equivalent */}
          <div className="bg-yellow-50 rounded-2xl p-4 text-center">
            <p className="text-lg text-gray-700">
              نعني{' '}
              <span className="font-bold text-sky-600">
                {Array.from({ length: example.groups })
                  .map(() => example.count)
                  .join(' + ')}
              </span>
              {' '}= {example.count * example.groups}
            </p>
          </div>
        </motion.div>

        {/* Interactive Practice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-pink-100 to-pink-50 rounded-3xl p-6 md:p-8 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            جرّب بنفسك
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/tables">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-6 shadow-md cursor-pointer text-center"
              >
                <p className="text-lg font-bold text-pink-600">🧮 تعلم الجداول</p>
                <p className="text-gray-600 mt-2">تعلم جداول الضرب من 1 إلى 12</p>
              </motion.div>
            </Link>

            <Link href="/exercises">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-6 shadow-md cursor-pointer text-center"
              >
                <p className="text-lg font-bold text-green-600">📝 تدرب</p>
                <p className="text-gray-600 mt-2">تدرب على الجمع المتكرر</p>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
            >
              ← الصفحة الرئيسية
            </motion.button>
          </Link>
          <Link href="/tables">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-colors"
            >
              جداول الضرب →
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
