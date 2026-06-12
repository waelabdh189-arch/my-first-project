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
      // Check if it's a local student
      if (savedStudentId.startsWith('local_')) {
        const savedStudentData = localStorage.getItem('studentData');
        if (savedStudentData) {
          try {
            const localStudent = JSON.parse(savedStudentData);
            setStudent(localStudent);
          } catch (e) {
            console.error('Error parsing local student data:', e);
          }
        }
        setLoading(false);
      } else {
        loadStudent(savedStudentId);
      }
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
      // Don't remove studentId - check if there's local data
      const savedStudentData = localStorage.getItem('studentData');
      if (savedStudentData) {
        try {
          const localStudent = JSON.parse(savedStudentData);
          setStudent(localStudent);
        } catch (e) {
          localStorage.removeItem('studentId');
        }
      } else {
        localStorage.removeItem('studentId');
      }
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

    // Update local state immediately
    const updatedStudent = { ...student, stars: newStars };
    setStudent(updatedStudent);

    // If it's a local student, just update localStorage
    if (student.id.startsWith('local_')) {
      localStorage.setItem('studentData', JSON.stringify(updatedStudent));
      localStorage.setItem('studentStars', newStars.toString());
      return;
    }

    // Try to sync with Supabase for cloud students
    try {
      const { error } = await supabase
        .from('students')
        .update({ stars: newStars })
        .eq('id', student.id);

      if (error) {
        console.error('Error syncing stars to cloud:', error);
        // Local state already updated, continue gracefully
      }
    } catch (err) {
      console.error('Error updating stars:', err);
    }
  };

  const updateProgress = async (tableNumber: number, correct: boolean) => {
    if (!student) return;

    const existing = tableProgress.find(p => p.table_number === tableNumber);
    const now = new Date().toISOString();

    // Update local state immediately
    const updatedStudent = {
      ...student,
      total_questions: student.total_questions + 1,
      correct_answers: student.correct_answers + (correct ? 1 : 0)
    };

    // If local student, update localStorage only
    if (student.id.startsWith('local_')) {
      setStudent(updatedStudent);
      localStorage.setItem('studentData', JSON.stringify(updatedStudent));

      // Update local progress
      if (existing) {
        const newAttempts = existing.attempts + 1;
        const newCorrect = existing.correct + (correct ? 1 : 0);
        const newMastery = Math.round((newCorrect / newAttempts) * 100);
        setTableProgress(prev => prev.map(p =>
          p.table_number === tableNumber
            ? { ...p, attempts: newAttempts, correct: newCorrect, mastery: newMastery, last_practiced: now }
            : p
        ));
      } else {
        const newProgress: TableProgress = {
          id: `local_${Date.now()}`,
          student_id: student.id,
          table_number: tableNumber,
          attempts: 1,
          correct: correct ? 1 : 0,
          mastery: correct ? 100 : 0,
          last_practiced: now
        };
        setTableProgress(prev => [...prev, newProgress]);
      }
      return;
    }

    // Cloud student - sync with Supabase
    try {
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

      // Update total questions in cloud
      const { error: studentError } = await supabase
        .from('students')
        .update({
          total_questions: student.total_questions + 1,
          correct_answers: student.correct_answers + (correct ? 1 : 0)
        })
        .eq('id', student.id);

      if (!studentError) {
        setStudent(updatedStudent);
      } else {
        // Still update local state if cloud sync fails
        setStudent(updatedStudent);
      }
    } catch (err) {
      console.error('Error updating progress in cloud:', err);
      // Update local state anyway for graceful degradation
      setStudent(updatedStudent);
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
