'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getTableTips } from '@/lib/utils';

export default function TablesPage() {
  const tables = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-sky-700 mb-4">
            جداول الضرب
          </h1>
          <p className="text-lg text-gray-600">
            اختر جدولاً لتعلمه وتدرب عليه
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tables.map((table, index) => {
            const tips = getTableTips(table);
            const gradients = [
              'from-sky-400 to-sky-600',
              'from-emerald-400 to-emerald-600',
              'from-amber-400 to-amber-600',
              'from-pink-400 to-pink-600',
              'from-indigo-400 to-indigo-600',
              'from-red-400 to-red-600',
            ];
            const gradient = gradients[index % gradients.length];

            return (
              <motion.div
                key={table}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/tables/${table}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow text-white h-full flex flex-col`}
                  >
                    <div className="text-center flex-grow">
                      <span className="text-4xl md:text-5xl font-bold">{table}</span>
                      <p className="text-sm opacity-80 mt-2">جدول</p>
                    </div>
                    {tips.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs opacity-90 text-center">
                          {tips[0]}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
