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
  examType: 'PE' | 'FE'; // Practice Exam or Final Exam
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  examId: string;      // Liên kết với đề
  category?: string;    // Danh mục câu hỏi (tùy chọn)
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
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  majorId: string;
  majorName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  answers: number[];
}

export interface QuizQuestion extends Question {
  userAnswer?: number;
  isCorrect?: boolean;
}