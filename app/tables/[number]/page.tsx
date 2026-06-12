'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, ChevronLeft, Star, RefreshCw, BookOpen, Award } from 'lucide-react';
import { getTableTips } from '@/lib/utils';
import { useStudent } from '@/lib/student-context';

// Updated tips with proper Arabic
const tableTips: { [key: number]: string[] } = {
  1: ['أي عدد مضروب في 1 يساوي نفسه'],
  2: ['الضرب في 2 يعني مضاعفة العدد'],
  3: ['مجموع أرقام الناتج يقبل القسمة على 3'],
  4: ['الضرب في 4 يساوي الضرب في 2 مرتين'],
  5: ['آحاده يكون 0 أو 5'],  // Fixed: changed from "ينتهي دائماً بـ 0 أو 5"
  6: ['الضرب في 6 يساوي الضرب في 3 ثم في 2'],
  7: ['لا يحفظ - يُجرّب!'],
  8: ['الضرب في 8 يساوي الضرب في 2 ثلاث مرات'],
  9: ['مجموع أرقام الناتج يساوي 9 (مثال: 9×5=45، 4+5=9)'],
  10: ['أضف صفراً إلى يمين العدد'],
  11: ['كرر العدد للأعداد من 1-9 (11×3=33)'],
  12: ['سهل! اضرب في 10 ثم أضف ضعف العدد'],
};

export default function TablePage() {
  const params = useParams();
  const tableNumber = parseInt(params.number as string, 10);
  const { updateProgress, updateStars } = useStudent();

  // Validate table number (1-12)
  const isValidTable = tableNumber >= 1 && tableNumber <= 12;
  const safeTable = isValidTable ? tableNumber : 1;

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Generate all 12 questions for this table (including 12×12)
  const questions = useMemo(() => {
    const qs = [];
    for (let i = 1; i <= 12; i++) {
      qs.push({
        a: safeTable,
        b: i,
        answer: safeTable * i,
      });
    }
    return qs;
  }, [safeTable]);

  // Generate quiz options
  const quizQuestions = useMemo(() => {
    // Create quiz questions with shuffled options
    return questions.map((q) => {
      const options = new Set<number>([q.answer]);
      // Add wrong answers
      while (options.size < 4) {
        const offset = Math.floor(Math.random() * Math.max(q.answer, 20)) - Math.floor(Math.max(q.answer, 20) / 2);
        const wrongAnswer = Math.max(1, q.answer + offset);
        if (wrongAnswer !== q.answer && wrongAnswer > 0 && wrongAnswer <= 144) {
          options.add(wrongAnswer);
        }
      }
      return {
        ...q,
        options: Array.from(options).sort(() => Math.random() - 0.5),
      };
    });
  }, [questions]);

  const currentQuestion = quizQuestions[quizIndex];

  const handleAnswer = (option: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.answer;

    setAnswers((prev) => [...prev, isCorrect]);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (quizIndex < quizQuestions.length - 1) {
        setQuizIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        // Quiz finished
        setShowResults(true);
        updateStars(score + (isCorrect ? 1 : 0));
        updateProgress(safeTable, isCorrect);
      }
    }, 800);
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setScore(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedAnswer(null);
  };

  // Show error page for invalid table numbers
  if (!isValidTable) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">جدول غير صالح</h1>
          <p className="text-gray-600 mt-2">الجدول يجب أن يكون بين 1 و 12</p>
          <Link href="/tables" className="text-sky-600 hover:underline mt-4 block">
            العودة للجداول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Link href="/tables" className="text-sky-600 hover:text-sky-700">
              <ChevronRight className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-sky-700">
              جدول الضرب {safeTable}
            </h1>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showQuiz ? (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Tips Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-yellow-50 rounded-2xl p-4 mb-6 border border-yellow-200"
              >
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-yellow-800 mb-1">نصيحة للحفظ</h3>
                    <p className="text-yellow-700">
                      {tableTips[safeTable]?.join(' - ') || 'تدرب يومياً لتتقن هذا الجدول!'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Table Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-lg border border-sky-100 overflow-hidden mb-8"
              >
                <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-4 text-center">
                  <h2 className="text-xl font-bold">جدول الضرب {safeTable}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                  {questions.map((q, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.03 }}
                      className="bg-sky-50 rounded-xl p-3 text-center border border-sky-100 hover:bg-sky-100 transition-colors"
                    >
                      <span className="text-lg font-medium text-gray-800">
                        {q.a} × {q.b} = <span className="text-sky-600 font-bold">{q.answer}</span>
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quiz Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-colors"
                >
                  🎯 اختبر نفسك
                </button>
              </motion.div>
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">أحسنت!</h2>
              <p className="text-4xl font-bold text-sky-600 mb-4">
                {score} / {questions.length}
              </p>
              <p className="text-gray-600 mb-6">
                {score === questions.length
                  ? 'ممتاز! أتقنت جدول ' + safeTable + '!'
                  : score >= questions.length / 2
                    ? 'جيد! واصل التدرب!'
                    : 'تحسن! تحتاج مزيداً من التدريب'}
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {answers.map((correct, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={restartQuiz}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  إعادة الاختبار
                </button>
                <Link href="/tables">
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors">
                    <ChevronRight className="w-5 h-5" />
                    الجداول
                  </button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl shadow-lg p-6 md:p-8"
            >
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-gray-700">{score}</span>
                </div>
                <span className="text-gray-500">
                  السؤال {quizIndex + 1} من {questions.length}
                </span>
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <motion.p
                  key={quizIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-5xl font-bold text-gray-800"
                >
                  {currentQuestion.a} × {currentQuestion.b} = ؟
                </motion.p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.answer;
                  const showResult = selectedAnswer !== null;

                  let buttonClass = 'bg-sky-100 hover:bg-sky-200 text-sky-700 border-sky-200';
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass = 'bg-green-100 text-green-700 border-green-400';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'bg-red-100 text-red-700 border-red-400';
                    }
                  }

                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 md:p-6 rounded-2xl border-2 text-2xl md:text-3xl font-bold transition-all ${buttonClass} ${
                        selectedAnswer === null ? 'hover:scale-105' : ''
                      } disabled:cursor-default`}
                    >
                      {option}
                      {showResult && isCorrect && (
                        <Check className="w-6 h-6 inline mr-2 text-green-600" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <X className="w-6 h-6 inline mr-2 text-red-600" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
