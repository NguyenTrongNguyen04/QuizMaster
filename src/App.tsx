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
  const [lastLocalUpdate, setLastLocalUpdate] = useState<Date>(new Date());

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
      console.log('Data update from Firebase:', data);
      setSubjects(data.subjects);
      setFlashcardProgress(data.flashcardProgress);
      setQuizResults(data.quizResults);
    }
  );

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleSubjectsChange = (newSubjects: Subject[]) => {
    console.log('Subjects changed, will sync to cloud');
    setSubjects(newSubjects);
    setLastLocalUpdate(new Date());
  };

  const handleProgressChange = (newProgress: FlashcardProgress[]) => {
    console.log('Progress changed, will sync to cloud');
    setFlashcardProgress(newProgress);
    setLastLocalUpdate(new Date());
  };

  const handleResultSave = (result: QuizResult) => {
    console.log('New result saved, will sync to cloud');
    setQuizResults(prev => [result, ...prev]);
    setLastLocalUpdate(new Date());
  };

  const handleResultsChange = (newResults: QuizResult[]) => {
    console.log('Results changed, will sync to cloud');
    setQuizResults(newResults);
    setLastLocalUpdate(new Date());
  };

  // Auto sync to cloud when data changes (with debounce)
  useEffect(() => {
    if (isConnected && user && !isSyncing) {
      console.log('Auto sync triggered - lastLocalUpdate:', lastLocalUpdate);
      
      const timeoutId = setTimeout(() => {
        const syncData = {
          subjects,
          flashcardProgress,
          quizResults
        };
        console.log('Syncing to cloud:', syncData);
        syncToCloud(syncData);
      }, 2000); // Increased debounce to 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [lastLocalUpdate, isConnected, user, isSyncing, subjects, flashcardProgress, quizResults, syncToCloud]);

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