export interface Subject {
  id: string;
  code: string;        // Mã môn học
  name: string;        // Tên môn học
  exams: Exam[];
}

export interface Exam {
  id: string;
  code: string;        // Mã đề
  name: string;        // Tên đề
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  examId: string;      // Liên kết với đề
  category?: string;
}

export interface FlashcardProgress {
  questionId: string;
  known: boolean;
  reviewCount: number;
  lastReviewed: Date;
  bookmarked?: boolean;  // Đánh dấu flashcard đã đọc
}

export interface QuizResult {
  id: string;
  date: Date;
  subjectId: string;   // Môn học
  examId: string;      // Đề thi
  questions: Question[];
  userAnswers: number[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
}

export interface QuizQuestion extends Question {
  userAnswer?: number;
  isCorrect?: boolean;
}