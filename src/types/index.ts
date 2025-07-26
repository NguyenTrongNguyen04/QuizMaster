export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category?: string;
}

export interface FlashcardProgress {
  questionId: string;
  known: boolean;
  reviewCount: number;
  lastReviewed: Date;
}

export interface QuizResult {
  id: string;
  date: Date;
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