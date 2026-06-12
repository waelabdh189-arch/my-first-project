'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Calculator } from 'lucide-react';

export default function DivisionPage() {
  const [tableNumber, setTableNumber] = useState(4);

  const factFamilies = useMemo(() => {
    // Generate fact families for the selected table
    return Array.from({ length: 12 }, (_, i) => {
      const multiplier = i + 1;
      const product = tableNumber * multiplier;
      return {
        a: tableNumber,
        b: multiplier,
        product,
        mul1: `${tableNumber} × ${multiplier}`,
        mul2: `${multiplier} × ${tableNumber}`,
        div1: `${product} ÷ ${tableNumber}`,
        div2: `${product} ÷ ${multiplier}`,
      };
    });
  }, [tableNumber]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-rose-700 mb-4">
            الضرب والقسمة
          </h1>
          <p className="text-lg text-gray-600">
            تعلم العلاقة بين الضرب والقسمة
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
            onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
            className="border border-gray-300 rounded-xl px-4 py-2 font-bold text-rose-600"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                جدول {n}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-3">
            <Calculator className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-rose-800 mb-2">ما هي عائلة الحقائق؟</h3>
              <p className="text-rose-700">
                عائلة الحقائق هي مجموعة من المعادلات المرتبطة ببعضها. إذا عرفت ناتج ضرب، يمكنك معرفة ناتج قسمته!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fact Families */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg border border-rose-100 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 text-center">
            <h2 className="text-xl font-bold">عائلات الحقائق لجدول {tableNumber}</h2>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
            {factFamilies.map((family, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200"
              >
                <div className="text-center mb-3">
                  <span className="text-3xl font-bold text-rose-600">{family.product}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded-lg p-2 text-center">
                    <span className="text-rose-600 font-medium">{family.mul1} = {family.product}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <span className="text-pink-600 font-medium">{family.mul2} = {family.product}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <span className="text-green-600 font-medium">{family.div1} = {family.b}</span>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-center">
                    <span className="text-blue-600 font-medium">{family.div2} = {family.a}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">مثال تفاعلي</h3>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <div className="bg-rose-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-rose-700">{tableNumber} × 5 = {tableNumber * 5}</p>
              <p className="text-sm text-rose-600 mt-1">ضرب</p>
            </div>
            <span className="text-3xl">⇄</span>
            <div className="bg-green-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{tableNumber * 5} ÷ {tableNumber} = 5</p>
              <p className="text-sm text-green-600 mt-1">قسمة</p>
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200"
        >
          <h3 className="font-bold text-yellow-800 mb-2">💡 نصيحة</h3>
          <p className="text-yellow-700">
            القسمة هي العملية العكسية للضرب. إذا حفظت جداول الضرب، ستعرف تلقائياً جداول القسمة!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
