'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, RefreshCw, Clock, Shuffle, Target } from 'lucide-react';
import { shuffleArray } from '@/lib/utils';
import { useStudent } from '@/lib/student-context';

type GameMode = 'select' | 'wheel' | 'memory' | 'balloon' | 'speed';

export default function GamesPage() {
  const { updateStars } = useStudent();
  const [mode, setMode] = useState<GameMode>('select');
  const [score, setScore] = useState(0);
  const [resetGame, setResetGame] = useState(0);

  const handleScore = useCallback((points: number) => {
    setScore((prev) => prev + points);
  }, []);

  const goToSelect = () => {
    setMode('select');
    setScore(0);
  };

  // Selection Screen
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-rose-700 mb-4">
              الألعاب التعليمية
            </h1>
            <p className="text-lg text-gray-600">
              اختر لعبة واستمتع بتعلم جداول الضرب!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Wheel Game */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setMode('wheel')}
              className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-8 rounded-3xl text-right shadow-xl hover:scale-105 transition-transform"
            >
              <span className="text-5xl mb-4 block">🎡</span>
              <h3 className="text-2xl font-bold mb-2">عجلة الضرب</h3>
              <p className="text-sm opacity-90">أدر العجلة وأجب على السؤال!</p>
            </motion.button>

            {/* Memory Game */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setMode('memory')}
              className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-8 rounded-3xl text-right shadow-xl hover:scale-105 transition-transform"
            >
              <span className="text-5xl mb-4 block">🎴</span>
              <h3 className="text-2xl font-bold mb-2">بطاقات الذاكرة</h3>
              <p className="text-sm opacity-90">اقلب البطاقات واعثر على الأزواج!</p>
            </motion.button>

            {/* Balloon Game */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setMode('balloon')}
              className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-8 rounded-3xl text-right shadow-xl hover:scale-105 transition-transform"
            >
              <span className="text-5xl mb-4 block">🎈</span>
              <h3 className="text-2xl font-bold mb-2">فقاعات البالون</h3>
              <p className="text-sm opacity-90">انقر على البالون الذي يحمل الإجابة الصحيحة!</p>
            </motion.button>

            {/* Speed Game */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setMode('speed')}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-8 rounded-3xl text-right shadow-xl hover:scale-105 transition-transform"
            >
              <span className="text-5xl mb-4 block">⚡</span>
              <h3 className="text-2xl font-bold mb-2">تحدي السرعة</h3>
              <p className="text-sm opacity-90">تحدي 60 ثانية! كم ستجيب؟</p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Game Container
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with score */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToSelect}
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            ← العودة للألعاب
          </button>
          <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            <span className="font-bold text-yellow-700">{score}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'wheel' && (
            <WheelGame key="wheel" onScore={handleScore} reset={resetGame} />
          )}
          {mode === 'memory' && (
            <MemoryGame key="memory" onScore={handleScore} reset={resetGame} />
          )}
          {mode === 'balloon' && (
            <BalloonGame key="balloon" onScore={handleScore} reset={resetGame} />
          )}
          {mode === 'speed' && (
            <SpeedGame key="speed" onScore={handleScore} reset={resetGame} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Wheel Game Component
function WheelGame({ onScore, reset }: { onScore: (points: number) => void; reset: number }) {
  const [spinning, setSpinning] = useState(false);
  const [tableNumber, setTableNumber] = useState(1);
  const [question, setQuestion] = useState({ a: 1, b: 1, answer: 1 });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateQuestion();
  }, [reset]);

  const generateQuestion = () => {
    const b = Math.floor(Math.random() * 12) + 1;
    setQuestion({
      a: tableNumber,
      b,
      answer: tableNumber * b,
    });
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const spinWheel = () => {
    setSpinning(true);
    const result = Math.floor(Math.random() * 12) + 1;
    setTimeout(() => {
      setTableNumber(result);
      setSpinning(false);
      setTimeout(() => generateQuestion(), 100);
    }, 1000);
  };

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === question.answer) {
      onScore(1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const options = useMemo(() => {
    const opts = new Set<number>([question.answer]);
    let attempts = 0;
    while (opts.size < 4 && attempts < 50) {
      // For large answers (like 12×12=144), use smaller offsets
      const maxOffset = question.answer > 100 ? 30 : question.answer > 50 ? 20 : 12;
      const offset = Math.floor(Math.random() * maxOffset * 2) - maxOffset;
      const wrong = Math.max(1, Math.min(144, question.answer + offset));
      if (wrong !== question.answer && wrong > 0) opts.add(wrong);
      attempts++;
    }
    return shuffleArray(Array.from(opts));
  }, [question.answer]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-lg p-6 md:p-8"
    >
      <h2 className="text-2xl font-bold text-center text-violet-700 mb-6">عجلة الضرب</h2>

      {/* Wheel Display */}
      <div className="flex justify-center mb-6">
        <div
          className={`w-40 h-40 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center shadow-xl ${
            spinning ? 'animate-spin' : ''
          }`}
        >
          <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-violet-600">{tableNumber}</span>
            <span className="text-sm text-violet-400">جدول</span>
          </div>
        </div>
      </div>

      {/* Current Question */}
      {question && (
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-gray-800">
            {question.a} × {question.b} = ?
          </p>
        </div>
      )}

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {options.map((opt) => {
          const isCorrect = opt === question.answer;
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-2xl text-2xl font-bold border-2 transition-all ${
                showResult && isCorrect
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : showResult && selectedAnswer === opt && !isCorrect
                  ? 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-violet-100 border-violet-200 text-violet-700 hover:bg-violet-200'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={spinWheel}
          disabled={spinning}
          className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`} />
          أدر العجلة
        </button>
        <button
          onClick={generateQuestion}
          disabled={spinning || selectedAnswer === null}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          سؤال جديد
        </button>
      </div>

      {streak > 2 && (
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center mt-4 text-lg font-bold text-green-600"
        >
          🔥 سلسلة {streak} إجابات صحيحة!
        </motion.p>
      )}
    </motion.div>
  );
}

// Memory Game Component
function MemoryGame({ onScore, reset }: { onScore: (points: number) => void; reset: number }) {
  const [cards, setCards] = useState<{ id: number; content: string; pairId: number; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    initGame();
  }, [reset]);

  const initGame = () => {
    const questions = [
      { q: '2×3', a: '6' },
      { q: '4×5', a: '20' },
      { q: '6×7', a: '42' },
      { q: '8×9', a: '72' },
      { q: '3×8', a: '24' },
      { q: '5×6', a: '30' },
    ];

    const allCards: { id: number; content: string; pairId: number; flipped: boolean; matched: boolean }[] = [];
    questions.forEach((item, idx) => {
      allCards.push({ id: idx * 2, content: item.q, pairId: idx, flipped: false, matched: false });
      allCards.push({ id: idx * 2 + 1, content: item.a, pairId: idx, flipped: false, matched: false });
    });

    setCards(shuffleArray(allCards));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameComplete(false);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);

      const [first, second] = newFlipped;
      const card1 = cards.find((c) => c.id === first);
      const card2 = newCards.find((c) => c.id === second);

      if (card1 && card2 && card1.pairId === card2.pairId) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second ? { ...c, matched: true } : c
          )
        );
        setMatches((prev) => prev + 1);
        onScore(1);

        if (matches + 1 === 6) {
          setGameComplete(true);
        }
      }

      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          )
        );
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-center text-cyan-700 mb-4">بطاقات الذاكرة</h2>

      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-600">الحركات: {moves}</span>
        <span className="text-cyan-600 font-bold">الأزواج: {matches}/6</span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-xl text-xl font-bold transition-all ${
              card.matched
                ? 'bg-green-100 text-green-700'
                : card.flipped
                ? 'bg-cyan-100 text-cyan-700'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
            whileHover={{ scale: card.matched || card.flipped ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {card.flipped || card.matched ? card.content : '?'}
          </motion.button>
        ))}
      </div>

      {gameComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-2xl font-bold text-green-600 mb-4">🎉 أحسنت! أكملت اللعبة!</p>
          <button onClick={initGame} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold">
            العب مرة أخرى
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Balloon Game Component
function BalloonGame({ onScore, reset }: { onScore: (points: number) => void; reset: number }) {
  const [question, setQuestion] = useState({ a: 3, b: 4, answer: 12 });
  const [balloons, setBalloons] = useState<number[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [popped, setPopped] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateRound();
  }, [reset]);

  const generateRound = () => {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const answer = a * b;

    const opts = new Set<number>([answer]);
    let attempts = 0;
    while (opts.size < 6 && attempts < 50) {
      const maxOffset = answer > 100 ? 40 : answer > 50 ? 25 : 15;
      const offset = Math.floor(Math.random() * maxOffset * 2) - maxOffset;
      const wrong = Math.max(1, Math.min(144, answer + offset));
      if (wrong !== answer) opts.add(wrong);
      attempts++;
    }

    const shuffled = shuffleArray(Array.from(opts));
    const correctIdx = shuffled.indexOf(answer);

    setQuestion({ a, b, answer });
    setBalloons(shuffled);
    setCorrectIndex(correctIdx);
    setPopped([]);
    setShowResult(false);
  };

  const handlePop = (index: number) => {
    if (popped.includes(index)) return;

    setPopped([...popped, index]);

    if (index === correctIndex) {
      onScore(1);
      setStreak((prev) => prev + 1);
      setShowResult(true);
      setTimeout(() => generateRound(), 1000);
    } else {
      setStreak(0);
      setShowResult(true);
    }
  };

  const colors = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-green-400', 'bg-violet-400', 'bg-pink-400'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-center text-rose-700 mb-4">فقاعات البالون</h2>

      <p className="text-3xl font-bold text-center text-gray-800 mb-6">
        {question.a} × {question.b} = ?
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {balloons.map((value, index) => (
          <motion.button
            key={index}
            onClick={() => handlePop(index)}
            disabled={popped.includes(index)}
            className={`aspect-square ${colors[index]} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
              popped.includes(index) ? 'opacity-30' : 'hover:scale-110'
            } transition-all`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: popped.includes(index) ? 0.3 : 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {popped.includes(index) ? '💥' : value}
          </motion.button>
        ))}
      </div>

      {showResult && !popped.includes(correctIndex) && (
        <p className="text-center text-red-600">الإجابة الصحيحة: {question.answer}</p>
      )}

      {streak > 2 && (
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center text-lg font-bold text-green-600"
        >
          🔥 سلسلة {streak} إجابات صحيحة!
        </motion.p>
      )}
    </motion.div>
  );
}

// Speed Game Component
function SpeedGame({ onScore, reset }: { onScore: (points: number) => void; reset: number }) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<{ q: number[]; answer: number; options: number[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    startGame();
  }, [reset]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const startGame = () => {
    const qs: { q: number[]; answer: number; options: number[] }[] = [];
    for (let i = 0; i < 100; i++) {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      const answer = a * b;
      const opts = new Set<number>([answer]);
      let attempts = 0;
      while (opts.size < 4 && attempts < 50) {
        const maxOffset = answer > 100 ? 30 : answer > 50 ? 20 : 12;
        const offset = Math.floor(Math.random() * maxOffset * 2) - maxOffset;
        const wrong = Math.max(1, Math.min(144, answer + offset));
        if (wrong !== answer) opts.add(wrong);
        attempts++;
      }
      qs.push({ q: [a, b], answer, options: shuffleArray(Array.from(opts)) });
    }
    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(60);
    setIsRunning(true);
    setGameComplete(false);
  };

  const endGame = () => {
    setIsRunning(false);
    setGameComplete(true);
    onScore(score);
  };

  const handleAnswer = (selected: number) => {
    const currentQ = questions[currentIndex];
    if (selected === currentQ.answer) {
      setScore((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const current = questions[currentIndex];

  if (gameComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-lg p-8 text-center"
      >
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-amber-700 mb-2">انتهى الوقت!</h2>
        <p className="text-5xl font-bold text-amber-600 mb-4">{correctCount}</p>
        <p className="text-gray-600 mb-6">إجابة صحيحة في 60 ثانية!</p>
        <button onClick={startGame} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold">
          العب مرة أخرى
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />
          <span className="text-2xl font-bold text-amber-600">{score}</span>
        </div>
        <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
          <Clock className="w-6 h-6" />
          <span className="text-2xl font-bold">{timeLeft}</span>
        </div>
      </div>

      {current && (
        <>
          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-gray-800">
              {current.q[0]} × {current.q[1]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="py-4 bg-amber-100 hover:bg-amber-200 text-amber-800 text-2xl font-bold rounded-xl transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
