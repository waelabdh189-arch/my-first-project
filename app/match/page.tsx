'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Trophy, Star, TriangleAlert as AlertTriangle } from 'lucide-react';
import { shuffleArray } from '@/lib/utils';
import { useStudent } from '@/lib/student-context';

type ActivityMode = 'select' | 'learn' | 'multiple' | 'complete-group' | 'matching' | 'timed';

// Define equations with their actual results - NEVER use index for validation
interface Equation {
  a: number;
  b: number;
  result: number; // ALWAYS computed as a * b
  equation: string;
}

// Learning progression starting from Table 3
const learningProgression = [
  { target: 12, description: 'النتيجة 12 - جداول 2 و 3 و 4 و 6' },
  { target: 18, description: 'النتيجة 18 - جداول 2 و 3 و 6 و 9' },
  { target: 24, description: 'النتيجة 24 - جداول 2 و 3 و 4 و 6 و 8' },
  { target: 36, description: 'النتيجة 36 - جداول 3 و 4 و 6 و 9' },
  { target: 48, description: 'النتيجة 48 - جداول 4 و 6 و 8' },
  { target: 60, description: 'النتيجة 60 - جداول 5 و 6' },
  { target: 72, description: 'النتيجة 72 - جداول 6 و 8 و 9' },
  { target: 96, description: 'النتيجة 96 - جداول 8 و 12' },
];

// Generate ALL equations that result in a given target (1-12 factors only)
function generateEquationsForTarget(target: number): Equation[] {
  const equations: Equation[] = [];
  for (let a = 1; a <= 12; a++) {
    for (let b = 1; b <= 12; b++) {
      // ONLY accept if the actual multiplication result equals target
      if (a * b === target) {
        equations.push({
          a,
          b,
          result: a * b, // Mathematically computed
          equation: `${a} × ${b}`,
        });
      }
    }
  }
  return equations;
}

// Generate wrong equations (different result)
function generateWrongEquations(target: number, count: number): Equation[] {
  const wrong: Equation[] = [];
  let attempts = 0;

  while (wrong.length < count && attempts < 100) {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const result = a * b; // COMPUTE ACTUAL RESULT

    // ONLY add if result is DIFFERENT from target
    if (result !== target) {
      const exists = wrong.some(e => e.a === a && e.b === b);
      if (!exists) {
        wrong.push({
          a,
          b,
          result, // Actual computed result
          equation: `${a} × ${b}`,
        });
      }
    }
    attempts++;
  }

  return wrong;
}

// VALIDATE: Check if equation belongs to target using multiplication result
function equationBelongsToTarget(equation: Equation, target: number): boolean {
  // ALWAYS compute actual result - never use index or position
  const computedResult = equation.a * equation.b;
  return computedResult === target;
}

// Generate options for multiple choice
function generateMultipleChoiceOptions(target: number): Equation[] {
  const correctEquations = generateEquationsForTarget(target);
  const wrongEquations = generateWrongEquations(target, 3);

  // Combine and shuffle - but each equation carries its ACTUAL result
  const allOptions = [...correctEquations, ...wrongEquations];
  return shuffleArray(allOptions);
}

// Generate a complete-group question with multiple targets
function generateCompleteGroupQuestion(): {
  groups: { target: number; equations: Equation[] }[];
  availableEquations: Equation[];
} {
  // Select 3-4 targets
  const numGroups = Math.floor(Math.random() * 2) + 3;
  const selectedTargets = shuffleArray([...learningProgression])
    .slice(0, numGroups)
    .map(t => t.target);

  const groups: { target: number; equations: Equation[] }[] = [];
  const allEquations: Equation[] = [];

  selectedTargets.forEach(target => {
    const equations = generateEquationsForTarget(target);
    groups.push({ target, equations: [] });
    equations.forEach(eq => {
      allEquations.push(eq);
    });
  });

  return {
    groups,
    availableEquations: shuffleArray(allEquations),
  };
}

