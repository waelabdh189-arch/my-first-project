'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Trophy, Star, Shuffle, Target } from 'lucide-react';
import { findEqualProducts, shuffleArray } from '@/lib/utils';
import { useStudent } from '@/lib/student-context';

type ActivityMode = 'select' | 'learn' | 'multiple' | 'find-another' | 'complete-group' | 'matching' | 'timed';

interface Question {
  target: number;
  equations: { a: number; b: number; equation: string; isCorrect: boolean }[];
}

// Learning progression starting from Table 3
const learningProgression = [
  { result: 12, tables: [3, 2], description: 'النتيجة 12 - جداول 2 و 3' },
  { result: 18, tables: [3, 2], description: 'النتيجة 18 - جداول 2 و 3' },
  { result: 24, tables: [3, 2, 4], description: 'النتيجة 24 - جداول 2 و 3 و 4' },
  { result: 36, tables: [3, 4, 6], description: 'النتيجة 36 - جداول 3 و 4 و 6' },
  { result: 48, tables: [3, 4, 6, 8], description: 'النتيجة 48 - جداول 3 و 4 و 6 و 8' },
  { result: 60, tables: [3, 4, 5, 6], description: 'النتيجة 60 - جداول 3 و 4 و 5 و 6' },
  { result: 72, tables: [3, 6, 8, 9], description: 'النتيجة 72 - جداول 3 و 6 و 8 و 9' },
  { result: 96, tables: [3, 6, 8], description: 'النتيجة 96 - جداول 6 و 8' },
];

