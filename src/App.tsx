import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import QuestionManager from './components/QuestionManager';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import Results from './components/Results';
import SyncStatus from './components/SyncStatus';
import AdminSetup from './components/AdminSetup';
import LoginModal from './components/LoginModal';
import Toast from './components/Toast';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { usePublicContent } from './hooks/usePublicContent';
import { useAuth } from './hooks/useAuth';
import { Subject, FlashcardProgress, QuizResult } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Use the centralized auth hook
  const { user, userRole, canWrite, isLoading: authLoading, error: authError, signOut } = useAuth();
  
  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });
  
  // Local state for private data
  const [flashcardProgress, setFlashcardProgress] = useState<FlashcardProgress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  
  // Firebase sync hooks - only for private data
  const onDataUpdate = useCallback((data: { flashcardProgress: FlashcardProgress[], quizResults: QuizResult[] }) => {
    setFlashcardProgress(data.flashcardProgress);
    setQuizResults(data.quizResults);
  }, []);

  const {
    isConnected,
    isSyncing,
    lastSyncTime,
    syncToCloud,
    syncFromCloud
  } = useFirebaseSync(
    flashcardProgress,
    quizResults,
    onDataUpdate
  );

  const {
    subjects: publicSubjects,
    isLoading: subjectsLoading,
    saveSubject,
    deleteSubject,
    refreshSubjects
  } = usePublicContent();

  // Show toast function
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  }, []);

  // Auto-sync private data when user changes
  useEffect(() => {
    if (user && isConnected) {
      const debounceTimer = setTimeout(() => {
        syncToCloud({
          flashcardProgress,
          quizResults
        });
      }, 1000);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [user?.uid, flashcardProgress, quizResults, isConnected, syncToCloud]);

  // Memoized calculations
  const totalQuestions = useMemo(() => {
    return (publicSubjects || []).reduce((total: number, subject: Subject) => {
      return total + (subject.exams || []).reduce((examTotal: number, exam: any) => {
        return examTotal + (exam.questions || []).length;
      }, 0);
    }, 0);
  }, [publicSubjects]);

  const totalSubjects = useMemo(() => {
    return publicSubjects?.length || 0;
  }, [publicSubjects]);

  const totalExams = useMemo(() => {
    return publicSubjects?.reduce((total: number, subject: Subject) => 
      total + (subject.exams || []).length, 0) || 0;
  }, [publicSubjects]);

  const handleSubjectsChange = useCallback((subjects: Subject[]) => {
    if (canWrite) {
      // Only admin can save subjects
      subjects.forEach(subject => saveSubject(subject));
    }
  }, [canWrite, saveSubject]);

  const handleFlashcardProgressChange = useCallback((progress: FlashcardProgress[]) => {
    setFlashcardProgress(progress);
  }, []);

  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResults(prev => [result, ...prev]);
  }, []);

  const handleSyncToCloud = useCallback(() => {
    syncToCloud({
      flashcardProgress,
      quizResults
    });
  }, [syncToCloud, flashcardProgress, quizResults]);

  const renderCurrentPage = () => {
    // Only show loading if auth is still initializing
    if (authLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      );
    }

    // Show auth error if any
    if (authError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 mb-4">Lỗi xác thực: {authError}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    // If not loading and no error, render the page normally
    // Even if user is null (anonymous), we should show the content
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            totalQuestions={totalQuestions}
            totalSubjects={totalSubjects}
            totalExams={totalExams}
            userRole={userRole}
          />
        );
      case 'manage':
        return (
          <div className="space-y-6">
            <QuestionManager 
              subjects={publicSubjects || []}
              onSubjectsChange={handleSubjectsChange}
              isLoading={subjectsLoading}
              userRole={userRole}
              canWrite={canWrite}
              refreshSubjects={refreshSubjects}
            />
            <AdminSetup />
          </div>
        );
      case 'flashcard':
        return (
          <Flashcard 
            subjects={publicSubjects || []}
            flashcardProgress={flashcardProgress}
            onProgressChange={handleFlashcardProgressChange}
          />
        );
      case 'quiz':
        return (
          <Quiz 
            subjects={publicSubjects || []}
            onQuizComplete={handleQuizComplete}
          />
        );
      case 'results':
        return (
          <Results 
            results={quizResults}
            subjects={publicSubjects || []}
          />
        );
      case 'sync':
        return (
          <SyncStatus
            isConnected={isConnected}
            lastSyncTime={lastSyncTime}
            onSyncToCloud={handleSyncToCloud}
            onSyncFromCloud={syncFromCloud}
            user={user}
            userRole={userRole}
          />
        );
      default:
        return (
          <Home 
            totalQuestions={totalQuestions} 
            totalSubjects={totalSubjects} 
            totalExams={totalExams} 
            userRole={userRole} 
          />
        );
    }
  };

  // Admin Login Page Component
  const AdminLoginPage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Đăng nhập để quản lý nội dung</p>
        </div>
        <LoginModal isOpen={true} onClose={() => {}} />
      </div>
    </div>
  );

  // Main App Component
  const MainApp = () => (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        user={user}
        userRole={userRole}
        onSignOut={async () => {
          try {
            await signOut();
            showToast('Đăng xuất thành công!');
          } catch (error) {
            console.error('[App] Error signing out:', error);
            showToast('Đăng xuất thất bại!', 'error');
          }
        }}
        showToast={showToast}
      />
      <main className="py-6">
        {renderCurrentPage()}
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Admin Login Route */}
        <Route path="/admin" element={<AdminLoginPage />} />
        
        {/* Main App Routes */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </Router>
  );
}

export default App;