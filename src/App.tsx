import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import QuestionManager from './components/QuestionManager';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import Results from './components/Results';
import SyncStatus from './components/SyncStatus';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { Subject, FlashcardProgress, QuizResult } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [flashcardProgress, setFlashcardProgress] = useLocalStorage<FlashcardProgress[]>('flashcard-progress', []);
  const [quizResults, setQuizResults] = useLocalStorage<QuizResult[]>('quiz-results', []);

  // Firebase sync hook
  const {
    user,
    isConnected,
    isSyncing,
    lastSyncTime,
    syncToCloud,
    syncFromCloud,
    signIn,
    signOut
  } = useFirebaseSync(
    subjects,
    flashcardProgress,
    quizResults,
    (data) => {
      setSubjects(data.subjects);
      setFlashcardProgress(data.flashcardProgress);
      setQuizResults(data.quizResults);
    }
  );

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

  // Auto sync to cloud when data changes
  useEffect(() => {
    if (isConnected && user) {
      const syncData = {
        subjects,
        flashcardProgress,
        quizResults
      };
      
      // Debounce sync to avoid too many requests
      const timeoutId = setTimeout(() => {
        syncToCloud(syncData);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [subjects, flashcardProgress, quizResults, isConnected, user, syncToCloud]);

  // Manual sync functions
  const handleSyncToCloud = async () => {
    const success = await syncToCloud({
      subjects,
      flashcardProgress,
      quizResults
    });
    
    if (success) {
      alert('Đồng bộ lên cloud thành công!');
    } else {
      alert('Lỗi khi đồng bộ lên cloud!');
    }
  };

  const handleSyncFromCloud = async () => {
    const success = await syncFromCloud();
    
    if (success) {
      alert('Tải dữ liệu từ cloud thành công!');
    } else {
      alert('Lỗi khi tải dữ liệu từ cloud!');
    }
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
      case 'sync':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <SyncStatus
              isConnected={isConnected}
              isSyncing={isSyncing}
              lastSyncTime={lastSyncTime}
              onSignIn={signIn}
              onSignOut={signOut}
              onSyncToCloud={handleSyncToCloud}
              onSyncFromCloud={handleSyncFromCloud}
              user={user}
            />
          </div>
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