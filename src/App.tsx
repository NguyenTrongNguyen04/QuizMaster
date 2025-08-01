import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import MajorManager from './components/MajorManager';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import Results from './components/Results';
import AdminSetup from './components/AdminSetup';
import LoginModal from './components/LoginModal';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { usePublicContent } from './hooks/usePublicContent';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { FlashcardProgress, QuizResult } from './types';

// Main App Component with Navigation
const MainAppWithNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use the centralized auth hook
  const { user, userRole, canWrite, isLoading: authLoading, error: authError, signOut } = useAuth();
  
  // Use user data hook
  const { 
    userProfile, 
    loading: userDataLoading, 
    error: userDataError, 
    updateProgress, 
    getUserStats 
  } = useUserData(user);
  
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
    majors: publicMajors,
    subjects: publicSubjects,
    isLoading: subjectsLoading,
    refreshData: refreshPublicData
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

  // Update user progress when quiz results change
  useEffect(() => {
    if (user && quizResults.length > 0) {
      const totalQuestions = quizResults.reduce((total, result) => total + result.totalQuestions, 0);
      const correctAnswers = quizResults.reduce((total, result) => {
        // Tính correct answers từ score và totalQuestions
        const correctCount = Math.round((result.score / 100) * result.totalQuestions);
        return total + correctCount;
      }, 0);
      
      updateProgress({
        totalQuestions,
        correctAnswers,
        studyTime: userProfile?.progress?.studyTime || 0
      });
    }
  }, [quizResults, user, updateProgress, userProfile]);

  // Memoized calculations
  const totalQuestions = useMemo(() => {
    return (publicSubjects || []).reduce((total: number, subject: any) => {
      return total + (subject.exams || []).reduce((examTotal: number, exam: any) => {
        return examTotal + (exam.questions || []).length;
      }, 0);
    }, 0);
  }, [publicSubjects]);

  const totalSubjects = useMemo(() => {
    return publicSubjects?.length || 0;
  }, [publicSubjects]);

  const totalExams = useMemo(() => {
    return (publicSubjects || []).reduce((total: number, subject: any) => {
      return total + (subject.exams || []).length;
    }, 0);
  }, [publicSubjects]);

  // Handle flashcard progress changes
  const handleFlashcardProgressChange = useCallback((progress: FlashcardProgress[]) => {
    setFlashcardProgress(progress);
  }, []);

  // Handle quiz completion
  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResults(prev => [...prev, result]);
  }, []);

  // Get current page from location using useMemo
  const currentPage = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/learn') return 'flashcard';
    if (path === '/quiz') return 'quiz';
    if (path === '/results') return 'results';
    if (path === '/manage') return 'manage';
    return 'home';
  }, [location.pathname]);

  // Handle page change
  const handlePageChange = (page: string) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'flashcard':
        navigate('/learn');
        break;
      case 'quiz':
        navigate('/quiz');
        break;
      case 'results':
        navigate('/results');
        break;
      case 'manage':
        navigate('/manage');
        break;
      default:
        navigate('/');
    }
  };

  // Loading states
  if (authLoading || subjectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Auth error handling
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi xác thực</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
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
        <Routes>
          {/* Home Route */}
          <Route path="/" element={
            (() => {
              return (
                <Home 
                  totalQuestions={totalQuestions} 
                  totalSubjects={totalSubjects} 
                  totalExams={totalExams} 
                  userRole={userRole}
                  userProfile={userProfile}
                  userStats={getUserStats()}
                  userDataLoading={userDataLoading}
                />
              );
            })()
          } />
          
          {/* Learn Routes */}
          <Route path="/learn" element={
            <Flashcard 
              subjects={publicSubjects || []}
              flashcardProgress={flashcardProgress}
              onProgressChange={handleFlashcardProgressChange}
            />
          } />
          <Route path="/learn/:majorId" element={
            <Flashcard 
              subjects={publicSubjects || []}
              flashcardProgress={flashcardProgress}
              onProgressChange={handleFlashcardProgressChange}
            />
          } />
          <Route path="/learn/:majorId/:subjectId" element={
            <Flashcard 
              subjects={publicSubjects || []}
              flashcardProgress={flashcardProgress}
              onProgressChange={handleFlashcardProgressChange}
            />
          } />
          <Route path="/learn/:majorId/:subjectId/:examId" element={
            <Flashcard 
              subjects={publicSubjects || []}
              flashcardProgress={flashcardProgress}
              onProgressChange={handleFlashcardProgressChange}
            />
          } />
          
          {/* Quiz Routes */}
          <Route path="/quiz" element={
            <Quiz 
              subjects={publicSubjects || []}
              onQuizComplete={handleQuizComplete}
            />
          } />
          <Route path="/quiz/:majorId" element={
            <Quiz 
              subjects={publicSubjects || []}
              onQuizComplete={handleQuizComplete}
            />
          } />
          <Route path="/quiz/:majorId/:subjectId" element={
            <Quiz 
              subjects={publicSubjects || []}
              onQuizComplete={handleQuizComplete}
            />
          } />
          <Route path="/quiz/:majorId/:subjectId/:examId" element={
            <Quiz 
              subjects={publicSubjects || []}
              onQuizComplete={handleQuizComplete}
            />
          } />
          
          {/* Results Route */}
          <Route path="/results" element={
            (() => {
              return (
                <Results 
                  results={quizResults}
                  subjects={publicSubjects || []}
                />
              );
            })()
          } />
          
          {/* Manage Route - Admin Only */}
          <Route path="/manage" element={
            userRole === 'admin' ? (
              <MajorManager userRole={userRole} />
            ) : (
              <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Access denied. Admin privileges required.</p>
                </div>
              </div>
            )
          } />
        </Routes>
      </main>
      
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

// Admin Login Page Component
const AdminLoginPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  
  return (
    <LoginModal 
      isOpen={isLoginModalOpen} 
      onClose={() => setIsLoginModalOpen(false)} 
    />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Route */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Admin Login Route */}
        <Route path="/admin" element={<AdminLoginPage />} />
        
        {/* Main App Routes */}
        <Route path="/*" element={<MainAppWithNav />} />
      </Routes>
    </Router>
  );
}

export default App;