export default function MatchPage() {
  const { updateStars } = useStudent();
  const [mode, setMode] = useState<ActivityMode>('select');
  const [learningIndex, setLearningIndex] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<number>(12);
  const [currentOptions, setCurrentOptions] = useState<Equation[]>([]);
  const [selections, setSelections] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Complete Group State
  const [groups, setGroups] = useState<{ target: number; equations: Equation[] }[]>([]);
  const [availableEquations, setAvailableEquations] = useState<Equation[]>([]);
  const [selectedEquation, setSelectedEquation] = useState<Equation | null>(null);

  // Matching Game State
  const [matchingCards, setMatchingCards] = useState<{ id: number; equation: Equation; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);

  // Timed Mode State
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [timedCorrect, setTimedCorrect] = useState(0);

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

  // Validate selections - ALWAYS compute actual results
  const validateSelections = useCallback(() => {
    let correct = 0;
    let incorrect = 0;

    selections.forEach(equationStr => {
      const eq = currentOptions.find(e => e.equation === equationStr);
      if (eq) {
        // COMPUTE actual result and compare to target
        const computedResult = eq.a * eq.b;
        if (computedResult === currentTarget) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    return { correct, incorrect };
  }, [selections, currentOptions, currentTarget]);

  const startMode = (newMode: ActivityMode) => {
    setMode(newMode);
    setScore(0);
    setGameComplete(false);
    setShowResult(false);
    setSelections(new Set());
    setQuestionNumber(0);
    setWarningMessage(null);

    if (newMode === 'learn') {
      setLearningIndex(0);
      const target = learningProgression[0].target;
      setCurrentTarget(target);
      setCurrentOptions(generateMultipleChoiceOptions(target));
    } else if (newMode === 'multiple') {
      const idx = Math.floor(Math.random() * learningProgression.length);
      const target = learningProgression[idx].target;
      setCurrentTarget(target);
      setCurrentOptions(generateMultipleChoiceOptions(target));
    } else if (newMode === 'complete-group') {
      const question = generateCompleteGroupQuestion();
      setGroups(question.groups);
      setAvailableEquations(question.availableEquations);
      setSelectedEquation(null);
    } else if (newMode === 'matching') {
      initMatchingGame();
    } else if (newMode === 'timed') {
      setTimeLeft(60);
      setIsRunning(true);
      setTimedCorrect(0);
      nextTimedQuestion();
    }
  };

  const nextTimedQuestion = () => {
    const idx = Math.floor(Math.random() * learningProgression.length);
    const target = learningProgression[idx].target;
    setCurrentTarget(target);
    setCurrentOptions(generateMultipleChoiceOptions(target).slice(0, 4));
  };

  const initMatchingGame = () => {
    const target = learningProgression[Math.floor(Math.random() * learningProgression.length)].target;
    const equations = generateEquationsForTarget(target).slice(0, 4);

    const cards: { id: number; equation: Equation; flipped: boolean; matched: boolean }[] = [];
    equations.forEach((eq, idx) => {
      cards.push({
        id: idx * 2,
        equation: eq,
        flipped: false,
        matched: false,
      });
      cards.push({
        id: idx * 2 + 1,
        equation: { a: eq.result, b: 0, result: eq.result, equation: `${eq.result}` },
        flipped: false,
        matched: false,
      });
    });

    setMatchingCards(shuffleArray(cards));
    setFlippedCards([]);
    setMatches(0);
    setCurrentTarget(target);
  };

  const handleToggle = (equationStr: string) => {
    if (showResult) return;
    setWarningMessage(null);

    setSelections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(equationStr)) {
        newSet.delete(equationStr);
      } else {
        newSet.add(equationStr);
      }
      return newSet;
    });
  };

  const handleCheck = () => {
    setShowResult(true);

    const { correct, incorrect } = validateSelections();

    // Score: +1 for correct, -1 for incorrect (minimum 0)
    const netScore = Math.max(0, correct - incorrect + 1); // +1 bonus for all correct
    setScore(prev => prev + netScore);
  };

  const handleNext = () => {
    if (mode === 'learn') {
      if (learningIndex < learningProgression.length - 1) {
        const nextIndex = learningIndex + 1;
        setLearningIndex(nextIndex);
        const target = learningProgression[nextIndex].target;
        setCurrentTarget(target);
        setCurrentOptions(generateMultipleChoiceOptions(target));
        setSelections(new Set());
        setShowResult(false);
      } else {
        setGameComplete(true);
        updateStars(score);
      }
    } else if (mode === 'multiple') {
      setQuestionNumber(prev => prev + 1);
      if (questionNumber < 4) {
        const idx = Math.floor(Math.random() * learningProgression.length);
        const target = learningProgression[idx].target;
        setCurrentTarget(target);
        setCurrentOptions(generateMultipleChoiceOptions(target));
        setSelections(new Set());
        setShowResult(false);
      } else {
        setGameComplete(true);
        updateStars(score);
      }
    } else if (mode === 'complete-group') {
      // Generate new question
      const question = generateCompleteGroupQuestion();
      setGroups(question.groups);
      setAvailableEquations(question.availableEquations);
      setSelectedEquation(null);
      setShowResult(false);
    }
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
      const [firstId, secondId] = newFlipped;
      const card1 = matchingCards.find((c) => c.id === firstId);
      const card2 = newCards.find((c) => c.id === secondId);

      if (card1 && card2) {
        // VALIDATE using actual computation - NEVER use index
        const result1 = card1.equation.a * (card1.equation.b || 1);
        const result2 = card2.equation.result;

        // Match if results are equal
        if (result1 === result2) {
          setMatchingCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
            )
          );
          setMatches((prev) => prev + 1);
          updateStars(1);

          if (matches + 1 === 4) {
            setGameComplete(true);
          }
        }
      }

      setTimeout(() => {
        setMatchingCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
          )
        );
        setFlippedCards([]);
      }, 1000);
    }
  };

  // Complete Group - Drop equation into group - VALIDATE by actual result
  const handleDropEquation = (targetGroup: number) => {
    if (!selectedEquation) {
      setWarningMessage('اختر معادلة أولاً');
      return;
    }

    // CRITICAL: Compute actual result and validate
    const computedResult = selectedEquation.a * selectedEquation.b;

    if (computedResult !== targetGroup) {
      // INVALID placement - show warning
      setWarningMessage(`خطأ! ${selectedEquation.equation} = ${computedResult}، وليس ${targetGroup}`);
      return;
    }

    // VALID placement - equation result matches group target
    setWarningMessage(null);

    // Add equation to the correct group
    setGroups(prev => prev.map(g => {
      if (g.target === targetGroup) {
        const alreadyExists = g.equations.some(e => e.equation === selectedEquation.equation);
        if (!alreadyExists) {
          return { ...g, equations: [...g.equations, selectedEquation] };
        }
      }
      return g;
    }));

    // Remove from available
    setAvailableEquations(prev => prev.filter(e => e.equation !== selectedEquation.equation));
    setSelectedEquation(null);

    // Check if all equations are placed
    const totalPlaced = groups.reduce((sum, g) => sum + g.equations.length, 0) + 1;
    const totalNeeded = groups.length * 2; // Average 2 equations per group

    if (availableEquations.length === 1) {
      // Almost done
      setScore(prev => prev + groups.length);
    }
  };

  // Timed mode answer
  const handleTimedAnswer = (equationStr: string) => {
    const eq = currentOptions.find(e => e.equation === equationStr);
    if (eq) {
      // COMPUTE actual result
      const computedResult = eq.a * eq.b;
      if (computedResult === currentTarget) {
        setTimedCorrect(prev => prev + 1);
      }
    }

    if (questionNumber < 19) {
      setQuestionNumber(prev => prev + 1);
      nextTimedQuestion();
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

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => startMode('complete-group')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl text-right shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl mb-3 block">📦</span>
              <h3 className="text-xl font-bold mb-2">تجميع المعادلات</h3>
              <p className="text-sm opacity-90">ضع كل معادلة في مجموعتها الصحيحة</p>
            </motion.button>

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

  // Complete Group Mode
  if (mode === 'complete-group') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setMode('select')} className="text-purple-600 hover:text-purple-700 font-medium">
              ← العودة
            </button>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-purple-600">{score}</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">تجميع المعادلات</h2>
            <p className="text-center text-gray-600 mb-4">اسحب كل معادلة إلى المجموعة التي تعطي نفس الناتج</p>

            {/* Warning Message */}
            {warningMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-300 rounded-xl p-3 mb-4 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">{warningMessage}</span>
              </motion.div>
            )}

            {/* Groups */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {groups.map((group) => (
                <div
                  key={group.target}
                  className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200 min-h-[150px]"
                  onClick={() => selectedEquation && handleDropEquation(group.target)}
                >
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-purple-600">{group.target}</span>
                  </div>
                  <div className="space-y-2">
                    {group.equations.map((eq, idx) => (
                      <div
                        key={idx}
                        className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-center font-medium"
                      >
                        {eq.equation} = {eq.result}
                      </div>
                    ))}
                  </div>
                  {selectedEquation && (
                    <div className="mt-2 text-center text-xs text-purple-500">
                      انقر للإضافة
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Available Equations */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="font-bold text-gray-700 mb-3">المعادلات المتاحة:</h3>
              <div className="flex flex-wrap gap-2">
                {availableEquations.map((eq, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEquation(eq)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedEquation?.equation === eq.equation
                        ? 'bg-purple-500 text-white scale-105'
                        : 'bg-white border border-gray-200 hover:bg-purple-50'
                    }`}
                  >
                    {eq.equation}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  const anyEmpty = groups.some(g => g.equations.length === 0);
                  if (anyEmpty || availableEquations.length > 0) {
                    setWarningMessage('أكمل تجميع جميع المعادلات أولاً');
                  } else {
                    setGameComplete(true);
                    updateStars(score + groups.length);
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold"
              >
                تحقق
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Matching Game Mode
  if (mode === 'matching') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setMode('select')} className="text-pink-600 hover:text-pink-700 font-medium">
              ← العودة
            </button>
            <span className="text-pink-600 font-bold">الأزواج: {matches}/4</span>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-center text-pink-700 mb-6">مطابقة المعادلة مع الناتج</h2>
            <p className="text-center text-gray-500 mb-4">الهدف: {currentTarget}</p>

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
                  {card.flipped || card.matched ? card.equation.equation : '?'}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Timed Mode
  if (mode === 'timed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setMode('select')} className="text-amber-600 hover:text-amber-700 font-medium">
              ← العودة
            </button>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
                <span className="font-bold text-xl">{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-amber-600">{timedCorrect}</span>
              </div>
            </div>
          </div>

          <motion.div
            key={questionNumber}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-lg p-6"
          >
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 mb-2">اختر المعادلة التي ناتجها:</p>
              <div className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-2xl text-4xl font-bold shadow-lg">
                {currentTarget}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentOptions.map((eq) => {
                // COMPUTE actual result for validation display
                const computedResult = eq.a * eq.b;
                const isCorrect = computedResult === currentTarget;

                return (
                  <button
                    key={eq.equation}
                    onClick={() => handleTimedAnswer(eq.equation)}
                    className="p-4 bg-amber-100 hover:bg-amber-200 rounded-xl text-xl font-bold transition-all"
                  >
                    {eq.equation}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Learn/Multiple Choice Mode
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setMode('select')} className="text-teal-600 hover:text-teal-700 font-medium">
            ← العودة
          </button>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-teal-600">{score}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTarget}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-teal-100"
          >
            {/* Progress */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm">
                {mode === 'learn'
                  ? `المستوى ${learningIndex + 1} من ${learningProgression.length}`
                  : `السؤال ${questionNumber + 1} من 5`}
              </span>
            </div>

            {/* Learning Info */}
            {mode === 'learn' && (
              <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
                <p className="text-yellow-800 text-center">{learningProgression[learningIndex].description}</p>
              </div>
            )}

            {/* Target */}
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 mb-2">اختر جميع المعادلات التي ناتجها:</p>
              <div className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-4xl font-bold shadow-lg">
                {currentTarget}
              </div>
            </div>

            {/* Options - Interactive Checkboxes */}
            {!showResult && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentOptions.map((eq) => (
                  <motion.button
                    key={eq.equation}
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
            {showResult && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {currentOptions.map((eq) => {
                  const isSelected = selections.has(eq.equation);
                  // CRITICAL: COMPUTE actual result - NEVER use index
                  const computedResult = eq.a * eq.b;
                  const isCorrect = computedResult === currentTarget;

                  return (
                    <div
                      key={eq.equation}
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
                      <div className="text-sm text-center mt-1">
                        {isCorrect
                          ? `= ${computedResult}`
                          : `= ${computedResult} (ليس ${currentTarget})`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
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
                    : questionNumber < 4
                    ? 'التالي'
                    : 'النتيجة'}
                </button>
              )}
            </div>
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
            قد يكون للعدد نفسه عدة أزواج من العوامل. تحقق دائماً من: عامل₁ × عامل₂ = الناتج
          </p>
        </motion.div>
      </div>
    </div>
  );
}
