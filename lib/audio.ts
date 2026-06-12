// Audio utility for Arabic speech synthesis
// Uses Web Speech API with Arabic child voice options

type VoiceType = 'child-boy' | 'child-girl' | 'adult-male' | 'adult-female' | 'mixed';

interface AudioOptions {
  voiceType?: VoiceType;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Get available Arabic voice - prioritize child voices
function getArabicVoice(voiceType: VoiceType = 'child-boy'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();

  // Filter for Arabic voices - strict filter first
  let arabicVoices = voices.filter(voice =>
    voice.lang.startsWith('ar') ||
    voice.lang.includes('AR')
  );

  // If no strict matches, try broader search
  if (arabicVoices.length === 0) {
    arabicVoices = voices.filter(voice =>
      voice.name.toLowerCase().includes('arabic') ||
      voice.name.toLowerCase().includes('arabic')
    );
  }

  if (arabicVoices.length === 0) {
    // No Arabic voices available - use first available
    return voices[0] || null;
  }

  // Voice name keywords for different types
  const voiceKeywords: Record<VoiceType, string[][]> = {
    'child-boy': [['boy', 'child', 'أحمد', 'mohammed', 'majed'], ['male']],
    'child-girl': [['girl', 'child', 'فاطمة', 'maryam', 'laila'], ['female']],
    'adult-male': [['male', 'man', 'رجل', 'أحمد'], []],
    'adult-female': [['female', 'woman', 'امرأة', 'فاطمة'], []],
    'mixed': [['arabic'], []],
  };

  const keywords = voiceKeywords[voiceType];

  // First try primary keywords (child-specific)
  for (const keyword of keywords[0]) {
    const found = arabicVoices.find(v =>
      v.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (found) return found;
  }

  // Then try secondary keywords
  for (const keyword of keywords[1]) {
    const found = arabicVoices.find(v =>
      v.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (found) return found;
  }

  // Return first available Arabic voice
  return arabicVoices[0];
}

// Voice settings optimized for different types
const voiceSettings: Record<VoiceType, { rate: number; pitch: number }> = {
  'child-boy': { rate: 0.85, pitch: 1.4 },  // Higher pitch for child
  'child-girl': { rate: 0.9, pitch: 1.5 },   // Even higher pitch
  'adult-male': { rate: 0.95, pitch: 1.0 },
  'adult-female': { rate: 0.95, pitch: 1.15 },
  'mixed': { rate: 0.9, pitch: 1.2 },
};

// Speak Arabic text - default to child-boy voice
export function speakArabic(
  text: string,
  options: AudioOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Default to child-boy voice for educational content
    const voiceType = options.voiceType || 'child-boy';
    const settings = voiceSettings[voiceType];

    // Set voice
    const voice = getArabicVoice(voiceType);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'ar-SA'; // Fallback to Saudi Arabic
    }

    // Apply settings
    utterance.rate = options.rate ?? settings.rate;
    utterance.pitch = options.pitch ?? settings.pitch;
    utterance.volume = options.volume ?? 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      resolve(); // Don't reject, just resolve
    };

    // Some browsers need a delay for voice loading
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  });
}

// Speak multiplication equation
export function speakEquation(
  a: number,
  b: number,
  answer?: number,
  options: AudioOptions = {}
): Promise<void> {
  const arabicNumbers = [
    'صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة',
    'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
    'أحد عشر', 'اثنا عشر'
  ];

  const aText = a <= 12 ? arabicNumbers[a] : a.toString();
  const bText = b <= 12 ? arabicNumbers[b] : b.toString();

  let text = `${aText} ضرب ${bText}`;
  if (answer !== undefined) {
    const ansText = answer <= 144 ? numberToArabicWords(answer) : answer.toString();
    text += ` يساوي ${ansText}`;
  }

  return speakArabic(text, options);
}

