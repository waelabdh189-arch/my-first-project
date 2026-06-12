'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface Student {
  id: string;
  name: string;
  avatar: number;
  stars: number;
  streak: number;
  total_questions: number;
  correct_answers: number;
  created_at: string;
}

export interface TableProgress {
  id: string;
  student_id: string;
  table_number: number;
  mastery: number;
  attempts: number;
  correct: number;
  last_practiced: string;
}

interface StudentContextType {
  student: Student | null;
  tableProgress: TableProgress[];
  loading: boolean;
  setStudent: (student: Student | null) => void;
  updateStars: (amount: number) => void;
  updateProgress: (tableNumber: number, correct: boolean) => void;
  refreshProgress: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [tableProgress, setTableProgress] = useState<TableProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedStudentId = localStorage.getItem('studentId');
    if (savedStudentId) {
      loadStudent(savedStudentId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadStudent = async (studentId: string) => {
    try {
      const { data: studentData, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;

      if (studentData) {
        setStudent(studentData);
        await loadProgress(studentId);
      }
    } catch (error) {
      console.error('Error loading student:', error);
      localStorage.removeItem('studentId');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('table_progress')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      setTableProgress(data || []);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const updateStars = async (amount: number) => {
    if (!student) return;

    const newStars = Math.max(0, student.stars + amount);
    const { error } = await supabase
      .from('students')
      .update({ stars: newStars })
      .eq('id', student.id);

    if (!error) {
      setStudent({ ...student, stars: newStars });
    }
  };

  const updateProgress = async (tableNumber: number, correct: boolean) => {
    if (!student) return;

    const existing = tableProgress.find(p => p.table_number === tableNumber);
    const now = new Date().toISOString();

    if (existing) {
      const newAttempts = existing.attempts + 1;
      const newCorrect = existing.correct + (correct ? 1 : 0);
      const newMastery = Math.round((newCorrect / newAttempts) * 100);

      const { error } = await supabase
        .from('table_progress')
        .update({
          attempts: newAttempts,
          correct: newCorrect,
          mastery: newMastery,
          last_practiced: now
        })
        .eq('id', existing.id);

      if (!error) {
        setTableProgress(prev => prev.map(p =>
          p.table_number === tableNumber
            ? { ...p, attempts: newAttempts, correct: newCorrect, mastery: newMastery, last_practiced: now }
            : p
        ));
      }
    } else {
      const { data, error } = await supabase
        .from('table_progress')
        .insert({
          student_id: student.id,
          table_number: tableNumber,
          attempts: 1,
          correct: correct ? 1 : 0,
          mastery: correct ? 100 : 0,
          last_practiced: now
        })
        .select()
        .single();

      if (!error && data) {
        setTableProgress(prev => [...prev, data]);
      }
    }

    // Update total questions
    const { error: studentError } = await supabase
      .from('students')
      .update({
        total_questions: student.total_questions + 1,
        correct_answers: student.correct_answers + (correct ? 1 : 0)
      })
      .eq('id', student.id);

    if (!studentError) {
      setStudent({
        ...student,
        total_questions: student.total_questions + 1,
        correct_answers: student.correct_answers + (correct ? 1 : 0)
      });
    }
  };

  const refreshProgress = () => {
    if (student) {
      loadProgress(student.id);
    }
  };

  return (
    <StudentContext.Provider value={{
      student,
      tableProgress,
      loading,
      setStudent,
      updateStars,
      updateProgress,
      refreshProgress
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
