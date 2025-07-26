import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import QuestionManager from './components/QuestionManager';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Question, FlashcardProgress, QuizResult } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [questions, setQuestions] = useLocalStorage<Question[]>('questions', []);
  const [flashcardProgress, setFlashcardProgress] = useLocalStorage<FlashcardProgress[]>('flashcard-progress', []);
  const [quizResults, setQuizResults] = useLocalStorage<QuizResult[]>('quiz-results', []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleQuestionsChange = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            onNavigate={handlePageChange}
            questionsCount={questions.length}
            resultsCount={quizResults.length}
          />
        );
      case 'manage':
        return (
          <QuestionManager 
            questions={questions} 
            onQuestionsChange={handleQuestionsChange}
          />
        );
      case 'flashcard':
        return (
          <Flashcard 
            questions={questions}
            progress={flashcardProgress}
            onProgressChange={handleProgressChange}
          />
        );
      case 'quiz':
        return (
          <Quiz 
            questions={questions}
            onResultSave={handleResultSave}
          />
        );
      case 'results':
        return (
          <Results 
            results={quizResults}
            onResultsChange={handleResultsChange}
          />
        );
      default:
        return (
          <Home 
            onNavigate={handlePageChange}
            questionsCount={questions.length}
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