// Convert number to Arabic words
export function numberToArabicWords(num: number): string {
  if (num <= 12) {
    const units = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر'];
    return units[num];
  }

  const tens: { [key: number]: string } = {
    20: 'عشرون',
    30: 'ثلاثون',
    40: 'أربعون',
    50: 'خمسون',
    60: 'ستون',
    70: 'سبعون',
    80: 'ثمانون',
    90: 'تسعون',
    100: 'مئة',
  };

  if (num >= 1 && num <= 12) {
    const units = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر'];
    return units[num];
  }

  if (num >= 13 && num <= 19) {
    const teens: { [key: number]: string } = {
      13: 'ثلاثة عشر',
      14: 'أربعة عشر',
      15: 'خمسة عشر',
      16: 'ستة عشر',
      17: 'سبعة عشر',
      18: 'ثمانية عشر',
      19: 'تسعة عشر',
    };
    return teens[num];
  }

  if (num >= 20 && num <= 99) {
    const t = Math.floor(num / 10) * 10;
    const u = num % 10;
    if (u === 0) return tens[t];
    const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    return `${units[u]} وعشرون`.replace('عشرون', tens[t].replace('ون', 'ين') || 'عشرين');
  }

  if (num >= 100 && num <= 144) {
    const h = Math.floor(num / 100);
    const remainder = num % 100;
    const hundredText = h === 1 ? 'مئة' : 'مئتين';

    if (remainder === 0) return hundredText;

    return `${hundredText} و${numberToArabicWords(remainder)}`;
  }

  return num.toString();
}

// Play success sound (using Web Audio API for simple beep)
export function playSuccessSound(): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;

  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 880;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.warn('Could not play sound:', e);
  }
}

// Play error sound
export function playErrorSound(): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;

  try {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    console.warn('Could not play sound:', e);
  }
}

// Initialize voices when they become available
export function initVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

// نشيد الحفظ - Rhythmic multiplication table chant
// Arabic-only, child voice, no music, rhythmic memorization style
export async function chantMultiplicationTable(
  tableNumber: number,
  voiceType: VoiceType = 'child-boy'
): Promise<void> {
  const arabicNumbers = [
    'صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة',
    'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
    'أحد عشر', 'اثنا عشر'
  ];

  // Create rhythmic chant for the table
  // Example for table 3: "واحد في ثلاثة يساوي ثلاثة، اثنان في ثلاثة يساوي ستة،..."
  for (let i = 1; i <= 12; i++) {
    const result = tableNumber * i;
    const num1Text = arabicNumbers[i] || i.toString();
    const num2Text = arabicNumbers[tableNumber] || tableNumber.toString();
    const resultText = numberToArabicWordsChant(result);

    // Rhythmic format: "عدد × جدول = ناتج"
    const chant = `${num1Text} في ${num2Text}، يساوي ${resultText}`;

    await speakArabic(chant, { voiceType, rate: 0.8 });

    // Short pause between each multiplication
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

// Special number formatting for chant (more rhythmic)
function numberToArabicWordsChant(num: number): string {
  if (num <= 12) {
    const units = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'أحد عشر', 'اثنا عشر'];
    return units[num];
  }

  const tens: { [key: number]: string } = {
    20: 'عشرين',
    30: 'ثلاثين',
    40: 'أربعين',
    50: 'خمسين',
    60: 'ستين',
    70: 'سبعين',
    80: 'ثمانين',
    90: 'تسعين',
    100: 'مئة',
  };

  if (num >= 13 && num <= 19) {
    const teens: { [key: number]: string } = {
      13: 'ثلاثة عشر',
      14: 'أربعة عشر',
      15: 'خمسة عشر',
      16: 'ستة عشر',
      17: 'سبعة عشر',
      18: 'ثمانية عشر',
      19: 'تسعة عشر',
    };
    return teens[num];
  }

  if (num >= 20 && num <= 99) {
    const t = Math.floor(num / 10) * 10;
    const u = num % 10;
    if (u === 0) return tens[t];
    const units = ['', 'واحد', 'اثنين', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    return `${units[u]} و${tens[t]}`;
  }

  if (num >= 100 && num <= 144) {
    const h = Math.floor(num / 100);
    const remainder = num % 100;
    const hundredText = h === 1 ? 'مئة' : 'مئتين';

    if (remainder === 0) return hundredText;

    return `${hundredText} و${numberToArabicWordsChant(remainder)}`;
  }

  return num.toString();
}
