import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate multiplication questions for a specific table
export function generateTableQuestions(tableNumber: number, count: number = 12): { a: number; b: number; answer: number }[] {
  const questions: { a: number; b: number; answer: number }[] = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      a: tableNumber,
      b: i,
      answer: tableNumber * i,
    });
  }
  return questions;
}

// Generate random multiplication question for a range of tables
export function generateRandomQuestion(
  tables: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
): { a: number; b: number; answer: number } {
  const a = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * 12) + 1;
  return { a, b, answer: a * b };
}

// Find all equal products for a given result
export function findEqualProducts(result: number): { a: number; b: number }[] {
  const pairs: { a: number; b: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    if (result % i === 0 && result / i <= 12) {
      pairs.push({ a: i, b: result / i });
    }
  }
  return pairs;
}

// Get numbers with multiple factor pairs (good for equal products exercises)
export function getNumbersWithMultipleFactors(): number[] {
  const numbers: number[] = [];
  // Only include products that have multiple factor pairs with factors 1-12
  for (let n = 1; n <= 144; n++) {
    const pairs = findEqualProducts(n);
    if (pairs.length >= 2) {
      numbers.push(n);
    }
  }
  return numbers;
}

// Shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate quiz questions
export function generateQuizQuestions(
  tables: number[],
  count: number,
  type: 'multiple-choice' | 'true-false' | 'fill-blank' = 'multiple-choice'
) {
  const questions: {
    a: number;
    b: number;
    answer: number;
    options?: number[];
    isTrue?: boolean;
  }[] = [];

  for (let i = 0; i < count; i++) {
    const q = generateRandomQuestion(tables);

    if (type === 'multiple-choice') {
      const options = new Set<number>([q.answer]);
      while (options.size < 4) {
        const offset = Math.floor(Math.random() * 20) - 10;
        const wrongAnswer = q.answer + offset;
        if (wrongAnswer > 0 && wrongAnswer !== q.answer) {
          options.add(wrongAnswer);
        }
      }
      questions.push({ ...q, options: shuffleArray(Array.from(options)) });
    } else if (type === 'true-false') {
      const isTrue = Math.random() > 0.3;
      const displayAnswer = isTrue ? q.answer : q.answer + (Math.random() > 0.5 ? 1 : -1);
      questions.push({
        a: q.a,
        b: q.b,
        answer: displayAnswer,
        isTrue: q.answer === displayAnswer,
      });
    } else {
      questions.push(q);
    }
  }

  return questions;
}

// Get table tips/rules
export function getTableTips(tableNumber: number): string[] {
  const tips: { [key: number]: string[] } = {
    1: ['أي عدد مضروب في 1 يساوي نفسه'],
    2: ['الضرب في 2 يعني مضاعفة العدد'],
    3: ['مجموع أرقام الناتج يقبل القسمة على 3'],
    4: ['الضرب في 4 يساوي الضرب في 2 مرتين'],
    5: ['آحاده يكون 0 أو 5'],
    6: ['الضرب في 6 يساوي الضرب في 3 ثم في 2'],
    7: ['لا يحفظ - يُجرّب!'],
    8: ['الضرب في 8 يساوي الضرب في 2 ثلاث مرات'],
    9: ['مجموع أرقام الناتج يساوي 9 (مثال: 9×5=45، 4+5=9)'],
    10: ['أضف صفراً إلى يمين العدد'],
    11: ['كرر العدد للأعداد من 1-9 (11×3=33)'],
    12: ['سهل! اضرب في 10 ثم أضف ضعف العدد (12×5=60، 5+5=10، 50+10=60)'],
  };

  return tips[tableNumber] || [];
}

// Arabic number words
export const arabicNumbers = [
  'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة',
  'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر'
];

// Avatar options
export const avatarOptions = [
  '🦁', '🐼', '🦊', '🐰', '🐻', '🦄', '🐨', '老虎'
];
