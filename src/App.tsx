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
import { usePublicContent } from './hooks/usePublicContent';
import { Subject, FlashcardProgress, QuizResult } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Public content (subjects) - anyone can view
  const { subjects: publicSubjects, isLoading: subjectsLoading, saveSubject, deleteSubject } = usePublicContent();
  
  // Private user data (progress and results) - only for authenticated users
  const [flashcardProgress, setFlashcardProgress] = useLocalStorage<FlashcardProgress[]>('flashcard-progress', []);
  const [quizResults, setQuizResults] = useLocalStorage<QuizResult[]>('quiz-results', []);

  // Firebase sync hook for private user data
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
    publicSubjects, // Use public subjects instead of local
    flashcardProgress,
    quizResults,
    (data) => {
      console.log('Private data update from Firebase:', data);
      setFlashcardProgress(data.flashcardProgress);
      setQuizResults(data.quizResults);
    }
  );

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const handleSubjectsChange = async (newSubjects: Subject[]) => {
    console.log('Subjects changed, saving to public content');
    
    // Save each subject to public content
    for (const subject of newSubjects) {
      await saveSubject(subject);
    }
  };

  const handleProgressChange = (newProgress: FlashcardProgress[]) => {
    console.log('Progress changed, will sync to cloud');
    setFlashcardProgress(newProgress);
  };

  const handleResultSave = (result: QuizResult) => {
    console.log('New result saved, will sync to cloud');
    setQuizResults(prev => [result, ...prev]);
  };

  const handleResultsChange = (newResults: QuizResult[]) => {
    console.log('Results changed, will sync to cloud');
    setQuizResults(newResults);
  };

  // Auto sync private data to cloud when it changes
  useEffect(() => {
    if (isConnected && user && !isSyncing) {
      console.log('Auto sync private data triggered');
      
      const timeoutId = setTimeout(() => {
        const syncData = {
          subjects: publicSubjects, // Include public subjects in sync
          flashcardProgress,
          quizResults
        };
        console.log('Syncing private data to cloud:', syncData);
        syncToCloud(syncData);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [flashcardProgress, quizResults, isConnected, user, isSyncing, publicSubjects, syncToCloud]);

  // Manual sync functions
  const handleSyncToCloud = async () => {
    const success = await syncToCloud({
      subjects: publicSubjects,
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
  const totalQuestions = (publicSubjects || []).reduce((total, subject) => {
    return total + (subject.exams || []).reduce((examTotal, exam) => {
      return examTotal + (exam.questions || []).length;
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
            subjects={publicSubjects} 
            onSubjectsChange={handleSubjectsChange}
            isLoading={subjectsLoading}
          />
        );
      case 'flashcard':
        return (
          <Flashcard 
            subjects={publicSubjects}
            progress={flashcardProgress}
            onProgressChange={handleProgressChange}
          />
        );
      case 'quiz':
        return (
          <Quiz 
            subjects={publicSubjects}
            onResultSave={handleResultSave}
          />
        );
      case 'results':
        return (
          <Results 
            results={quizResults}
            onResultsChange={handleResultsChange}
            subjects={publicSubjects}
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