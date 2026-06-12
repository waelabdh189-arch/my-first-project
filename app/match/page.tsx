'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Trophy, Star } from 'lucide-react';
import { findEqualProducts, shuffleArray } from '@/lib/utils';
import { useStudent } from '@/lib/student-context';

// Numbers with multiple factor pairs (great for equal products)
const targetProducts = [
  { result: 12, minPairs: 2 },
  { result: 18, minPairs: 2 },
  { result: 24, minPairs: 3 },
  { result: 36, minPairs: 3 },
  { result: 48, minPairs: 4 },
  { result: 60, minPairs: 4 },
  { result: 72, minPairs: 4 },
  { result: 96, minPairs: 4 },
];

interface Question {
  target: number;
  equations: { a: number; b: number; equation: string; isCorrect: boolean }[];
}

function generateQuestion(): Question {
  // Pick a target product
  const target = targetProducts[Math.floor(Math.random() * targetProducts.length)];
  const correctPairs = findEqualProducts(target.result);

  // Generate all possible options (correct + incorrect)
  const options: { a: number; b: number; equation: string; isCorrect: boolean }[] = [];

  // Add correct pairs
  correctPairs.forEach(({ a, b }) => {
    options.push({
      a,
      b,
      equation: `${a} × ${b}`,
      isCorrect: true,
    });
  });

  // Add some incorrect pairs
  const incorrectCount = Math.min(2, 6 - options.length);
  let attempts = 0;
  while (options.length < correctPairs.length + incorrectCount && attempts < 50) {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    if (a * b !== target.result) {
      const exists = options.some(o => o.a === a && o.b === b);
      if (!exists) {
        options.push({
          a,
          b,
          equation: `${a} × ${b}`,
          isCorrect: false,
        });
      }
    }
    attempts++;
  }

  return {
    target: target.result,
    equations: shuffleArray(options),
  };
}

export default function MatchPage() {
  const { updateStars } = useStudent();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize questions
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const newQuestions = Array.from({ length: 5 }, () => generateQuestion());
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelections(new Set());
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
  };

  const currentQuestion = questions[currentIndex];

  const handleToggle = (equation: string) => {
    if (showResult) return;

    setSelections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(equation)) {
        newSet.delete(equation);
      } else {
        newSet.add(equation);
      }
      return newSet;
    });
  };

  const handleCheck = () => {
    setShowResult(true);

    // Count correct selections
    let correct = 0;
    const correctEquations = currentQuestion.equations
      .filter(eq => eq.isCorrect)
      .map(eq => eq.equation);

    selections.forEach(sel => {
      if (correctEquations.includes(sel)) {
        correct++;
      }
    });

    // Penalty for selecting incorrect equations
    selections.forEach(sel => {
      const eq = currentQuestion.equations.find(e => e.equation === sel);
      if (eq && !eq.isCorrect) {
        correct -= 1;
      }
    });

    // Bonus for finding all correct
    const allCorrectSelected = correctEquations.every(eq => selections.has(eq));
    if (allCorrectSelected) {
      correct += 1;
    }

    setScore(prev => prev + Math.max(0, correct));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelections(new Set());
      setShowResult(false);
    } else {
      setGameComplete(true);
      updateStars(score);
    }
  };

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-teal-700 mb-4">
            مطابقة النتائج المتساوية
          </h1>
          <p className="text-lg text-gray-600">
            اختر جميع المعادلات التي ناتجها يساوي الرقم المطلوب
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-lg p-8 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">أحسنت!</h2>
              <div className="flex justify-center items-center gap-2 mb-6">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-400" />
                <span className="text-4xl font-bold text-teal-600">{score}</span>
              </div>
              <p className="text-gray-600 mb-6">لقد أكملت جميع التمارين!</p>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 mx-auto bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                العب مرة أخرى
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-teal-100"
            >
              {/* Progress */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500">
                  السؤال {currentIndex + 1} من {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-teal-600">{score}</span>
                </div>
              </div>

              {/* Target */}
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 mb-2">اختر جميع المعادلات التي ناتجها:</p>
                <div className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-4xl font-bold shadow-lg">
                  {currentQuestion.target}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentQuestion.equations.map((eq, idx) => {
                  const isSelected = selections.has(eq.equation);
                  const isCorrect = eq.isCorrect;

                  let bgColor = 'bg-gray-100 hover:bg-gray-200';
                  let borderColor = 'border-gray-200';
                  let textColor = 'text-gray-700';

                  if (showResult) {
                    if (isCorrect) {
                      bgColor = 'bg-green-100';
                      borderColor = 'border-green-400';
                      textColor = 'text-green-700';
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'bg-red-100';
                      borderColor = 'border-red-400';
                      textColor = 'text-red-700';
                    }
                  } else if (isSelected) {
                    bgColor = 'bg-teal-100';
                    borderColor = 'border-teal-400';
                    textColor = 'text-teal-700';
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: showResult ? 1 : 1.02 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                      onClick={() => handleToggle(eq.equation)}
                      disabled={showResult}
                      className={`p-4 md:p-6 rounded-2xl border-2 transition-all ${bgColor} ${borderColor} ${textColor} ${
                        showResult ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="text-2xl md:text-3xl font-bold">
                        {eq.equation}
                      </div>
                      {showResult && isCorrect && (
                        <div className="mt-2 text-sm flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>= {currentQuestion.target}</span>
                        </div>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <div className="mt-2 text-sm flex items-center justify-center gap-1">
                          <X className="w-4 h-4" />
                          <span>= {eq.a * eq.b}</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {!showResult ? (
                  <button
                    onClick={handleCheck}
                    disabled={selections.size === 0}
                    className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors disabled:cursor-not-allowed"
                  >
                    تحقق
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors"
                  >
                    {currentIndex < questions.length - 1 ? 'التالي' : 'النتيجة'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-teal-50 rounded-2xl p-6 mt-6 border border-teal-200"
        >
          <h3 className="font-bold text-teal-800 mb-2">💡 نصيحة</h3>
          <p className="text-teal-700">
            قد يكون للعدد نفسه عدة أزواج من العوامل. مثلاً: 24 = 2×12 = 3×8 = 4×6
          </p>
        </motion.div>
      </div>
    </div>
  );
}
