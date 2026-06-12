-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table progress
CREATE TABLE IF NOT EXISTS table_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL CHECK (table_number >= 1 AND table_number <= 12),
  mastery INTEGER DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 100),
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, table_number)
);

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL,
  tables TEXT[] NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL
);

-- Student achievements
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- Worksheets
CREATE TABLE IF NOT EXISTS worksheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  tables TEXT[] NOT NULL,
  difficulty TEXT NOT NULL,
  student_name TEXT,
  teacher_name TEXT,
  school_name TEXT,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('النجم الأول', 'احصل على أول نجمة', '⭐', 'stars', 1),
('جامع النجوم', 'اجمع 10 نجوم', '🌟', 'stars', 10),
('ملك النجوم', 'اجمع 50 نجمة', '👑', 'stars', 50),
('البداية', 'أكمل أول اختبار', '🎯', 'quizzes', 1),
('المختبر', 'أكمل 10 اختبارات', '📝', 'quizzes', 10),
('بطل الجداول', 'أتقن جدولاً واحداً', '🏆', 'mastery', 1),
('خبير الجداول', 'أتقن 6 جداول', '🎓', 'mastery', 6),
('ملك الضرب', 'أتقن جميع الجداول الـ12', '👑', 'mastery', 12),
('سلسلة التعلم', 'تعلم 3 أيام متتالية', '🔥', 'streak', 3),
('المثابر', 'تعلم 7 أيام متتالية', '💪', 'streak', 7),
('السريع', 'أجب 10 أسئلة صحيحة متتالية', '⚡', 'streak_correct', 10),
('المدرسة', 'أنشئ ورقة عمل', '📄', 'worksheets', 1),
('المعلم', 'أنشئ 5 أوراق عمل', '📚', 'worksheets', 5)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (for children's app without auth)
CREATE POLICY "public_access_students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_table_progress" ON table_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_quiz_sessions" ON quiz_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "public_access_student_achievements" ON student_achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access_worksheets" ON worksheets FOR ALL USING (true) WITH CHECK (true);