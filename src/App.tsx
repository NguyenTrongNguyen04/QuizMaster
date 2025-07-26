import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import QuestionManager from './components/QuestionManager';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Subject, FlashcardProgress, QuizResult } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [flashcardProgress, setFlashcardProgress] = useLocalStorage<FlashcardProgress[]>('flashcard-progress', []);
  const [quizResults, setQuizResults] = useLocalStorage<QuizResult[]>('quiz-results', []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleSubjectsChange = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
  };

  const handleProgressChange = (newProgress: FlashcardProgress[]) => {
    setFlashcardProgress(newProgress);
  };

  const handleResultSave = (result: QuizResult) => {
    setQuizResults(prev => [result, ...prev]);
  };

  const handleResultsChange = (newResults: QuizResult[]) => {
    setQuizResults(newResults);
  };

  // Tính tổng số câu hỏi từ tất cả các môn học
  const totalQuestions = subjects.reduce((total, subject) => {
    return total + subject.exams.reduce((examTotal, exam) => {
      return examTotal + exam.questions.length;
    }, 0);
  }, 0);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            onNavigate={handlePageChange}
            questionsCount={totalQuestions}
            resultsCount={quizResults.length}
          />
        );
      case 'manage':
        return (
          <QuestionManager 
            subjects={subjects} 
            onSubjectsChange={handleSubjectsChange}
          />
        );
      case 'flashcard':
        return (
          <Flashcard 
            subjects={subjects}
            progress={flashcardProgress}
            onProgressChange={handleProgressChange}
          />
        );
      case 'quiz':
        return (
          <Quiz 
            subjects={subjects}
            onResultSave={handleResultSave}
          />
        );
      case 'results':
        return (
          <Results 
            results={quizResults}
            onResultsChange={handleResultsChange}
            subjects={subjects}
          />
        );
      default:
        return (
          <Home 
            onNavigate={handlePageChange}
            questionsCount={totalQuestions}
            resultsCount={quizResults.length}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;