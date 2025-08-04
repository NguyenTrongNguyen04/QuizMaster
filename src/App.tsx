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
import UpgradePage from './components/UpgradePage';
import Toast from './components/Toast';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { usePublicContent } from './hooks/usePublicContent';
import { useAuth } from './hooks/useAuth';
import { useUserData } from './hooks/useUserData';
import { FlashcardProgress, QuizResult } from './types';
import PaymentCallback from './components/PaymentCallback';

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
  
  // Page transition state
  const [currentPage, setCurrentPage] = useState('home');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  
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
    refreshData: refreshPublicData,
    majorCodeToIdMap
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

  // Calculate totals for Home page
  const totalQuestions = useMemo(() => {
    if (!publicSubjects) return 0;
    return publicSubjects.reduce((total, subject) => {
      return total + subject.exams.reduce((examTotal, exam) => {
        return examTotal + (exam.questions?.length || 0);
      }, 0);
    }, 0);
  }, [publicSubjects]);

  const totalSubjects = useMemo(() => {
    return publicSubjects?.length || 0;
  }, [publicSubjects]);

  const totalExams = useMemo(() => {
    if (!publicSubjects) return 0;
    return publicSubjects.reduce((total, subject) => {
      return total + subject.exams.length;
    }, 0);
  }, [publicSubjects]);

  // Handle flashcard progress changes
  const handleFlashcardProgressChange = useCallback((newProgress: FlashcardProgress[]) => {
    setFlashcardProgress(newProgress);
  }, []);

  // Handle quiz completion
  const handleQuizComplete = useCallback((result: QuizResult) => {
    setQuizResults(prev => [result, ...prev]);
  }, []);

  // Enhanced page change handler with animations
  const handlePageChange = (page: string) => {
    if (page === currentPage) return;
    
    setIsPageTransitioning(true);
    
    // Navigate to the correct route
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
    
    // Update current page after navigation
    setTimeout(() => {
      setCurrentPage(page);
      setIsPageTransitioning(false);
    }, 300);
  };

  // Sync current page with location
  useEffect(() => {
    const path = location.pathname;
    let page = 'home';
    
    if (path === '/') page = 'home';
    else if (path.startsWith('/learn')) page = 'flashcard';
    else if (path.startsWith('/quiz')) page = 'quiz';
    else if (path === '/results') page = 'results';
    else if (path === '/manage') page = 'manage';
    
    setCurrentPage(page);
  }, [location.pathname]);

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
      <main className={`py-6 transition-all duration-500 ${isPageTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <Routes>
          {/* Home Route */}
          <Route path="/" element={
            <div className={`transition-all duration-700 ${currentPage === 'home' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Home 
                totalQuestions={totalQuestions} 
                totalSubjects={totalSubjects} 
                totalExams={totalExams} 
                userRole={userRole}
                userProfile={userProfile}
                userStats={getUserStats()}
                userDataLoading={userDataLoading}
              />
            </div>
          } />
          
          {/* Learn Routes */}
          <Route path="/learn" element={
            <div className={`transition-all duration-700 ${currentPage === 'flashcard' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Flashcard 
                subjects={publicSubjects || []}
                flashcardProgress={flashcardProgress}
                onProgressChange={handleFlashcardProgressChange}
                onRefreshData={refreshPublicData}
                majorCodeToIdMap={majorCodeToIdMap}
                user={user}
              />
            </div>
          } />
          <Route path="/learn/:majorId" element={
            <div className={`transition-all duration-700 ${currentPage === 'flashcard' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Flashcard 
                subjects={publicSubjects || []}
                flashcardProgress={flashcardProgress}
                onProgressChange={handleFlashcardProgressChange}
                onRefreshData={refreshPublicData}
                majorCodeToIdMap={majorCodeToIdMap}
                user={user}
              />
            </div>
          } />
          <Route path="/learn/:majorId/:subjectId" element={
            <div className={`transition-all duration-700 ${currentPage === 'flashcard' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Flashcard 
                subjects={publicSubjects || []}
                flashcardProgress={flashcardProgress}
                onProgressChange={handleFlashcardProgressChange}
                onRefreshData={refreshPublicData}
                majorCodeToIdMap={majorCodeToIdMap}
                user={user}
              />
            </div>
          } />
          <Route path="/learn/:majorId/:subjectId/:examId" element={
            <div className={`transition-all duration-700 ${currentPage === 'flashcard' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Flashcard 
                subjects={publicSubjects || []}
                flashcardProgress={flashcardProgress}
                onProgressChange={handleFlashcardProgressChange}
                onRefreshData={refreshPublicData}
                majorCodeToIdMap={majorCodeToIdMap}
                user={user}
              />
            </div>
          } />
          
          {/* Quiz Routes */}
          <Route path="/quiz" element={
            <div className={`transition-all duration-700 ${currentPage === 'quiz' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Quiz 
                subjects={publicSubjects || []}
                onQuizComplete={handleQuizComplete}
                user={user}
              />
            </div>
          } />
          <Route path="/quiz/:majorId" element={
            <div className={`transition-all duration-700 ${currentPage === 'quiz' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Quiz 
                subjects={publicSubjects || []}
                onQuizComplete={handleQuizComplete}
                user={user}
              />
            </div>
          } />
          <Route path="/quiz/:majorId/:subjectId" element={
            <div className={`transition-all duration-700 ${currentPage === 'quiz' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Quiz 
                subjects={publicSubjects || []}
                onQuizComplete={handleQuizComplete}
                user={user}
              />
            </div>
          } />
          <Route path="/quiz/:majorId/:subjectId/:examId" element={
            <div className={`transition-all duration-700 ${currentPage === 'quiz' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Quiz 
                subjects={publicSubjects || []}
                onQuizComplete={handleQuizComplete}
                user={user}
              />
            </div>
          } />
          
          {/* Results Route */}
          <Route path="/results" element={
            <div className={`transition-all duration-700 ${currentPage === 'results' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Results 
                results={quizResults}
                subjects={publicSubjects || []}
              />
            </div>
          } />
          
          {/* Manage Route - Admin Only */}
          <Route path="/manage" element={
            <div className={`transition-all duration-700 ${currentPage === 'manage' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {userRole === 'admin' ? (
                <MajorManager 
                  userRole={userRole}
                  user={user}
                />
              ) : (
                <Navigate to="/" replace />
              )}
            </div>
          } />
          
          {/* Upgrade Route */}
          <Route path="/upgrade" element={
            <div className="transition-all duration-700 opacity-100 translate-y-0">
              <UpgradePage />
            </div>
          } />
          
          {/* Auth Route */}
          <Route path="/auth" element={
            <div className="transition-all duration-700 opacity-100 translate-y-0">
              <AuthPage />
            </div>
          } />

          {/* Payment Callback Route */}
          <Route path="/payment/callback" element={
            <div className="transition-all duration-700 opacity-100 translate-y-0">
              <PaymentCallback />
            </div>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Toast Component */}
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
        
        {/* Upgrade Route */}
        <Route path="/upgrade" element={<UpgradePage />} />
        
        {/* Main App Routes */}
        <Route path="/*" element={<MainAppWithNav />} />
      </Routes>
    </Router>
  );
}

export default App;