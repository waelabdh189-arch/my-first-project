'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Trophy, Star, RefreshCw, ArrowRight } from 'lucide-react';
import { shuffleArray } from '@/lib/utils';
import { useStudent } from '@/lib/student-context';

type QuizMode = 'select' | 'multiple' | 'truefalse' | 'fillblank' | 'timed';

interface QuizQuestion {
  a: number;
  b: number;
  answer: number;
  options?: number[];
  displayAnswer?: number;
  isTrue?: boolean;
}

export default function QuizzesPage() {
  const { updateProgress, updateStars } = useStudent();
  const [mode, setMode] = useState<QuizMode>('select');
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userInput, setUserInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  // Generate questions based on mode
  const generateQuestions = useCallback((quizMode: QuizMode, count: number = 10) => {
    const qs: QuizQuestion[] = [];
    const tables = selectedTables.length > 0 ? selectedTables : [2];

    for (let i = 0; i < count; i++) {
      const a = tables[Math.floor(Math.random() * tables.length)];
      const b = Math.floor(Math.random() * 12) + 1;
      const answer = a * b;

      if (quizMode === 'multiple') {
        const options = new Set<number>([answer]);
        while (options.size < 4) {
          const offset = Math.floor(Math.random() * 20) - 10;
          const wrong = Math.max(1, answer + offset);
          if (wrong !== answer && wrong > 0) {
            options.add(wrong);
          }
        }
        qs.push({ a, b, answer, options: shuffleArray(Array.from(options)) });
      } else if (quizMode === 'truefalse') {
        const isTrue = Math.random() > 0.35;
        const displayAnswer = isTrue
          ? answer
          : answer + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : -Math.floor(Math.random() * 5) - 1);
        qs.push({
          a,
          b,
          answer,
          displayAnswer: displayAnswer > 0 ? displayAnswer : answer + 3,
          isTrue: displayAnswer === answer,
        });
      } else if (quizMode === 'fillblank') {
        qs.push({ a, b, answer });
      } else if (quizMode === 'timed') {
        const options = new Set<number>([answer]);
        while (options.size < 4) {
          const offset = Math.floor(Math.random() * 20) - 10;
          const wrong = Math.max(1, answer + offset);
          if (wrong !== answer && wrong > 0) {
            options.add(wrong);
          }
        }
        qs.push({ a, b, answer, options: shuffleArray(Array.from(options)) });
      }
    }

    return qs;
  }, [selectedTables]);

  // Timer for timed quiz
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowResults(true);
            updateStars(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, score, updateStars]);

  const startQuiz = (quizMode: QuizMode) => {
    const count = quizMode === 'timed' ? 15 : 10;
    const qs = generateQuestions(quizMode, count);
    setQuestions(qs);
    setMode(quizMode);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setUserInput('');
    setShowResults(false);
    if (quizMode === 'timed') {
      setTimeLeft(60);
      setIsRunning(true);
    }
  };

  const handleAnswer = (value: number | string | boolean) => {
    if (selectedOption !== null || userInput !== '' || showResults) return;

    const currentQuestion = questions[currentIndex];
    let isCorrect = false;

    if (mode === 'multiple' || mode === 'timed') {
      setSelectedOption(value as number);
      isCorrect = value === currentQuestion.answer;
    } else if (mode === 'truefalse') {
      isCorrect = value === currentQuestion.isTrue;
    } else if (mode === 'fillblank') {
      setUserInput(value as string);
      isCorrect = parseInt(value as string, 10) === currentQuestion.answer;
    }

    setAnswers((prev) => [...prev, isCorrect]);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1 && mode !== 'timed') {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setUserInput('');
      } else if (mode !== 'timed') {
        setShowResults(true);
        updateStars(score + (isCorrect ? 1 : 0));
        if (selectedTables.length > 0) {
          updateProgress(selectedTables[0], isCorrect);
        }
      }
    }, 500);
  };

  const resetQuiz = () => {
    setMode('select');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setUserInput('');
    setShowResults(false);
    setIsRunning(false);
    setTimeLeft(60);
  };

  const toggleTable = (table: number) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-4">
              الاختبارات
            </h1>
            <p className="text-lg text-gray-600">
              اختر نوع الاختبار واختبار الجداول التي تريد التدرب عليها
            </p>
          </motion.div>

          {/* Table Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 mb-6"
          >
            <h3 className="font-bold text-gray-800 mb-4">اختر الجداول:</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((table) => (
                <button
                  key={table}
                  onClick={() => toggleTable(table)}
                  className={`py-2 px-3 rounded-xl font-bold transition-colors ${
                    selectedTables.includes(table)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Quiz Types */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => startQuiz('multiple')}
              disabled={selectedTables.length === 0}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white p-6 rounded-2xl text-right shadow-lg disabled:cursor-not-allowed"
            >
              <h3 className="text-xl font-bold mb-2">اختيار من متعدد</h3>
              <p className="text-sm opacity-90">اختر الإجابة الصحيحة من 4 خيارات</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => startQuiz('truefalse')}
              disabled={selectedTables.length === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white p-6 rounded-2xl text-right shadow-lg disabled:cursor-not-allowed"
            >
              <h3 className="text-xl font-bold mb-2">صواب أم خطأ</h3>
              <p className="text-sm opacity-90">حدد إذا كانت المعادلة صحيحة أو خاطئة</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => startQuiz('fillblank')}
              disabled={selectedTables.length === 0}
              className="bg-gradient-to-r from-amber-500 to-amber-600 disabled:from-gray-300 disabled:to-gray-400 text-white p-6 rounded-2xl text-right shadow-lg disabled:cursor-not-allowed"
            >
              <h3 className="text-xl font-bold mb-2">أكمل الفراغ</h3>
              <p className="text-sm opacity-90">اكتب الإجابة الصحيحة</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => startQuiz('timed')}
              disabled={selectedTables.length === 0}
              className="bg-gradient-to-r from-rose-500 to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white p-6 rounded-2xl text-right shadow-lg disabled:cursor-not-allowed"
            >
              <h3 className="text-xl font-bold mb-2">تحدي السرعة ⚡</h3>
              <p className="text-sm opacity-90">15 سؤال في 60 ثانية!</p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-lg p-8 text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">انتهى الاختبار!</h2>
              <div className="flex justify-center items-center gap-2 mb-4">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-400" />
                <span className="text-5xl font-bold text-indigo-600">{score}</span>
                <span className="text-2xl text-gray-500">/ {questions.length}</span>
              </div>
              <p className="text-gray-600 mb-6">
                {score === questions.length
                  ? 'ممتاز! إجابات كلها صحيحة!'
                  : score >= questions.length * 0.7
                  ? 'جيد جداً! استمر في التدرب!'
                  : 'واصل التدرب ستتحسن!'}
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {answers.map((correct, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                ))}
              </div>
              <button
                onClick={resetQuiz}
                className="mt-6 flex items-center gap-2 mx-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                اختبار جديد
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-lg p-6 md:p-8"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                  <span className="font-bold text-indigo-600">{score}</span>
                </div>
                <span className="text-gray-500">
                  السؤال {currentIndex + 1} من {questions.length}
                </span>
                {mode === 'timed' && (
                  <div className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-bold">{timeLeft}</span>
                  </div>
                )}
              </div>

              {/* Question */}
              <div className="text-center mb-8">
                <p className="text-4xl md:text-5xl font-bold text-gray-800">
                  {currentQuestion.a} × {currentQuestion.b}
                  {mode === 'truefalse' && currentQuestion.displayAnswer !== undefined && (
                    <span> = {currentQuestion.displayAnswer}</span>
                  )}
                </p>
              </div>

              {/* Answer Options */}
              {mode === 'multiple' && currentQuestion.options && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === currentQuestion.answer;
                    const showColor = selectedOption !== null;

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedOption !== null}
                        className={`p-4 md:p-6 rounded-2xl border-2 text-2xl md:text-3xl font-bold transition-all ${
                          showColor
                            ? isCorrect
                              ? 'bg-green-100 border-green-400 text-green-700'
                              : isSelected && !isCorrect
                              ? 'bg-red-100 border-red-400 text-red-700'
                              : 'bg-gray-100 border-gray-200 text-gray-500'
                            : 'bg-indigo-100 border-indigo-200 text-indigo-700 hover:bg-indigo-200'
                        }`}
                      >
                        {opt}
                        {showColor && isCorrect && <Check className="w-6 h-6 inline mr-2" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {mode === 'truefalse' && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleAnswer(true)}
                    disabled={selectedOption !== null}
                    className={`px-8 py-4 rounded-2xl font-bold text-xl ${
                      selectedOption !== null
                        ? 'bg-green-100 text-green-700 border-2 border-green-400'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    صواب ✓
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    disabled={selectedOption !== null}
                    className={`px-8 py-4 rounded-2xl font-bold text-xl ${
                      selectedOption === 0
                        ? 'bg-red-100 text-red-700 border-2 border-red-400'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    خطأ ✗
                  </button>
                </div>
              )}

              {mode === 'fillblank' && (
                <div className="text-center">
                  <div className="flex justify-center items-center gap-2 mb-4">
                    <span className="text-4xl font-bold">{currentQuestion.a} × {currentQuestion.b} =</span>
                    <input
                      type="number"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={showResults}
                      className="w-24 text-3xl font-bold text-center py-2 border-2 border-indigo-300 rounded-xl focus:border-indigo-500 outline-none"
                      placeholder="؟"
                    />
                  </div>
                  <button
                    onClick={() => handleAnswer(userInput)}
                    disabled={!userInput || showResults}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:cursor-not-allowed"
                  >
                    تحقق
                  </button>
                </div>
              )}

              {mode === 'timed' && currentQuestion.options && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedOption(opt);
                        const isCorrect = opt === currentQuestion.answer;
                        setAnswers((prev) => [...prev, isCorrect]);
                        if (isCorrect) {
                          setScore((prev) => prev + 1);
                        }
                        if (currentIndex < questions.length - 1) {
                          setTimeout(() => {
                            setCurrentIndex((prev) => prev + 1);
                            setSelectedOption(null);
                          }, 200);
                        } else {
                          setIsRunning(false);
                          setShowResults(true);
                        }
                      }}
                      className={`p-4 md:p-6 rounded-2xl border-2 text-2xl font-bold transition-all ${
                        selectedOption === opt
                          ? opt === currentQuestion.answer
                            ? 'bg-green-100 border-green-400'
                            : 'bg-red-100 border-red-400'
                          : 'bg-indigo-100 border-indigo-200 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