function generateLearnQuestion(learningIndex: number): Question {
  const target = learningProgression[learningIndex];
  const correctPairs = findEqualProducts(target.result);
  const options: { a: number; b: number; equation: string; isCorrect: boolean }[] = [];

  // Add all correct pairs
  correctPairs.forEach(({ a, b }) => {
    options.push({
      a,
      b,
      equation: `${a} × ${b}`,
      isCorrect: true,
    });
  });

  // Add some incorrect pairs
  let attempts = 0;
  while (options.length < correctPairs.length + 3 && attempts < 30) {
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

function generateMultipleChoiceQuestion(): Question {
  const productIndex = Math.floor(Math.random() * learningProgression.length);
  return generateLearnQuestion(productIndex);
}

function generateFindAnotherQuestion(): Question {
  const productIndex = Math.floor(Math.random() * learningProgression.length);
  const target = learningProgression[productIndex];
  const correctPairs = findEqualProducts(target.result);

  // Pick one correct equation to show
  const shownPair = correctPairs[Math.floor(Math.random() * correctPairs.length)];

  return {
    target: target.result,
    equations: [
      { a: shownPair.a, b: shownPair.b, equation: `${shownPair.a} × ${shownPair.b}`, isCorrect: true },
    ],
  };
}

function generateMatchingQuestion(): Question {
  const productIndex = Math.floor(Math.random() * learningProgression.length);
  const target = learningProgression[productIndex];
  return {
    target: target.result,
    equations: [],
  };
}

export default function MatchPage() {
  const { updateStars } = useStudent();
  const [mode, setMode] = useState<ActivityMode>('select');
  const [learningIndex, setLearningIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [findAnotherInput, setFindAnotherInput] = useState('');
  const [timedCorrect, setTimedCorrect] = useState(0);
  const [matchingCards, setMatchingCards] = useState<{ id: number; content: string; pairId: number; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);

  const currentQuestion = questions[currentIndex];
  const correctPairs = useMemo(() => {
    if (!currentQuestion) return [];
    return findEqualProducts(currentQuestion.target);
  }, [currentQuestion]);

  // Timer for timed mode
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setGameComplete(true);
      updateStars(timedCorrect);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timedCorrect, updateStars]);

  const startMode = (newMode: ActivityMode) => {
    setMode(newMode);
    setScore(0);
    setGameComplete(false);
    setShowResult(false);
    setSelections(new Set());
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setTimedCorrect(0);

    if (newMode === 'learn') {
      setLearningIndex(0);
      const q = generateLearnQuestion(0);
      setQuestions([q]);
    } else if (newMode === 'multiple') {
      const qs = Array.from({ length: 5 }, () => generateMultipleChoiceQuestion());
      setQuestions(qs);
    } else if (newMode === 'find-another') {
      const qs = Array.from({ length: 5 }, () => generateFindAnotherQuestion());
      setQuestions(qs);
    } else if (newMode === 'timed') {
      setTimeLeft(60);
      setIsRunning(true);
      const qs = Array.from({ length: 20 }, () => generateMultipleChoiceQuestion());
      setQuestions(qs);
    } else if (newMode === 'matching') {
      initMatchingGame();
    }
  };

  const initMatchingGame = () => {
    const productIndex = Math.floor(Math.random() * learningProgression.length);
    const target = learningProgression[productIndex];
    const pairs = findEqualProducts(target.result).slice(0, 4);

    const cards: { id: number; content: string; pairId: number; flipped: boolean; matched: boolean }[] = [];
    pairs.forEach((pair, idx) => {
      cards.push({ id: idx * 2, content: `${pair.a} × ${pair.b}`, pairId: idx, flipped: false, matched: false });
      cards.push({ id: idx * 2 + 1, content: `${target.result}`, pairId: idx, flipped: false, matched: false });
    });

    setMatchingCards(shuffleArray(cards));
    setFlippedCards([]);
    setMatches(0);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;

    const card = matchingCards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newCards = matchingCards.map((c) =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setMatchingCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const card1 = matchingCards.find((c) => c.id === first);
      const card2 = newCards.find((c) => c.id === second);

      if (card1 && card2 && card1.pairId === card2.pairId) {
        setMatchingCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second ? { ...c, matched: true } : c
          )
        );
        setMatches((prev) => prev + 1);
        updateStars(1);

        if (matches + 1 === 4) {
          setGameComplete(true);
        }
      }

      setTimeout(() => {
        setMatchingCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          )
        );
        setFlippedCards([]);
      }, 1000);
    }
  };

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

    let correct = 0;
    const correctEquations = currentQuestion.equations
      .filter(eq => eq.isCorrect)
      .map(eq => eq.equation);

    selections.forEach(sel => {
      if (correctEquations.includes(sel)) {
        correct++;
      }
    });

    selections.forEach(sel => {
      const eq = currentQuestion.equations.find(e => e.equation === sel);
      if (eq && !eq.isCorrect) {
        correct -= 1;
      }
    });

    const allCorrectSelected = correctEquations.every(eq => selections.has(eq));
    if (allCorrectSelected) {
      correct += 1;
    }

    setScore(prev => prev + Math.max(0, correct));
  };

  const handleNext = () => {
    if (mode === 'learn') {
      // Move to next learning item or complete
      if (learningIndex < learningProgression.length - 1) {
        setLearningIndex(learningIndex + 1);
        const q = generateLearnQuestion(learningIndex + 1);
        setQuestions([q]);
        setSelections(new Set());
        setShowResult(false);
      } else {
        setGameComplete(true);
        updateStars(score);
      }
    } else if (mode === 'timed') {
      // Timed mode handles itself
    } else {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelections(new Set());
        setShowResult(false);
        setSelectedAnswer(null);
        setFindAnotherInput('');
      } else {
        setGameComplete(true);
        updateStars(score);
      }
    }
  };

  const handleMultipleChoice = (equation: string) => {
    setSelectedAnswer(equation);
    setShowResult(true);
    const eq = currentQuestion.equations.find(e => e.equation === equation);
    if (eq?.isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleFindAnother = () => {
    const [a, b] = findAnotherInput.split('×').map(s => parseInt(s.trim(), 10));
    const isCorrect = correctPairs.some(p => p.a === a && p.b === b) &&
      !currentQuestion.equations.some(e => e.a === a && e.b === b);

    setShowResult(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  const handleTimedAnswer = (equation: string) => {
    const eq = currentQuestion.equations.find(e => e.equation === equation);
    if (eq?.isCorrect) {
      setTimedCorrect(prev => prev + 1);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelections(new Set());
    } else {
      setIsRunning(false);
      setGameComplete(true);
    }
  };

  // Selection Screen
  if (mode === 'select') {
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
              تعلم أن للنتيجة الواحدة عدة معادلات مختلفة
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Learn Mode */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => startMode('learn')}
              className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-2xl text-right shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl mb-3 block">📚</span>
              <h3 className="text-xl font-bold mb-2">تعلم تدريجي</h3>
              <p className="text-sm opacity-90">ابدأ من جدول 3 وتقدم تدريجياً</p>
            </motion.button>

            {/* Multiple Choice */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => startMode('multiple')}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl text-right shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl mb-3 block">✅</span>
              <h3 className="text-xl font-bold mb-2">اختيار متعدد</h3>
              <p className="text-sm opacity-90">اختر جميع المعادلات الصحيحة</p>
            </motion.button>

            {/* Find Another */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => startMode('find-another')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl text-right shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl mb-3 block">🔍</span>
              <h3 className="text-xl font-bold mb-2">أوجد معادلة أخرى</h3>
              <p className="text-sm opacity-90">ابحث عن معادلة أخرى تعطي نفس الناتج</p>
            </motion.button>

            {/* Matching */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => startMode('matching')}
              className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-2xl text-right shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl mb-3 block">🎴</span>
              <h3 className="text-xl font-bold mb-2">مطابقة البطاقات</h3>
              <p className="text-sm opacity-90">طابق المعادلة مع الناتج</p>
            </motion.button>

            {/* Timed Challenge */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => startMode('timed')}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-2xl text-right shadow-lg hover:scale-105 transition-transform md:col-span-2"
            >
              <span className="text-4xl mb-3 block">⚡</span>
              <h3 className="text-xl font-bold mb-2">تحدي السرعة (60 ثانية)</h3>
              <p className="text-sm opacity-90">كم معادلة صحيحة ستجد؟</p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Game Complete Screen
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
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
              <span className="text-4xl font-bold text-teal-600">{mode === 'timed' ? timedCorrect : score}</span>
            </div>
            <p className="text-gray-600 mb-6">لقد أكملت النشاط بنجاح!</p>
            <button
              onClick={() => setMode('select')}
              className="flex items-center gap-2 mx-auto bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              النشاطات
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Matching Game Mode
  if (mode === 'matching') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setMode('select')} className="text-teal-600 hover:text-teal-700 font-medium">
              ← العودة
            </button>
            <span className="text-teal-600 font-bold">الأزواج: {matches}/4</span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-center text-pink-700 mb-6">مطابقة المعادلة مع الناتج</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {matchingCards.map((card) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`aspect-square rounded-xl text-xl font-bold transition-all ${
                    card.matched
                      ? 'bg-green-100 text-green-700'
                      : card.flipped
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                  whileHover={{ scale: card.matched || card.flipped ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {card.flipped || card.matched ? card.content : '?'}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Activity Display
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setMode('select')} className="text-teal-600 hover:text-teal-700 font-medium">
            ← العودة
          </button>
          <div className="flex items-center gap-4">
            {mode === 'timed' && (
              <div className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
                <span className="font-bold">{timeLeft}s</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-teal-600">{mode === 'timed' ? timedCorrect : score}</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-teal-100"
          >
            {/* Progress */}
            {mode !== 'timed' && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 text-sm">
                  {mode === 'learn' ? `المستوى ${learningIndex + 1} من ${learningProgression.length}` : `السؤال ${currentIndex + 1} من ${questions.length}`}
                </span>
              </div>
            )}

            {/* Learning Info */}
            {mode === 'learn' && (
              <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
                <p className="text-yellow-800 text-center">{learningProgression[learningIndex].description}</p>
              </div>
            )}

            {/* Target */}
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 mb-2">
                {mode === 'find-another' ? 'أوجد معادلة أخرى تعطي الناتج:' : 'اختر جميع المعادلات التي ناتجها:'}
              </p>
              <div className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-4xl font-bold shadow-lg">
                {currentQuestion.target}
              </div>
            </div>

            {/* Find Another Mode - Show given equation */}
            {mode === 'find-another' && currentQuestion.equations[0] && (
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">المعادلة المعطاة:</p>
                <div className="inline-block bg-purple-100 text-purple-700 px-6 py-3 rounded-xl text-2xl font-bold">
                  {currentQuestion.equations[0].equation} = {currentQuestion.target}
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <input
                    type="number"
                    min="1" max="12"
                    placeholder="؟"
                    className="w-16 text-xl text-center border-2 border-purple-300 rounded-lg p-2"
                    onChange={(e) => setFindAnotherInput(findAnotherInput.split('×').length === 2 ? `${e.target.value}×${findAnotherInput.split('×')[1]}` : e.target.value)}
                  />
                  <span className="text-2xl self-center">×</span>
                  <input
                    type="number"
                    min="1" max="12"
                    placeholder="؟"
                    className="w-16 text-xl text-center border-2 border-purple-300 rounded-lg p-2"
                    onChange={(e) => {
                      const parts = findAnotherInput.split('×');
                      setFindAnotherInput(`${parts[0] || ''}×${e.target.value}`);
                    }}
                  />
                </div>
                <button
                  onClick={handleFindAnother}
                  className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl font-bold"
                >
                  تحقق
                </button>
              </div>
            )}

            {/* Multiple/Learn Mode - Interactive Checkboxes */}
            {(mode === 'multiple' || mode === 'learn') && !showResult && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentQuestion.equations.map((eq, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggle(eq.equation)}
                    className={`p-4 md:p-6 rounded-2xl border-2 transition-all ${
                      selections.has(eq.equation)
                        ? 'bg-teal-100 border-teal-400 text-teal-700'
                        : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
                      {selections.has(eq.equation) && <Check className="w-6 h-6" />}
                      {eq.equation}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Result Display */}
            {(mode === 'multiple' || mode === 'learn') && showResult && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentQuestion.equations.map((eq, idx) => {
                  const isSelected = selections.has(eq.equation);
                  const isCorrect = eq.isCorrect;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border-2 ${
                        isCorrect
                          ? 'bg-green-100 border-green-400 text-green-700'
                          : isSelected
                          ? 'bg-red-100 border-red-400 text-red-700'
                          : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}
                    >
                      <div className="text-2xl font-bold flex items-center justify-center gap-2">
                        {isCorrect ? <Check className="w-6 h-6" /> : isSelected && <X className="w-6 h-6" />}
                        {eq.equation}
                      </div>
                      {isCorrect && <div className="text-sm text-center mt-1">= {currentQuestion.target}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Timed Mode */}
            {mode === 'timed' && (
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.equations.map((eq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTimedAnswer(eq.equation)}
                    className="p-4 md:p-6 bg-teal-100 hover:bg-teal-200 rounded-2xl border-2 border-teal-200 text-teal-700 text-2xl font-bold transition-all"
                  >
                    {eq.equation}
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            {(mode === 'multiple' || mode === 'learn') && (
              <div className="flex justify-center gap-4 mt-6">
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
                    {mode === 'learn'
                      ? learningIndex < learningProgression.length - 1
                        ? 'التالي'
                        : 'إنهاء'
                      : currentIndex < questions.length - 1
                      ? 'التالي'
                      : 'النتيجة'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
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
            قد يكون للعدد نفسه عدة أزواج من العوامل. مثلاً: 24 = 2×12 = 3×8 = 4×6 = 6×4 = 8×3 = 12×2
          </p>
        </motion.div>
      </div>
    </div>
  );
}
