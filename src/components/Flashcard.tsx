import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Shuffle, BookOpen, FileText, Bookmark, BookmarkCheck, RefreshCcw, Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, FlashcardProgress } from '../types';
import { useUserPlan } from '../hooks/useUserPlan';

interface SubjectWithExams {
  id: string;
  majorId: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  exams: any[];
}

interface FlashcardProps {
  subjects: SubjectWithExams[];
  flashcardProgress: FlashcardProgress[];
  onProgressChange: (progress: FlashcardProgress[]) => void;
  onRefreshData?: () => void;
  majorCodeToIdMap: { [code: string]: string };
  user?: any;
}

const Flashcard: React.FC<FlashcardProps> = ({ subjects, flashcardProgress, onProgressChange, onRefreshData, majorCodeToIdMap, user }) => {
  const { majorId, subjectId, examId } = useParams();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(majorId || null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(subjectId || null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(examId || null);
  const [isSelecting, setIsSelecting] = useState(!examId);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { canAccessExamType, isPro, getQuestionLimit, needsLoginToContinue, getTotalQuestionsToDisplay } = useUserPlan({ user });

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter subjects to only show accessible exams
  const filteredSubjects = subjects.map(subject => ({
    ...subject,
    exams: subject.exams // Show all exams, access will be limited in the interface
  }));

  // Helper function to get friendly major name
  const getFriendlyMajorName = (majorId: string) => {
    const majorMap: { [key: string]: string } = {
      'IA': 'An toàn Thông tin',
      'SE': 'Kỹ thuật Phần mềm', 
      'GD': 'Thiết kế mỹ thuật số',
      'SC': 'Thiết kế vi mạch bán dẫn',
      'AI': 'Trí tuệ Nhân tạo',
      'DM': 'Digital Marketing',
      'IB': 'Kinh doanh Quốc tế',
      'LM': 'Logistic & Quản lý chuỗi cung ứng',
      'HM': 'Quản trị khách sạn',
      'MU': 'Truyền thông đa phương tiện',
      'PR': 'Quan hệ công chúng',
      'LW': 'Luật',
      'LA': 'Ngôn ngữ'
    };
    // Ensure majorId is uppercase and exists in the map
    const normalizedMajorId = majorId?.toUpperCase() || '';
    return majorMap[normalizedMajorId] || normalizedMajorId;
  };

  // Helper function to get major color
  const getMajorColor = (majorId: string) => {
    const colorMap: { [key: string]: { bg: string, border: string, text: string } } = {
      'IA': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
      'SE': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      'GD': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      'SC': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      'AI': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
      'DM': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
      'IB': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
      'LM': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      'HM': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
      'MU': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
      'PR': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
      'LW': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
      'LA': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }
    };
    const normalizedMajorId = majorId?.toUpperCase() || '';
    return colorMap[normalizedMajorId] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  };

  // Track selection state to prevent unnecessary resets
  const selectionRef = useRef({
    majorId: selectedMajorId,
    subjectId: selectedSubjectId,
    examId: selectedExamId,
    isSelecting: isSelecting
  });

  // Group subjects by major
  const subjectsByMajor = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.majorId]) {
      acc[subject.majorId] = [];
    }
    acc[subject.majorId].push(subject);
    return acc;
  }, {} as { [key: string]: SubjectWithExams[] });

  // Get selected subject and exam
  const selectedSubject = filteredSubjects.find(s => s.id === selectedSubjectId);
  const selectedExam = selectedSubject?.exams.find(e => e.id === selectedExamId);

  // Sync URL with state
  useEffect(() => {
    if (majorId && majorId !== selectedMajorId) {
      setSelectedMajorId(majorId);
    }
    if (subjectId && subjectId !== selectedSubjectId) {
      setSelectedSubjectId(subjectId);
    }
    if (examId && examId !== selectedExamId) {
      setSelectedExamId(examId);
      setIsSelecting(false);
    }
  }, [majorId, subjectId, examId]);

  // Update selection ref
  useEffect(() => {
    selectionRef.current = {
      majorId: selectedMajorId,
      subjectId: selectedSubjectId,
      examId: selectedExamId,
      isSelecting: isSelecting
    };
  }, [selectedMajorId, selectedSubjectId, selectedExamId, isSelecting]);

  // Initialize questions when exam is selected
  useEffect(() => {
    if (selectedExam && selectedExam.questions) {
      const questions = [...selectedExam.questions];
      
      // Show all questions but limit access based on user plan
      // Note: getQuestionLimit is not needed here as we always show all questions
      
      setShuffledQuestions(questions);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsSelecting(false);
    }
  }, [selectedExam]);

  // Calculate stats
  const currentQuestion = shuffledQuestions[currentIndex];
  const currentProgress = flashcardProgress.find(p => p.questionId === currentQuestion?.id);
  const totalQuestions = shuffledQuestions.length;
  const reviewedQuestions = flashcardProgress.length;
  const knownQuestions = flashcardProgress.filter(p => p.known).length;
  const bookmarkedQuestions = flashcardProgress.filter(p => p.bookmarked).length;

  const shuffleQuestions = () => {
    const shuffled = [...shuffledQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const animateCardTransition = (direction: 'left' | 'right', callback: () => void) => {
    setSlideDirection(direction);
    setIsAnimating(true);
    
    setTimeout(() => {
      callback();
      setSlideDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      animateCardTransition('left', () => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      animateCardTransition('right', () => {
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
      });
    }
  };

  const handleKnownStatus = (known: boolean) => {
    const currentQuestion = shuffledQuestions[currentIndex];
    if (!currentQuestion) return;

    const existingProgress = flashcardProgress.find(p => p.questionId === currentQuestion.id);
    const updatedProgress = existingProgress 
      ? { ...existingProgress, known, reviewCount: existingProgress.reviewCount + 1, lastReviewed: new Date() }
      : { questionId: currentQuestion.id, known, reviewCount: 1, lastReviewed: new Date() };

    const newProgress = existingProgress
      ? flashcardProgress.map(p => p.questionId === currentQuestion.id ? updatedProgress : p)
      : [...flashcardProgress, updatedProgress];

    onProgressChange(newProgress);
    
    // Check if user needs to login to continue
    if (needsLoginToContinue(currentIndex + 1)) {
      setShowLoginPrompt(true);
    }
  };

  const toggleBookmark = () => {
    const currentQuestion = shuffledQuestions[currentIndex];
    if (!currentQuestion) return;

    const existingProgress = flashcardProgress.find(p => p.questionId === currentQuestion.id);
    const updatedProgress = existingProgress 
      ? { ...existingProgress, bookmarked: !existingProgress.bookmarked }
      : { questionId: currentQuestion.id, known: false, reviewCount: 0, lastReviewed: new Date(), bookmarked: true };

    const newProgress = existingProgress
      ? flashcardProgress.map(p => p.questionId === currentQuestion.id ? updatedProgress : p)
      : [...flashcardProgress, updatedProgress];

    onProgressChange(newProgress);
  };

  const resetProgress = () => {
    onProgressChange([]);
  };

  const handleBackToSelection = () => {
    setSelectedMajorId(null);
    setSelectedSubjectId(null);
    setSelectedExamId(null);
    setIsSelecting(true);
  };

  const handleMajorClick = (majorId: string) => {
    setSelectedMajorId(majorId);
    setSelectedSubjectId(null);
    setSelectedExamId(null);
  };

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedExamId(null);
  };

  const handleExamClick = (examId: string) => {
    setSelectedExamId(examId);
  };

  // Login Prompt Component
  const renderLoginPrompt = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập để tiếp tục</h3>
            <p className="text-gray-600 mb-6">
              Bạn đã hoàn thành {user ? '10' : '5'} câu hỏi miễn phí. Đăng nhập để tiếp tục học tập không giới hạn!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-[#e77a15] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e77a15]/90 transition-colors"
              >
                Đăng nhập ngay
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full text-gray-600 py-2 px-4 hover:text-gray-800 transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Blur Overlay Component for restricted questions
  const renderBlurOverlay = () => {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl pointer-events-none">
        <div className="text-center p-8 pointer-events-auto">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập để tiếp tục</h3>
          <p className="text-gray-600 mb-6">
            Bạn đã hoàn thành {user ? '10' : '5'} câu hỏi miễn phí. Đăng nhập để tiếp tục học tập không giới hạn!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#e77a15] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#e77a15]/90 transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isSelecting) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case '1':
          handleKnownStatus(true);
          break;
        case '2':
          handleKnownStatus(false);
          break;
        case 'b':
          toggleBookmark();
          break;
        case 's':
          shuffleQuestions();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFlipped, isSelecting, shuffledQuestions, flashcardProgress]);

  const renderExamSelection = () => {
    return (
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chọn chuyên ngành để học tập
            </h2>
            <p className="text-gray-600 mt-2 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Chọn chuyên ngành để bắt đầu học tập với flashcards
            </p>
          </div>

          {/* Major Selection */}
          {!selectedMajorId ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(subjectsByMajor).map(([majorId, subjects], index) => {
                  const color = getMajorColor(majorId);
                  return (
                    <div
                      key={majorId}
                      className={`${color.bg} ${color.border} border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleMajorClick(majorId)}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center`}>
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${color.text}`}>
                            {getFriendlyMajorName(majorId)}
                          </h3>
                          <p className="text-sm text-gray-600">{subjects.length} môn học</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Môn học thuộc {getFriendlyMajorName(majorId)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Subject Selection */}
              {!selectedSubjectId ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setSelectedMajorId(null)}
                      className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Quay lại chọn chuyên ngành
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    Môn học thuộc {getFriendlyMajorName(selectedMajorId)}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectsByMajor[selectedMajorId]?.map((subject, index) => (
                      <div
                        key={subject.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleSubjectClick(subject.id)}
                      >
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{subject.name}</h4>
                        <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{subject.code}</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {subject.exams.length} đề thi
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Exam Selection */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setSelectedSubjectId(null)}
                      className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Quay lại chọn môn học
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    Môn học thuộc {getFriendlyMajorName(selectedMajorId)}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedSubject?.exams.map((exam, index) => (
                      <div
                        key={exam.id}
                        className={`bg-white border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in ${
                          selectedExamId === exam.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => handleExamClick(exam.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900">{exam.name}</h4>
                          {exam.examType === 'QUIZLET' && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                              Quizlet
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            {exam.questions?.length || 0} câu hỏi
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isSelecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-200/50">
              {!selectedMajorId ? (
                <>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Chọn chuyên ngành bạn học
                  </h2>
                  <p className="text-gray-600 mt-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    Chọn chuyên ngành để bắt đầu học flashcard
                  </p>
                </>
              ) : !selectedSubjectId ? (
                <>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Chọn môn học
                  </h2>
                  <p className="text-gray-600 mt-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    Chọn môn học thuộc chuyên ngành {getFriendlyMajorName(selectedMajorId || '')}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Chọn đề thi
                  </h2>
                  <p className="text-gray-600 mt-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    Chọn đề thi thuộc môn {selectedSubject?.name}
                  </p>
                </>
              )}
            </div>

            <div className="p-6">
              {!selectedMajorId ? (
                // Step 1: Chọn chuyên ngành
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold">🎓</span>
                    </div>
                    Chuyên ngành
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {/* All 13 majors */}
                    {[
                      'IA', 'SE', 'GD', 'SC', 'AI', 'DM', 'IB', 'LM', 'HM', 'MU', 'PR', 'LW', 'LA'
                    ].map((majorCode) => {
                      const majorId = majorCodeToIdMap[majorCode];
                      const majorSubjects = majorId ? subjectsByMajor[majorId] || [] : [];
                      const friendlyMajorName = getFriendlyMajorName(majorCode);
                      const colors = getMajorColor(majorCode);
                      const totalSubjects = majorSubjects.length;
                      const totalExams = majorSubjects.reduce((sum, subject) => sum + subject.exams.length, 0);
                      
                      return (
                        <div
                          key={majorCode}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover-lift ${
                            selectedMajorId === majorId
                              ? `${colors.bg} ${colors.border} shadow-lg`
                              : `${colors.bg} ${colors.border} hover:shadow-md`
                          }`}
                          onClick={() => handleMajorClick(majorId || majorCode)}
                        >
                          <div className="text-center">
                            <div className={`font-bold text-lg mb-2 ${colors.text}`}>{friendlyMajorName}</div>
                            <div className="text-sm text-gray-500 mb-2">({majorCode})</div>
                            <div className="text-xs text-gray-400 space-y-1">
                              <div>{totalSubjects} môn học</div>
                              <div>{totalExams} đề thi</div>
                            </div>
                            {selectedMajorId === majorId && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto mt-2 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !selectedSubjectId ? (
                // Step 2: Chọn môn học
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      Môn học thuộc {getFriendlyMajorName(selectedMajorId || '')}
                    </h3>
                    <button
                      onClick={() => navigate('/learn')}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      ← Quay lại chọn chuyên ngành
                    </button>
                  </div>
                  {subjectsByMajor[selectedMajorId]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subjectsByMajor[selectedMajorId]?.map((subject) => (
                        <div
                          key={subject.id}
                          className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover-lift ${
                            selectedSubjectId === subject.id
                              ? 'border-blue-500 bg-blue-50/80 shadow-lg'
                              : 'border-gray-200 hover:border-blue-300 bg-white/60 hover:bg-white/80'
                          }`}
                          onClick={() => handleSubjectClick(subject.id)}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">📚</div>
                            <div className="font-bold text-gray-900 text-lg mb-2">{subject.name}</div>
                            <div className="text-sm text-gray-500 mb-3">{subject.code}</div>
                            <div className="text-xs text-gray-400">{subject.exams.length} đề thi</div>
                            {selectedSubjectId === subject.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-2 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-300">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">Chưa có môn học nào</p>
                      <p className="text-sm mt-2">Vui lòng thêm môn học cho chuyên ngành này</p>
                    </div>
                  )}
                </div>
              ) : (
                // Step 3: Chọn đề thi
                renderExamSelection()
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không có câu hỏi</h2>
          <p className="text-gray-600 mb-6">Đề thi này chưa có câu hỏi nào.</p>
          <button
            onClick={handleBackToSelection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Quay lại chọn đề
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLoginPrompt && renderLoginPrompt()}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Học tập</h2>
                  <p className="text-gray-600 mt-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {selectedSubject?.name} - {selectedExam?.name}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToSelection}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Quay lại chọn đề"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={shuffleQuestions}
                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Xáo trộn câu hỏi"
                  >
                    <Shuffle className="h-5 w-5" />
                  </button>
                  {onRefreshData && (
                    <button
                      onClick={onRefreshData}
                      className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Làm mới dữ liệu"
                    >
                      <RefreshCcw className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-gray-900">{currentIndex + 1}/{totalQuestions}</div>
                  <div className="text-xs text-gray-500 font-medium">Câu hỏi</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-blue-600">{reviewedQuestions}</div>
                  <div className="text-xs text-gray-500 font-medium">Đã học</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-green-600">{knownQuestions}</div>
                  <div className="text-xs text-gray-500 font-medium">Đã biết</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-yellow-600">{bookmarkedQuestions}</div>
                  <div className="text-xs text-gray-500 font-medium">Đánh dấu</div>
                </div>
              </div>
            </div>

            {/* Flashcard */}
            <div className="p-4">
              <div className="flex items-center justify-center min-h-[600px]">
                <div className="relative w-full max-w-7xl">
                  {/* Navigation buttons */}
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === totalQuestions - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Card */}
                  <div 
                    className={`flashcard-3d w-full h-[600px] cursor-pointer transition-all duration-300 hover:scale-105 relative ${
                      slideDirection === 'left' ? 'animate-slide-left' : 
                      slideDirection === 'right' ? 'animate-slide-right' : ''
                  }`}
                  onClick={() => {
                    const questionLimit = getQuestionLimit(totalQuestions);
                    const isQuestionRestricted = currentIndex >= questionLimit;
                    if (!isQuestionRestricted) {
                      setIsFlipped(!isFlipped);
                    }
                  }}
                >
                    {(() => {
                      const questionLimit = getQuestionLimit(totalQuestions);
                      const isQuestionRestricted = currentIndex >= questionLimit;
                      return isQuestionRestricted && renderBlurOverlay();
                    })()}
                    <div className={`flashcard-inner w-full h-full transition-transform duration-500 ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}>
                      {/* Front face */}
                      <div className="flashcard-face front rounded-xl shadow-xl bg-white text-gray-900 flex flex-col p-8 relative border border-gray-200">
                        {/* Bookmark button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark();
                          }}
                          className="absolute top-6 right-6 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          {currentProgress?.bookmarked ? (
                            <BookmarkCheck className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Bookmark className="h-5 w-5 text-gray-600" />
                          )}
                        </button>

                        <div className="flex-1 flex flex-col overflow-hidden">
                          <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center" style={{ fontSize: '1.1em' }}>
                            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-bold">?</span>
                            </span>
                            Câu hỏi
                          </h3>
                          
                          {/* Scrollable question content */}
                          <div className="flex-1 overflow-y-auto pr-3 flashcard-scrollable">
                            <div className="text-base leading-relaxed mb-6 whitespace-pre-wrap text-left text-gray-800" style={{ fontSize: '1em' }}>
                              {currentQuestion.question.split('\n').map((line, index) => {
                                // Detect code blocks (lines that look like code)
                                const isCodeLine = line.trim().startsWith('<') || 
                                                 line.trim().includes('{') || 
                                                 line.trim().includes('}') ||
                                                 line.trim().includes('=') ||
                                                 line.trim().includes('>');
                                
                                return (
                                  <div 
                                    key={index} 
                                    className={`${isCodeLine ? 'bg-gray-100 p-3 rounded-lg font-mono text-sm border border-gray-200' : ''} mb-2`}
                                  >
                                    {line}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Options */}
                            <div className="space-y-3 mb-6">
                              {currentQuestion.options.map((option, idx) => (
                                <div key={idx} className="text-base text-left text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors" style={{ fontSize: '1em', width: '100%' }}>
                                  <span className="font-bold text-blue-600 mr-3">{String.fromCharCode(65 + idx)}.</span> 
                                  <span className="whitespace-pre-wrap">{option}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Bottom instruction */}
                          <div className="mt-auto pt-6 border-t border-gray-200">
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium" style={{ fontSize: '0.9em' }}>Nhấn để xem đáp án</p>
                              <div className="flex justify-center mt-2">
                                <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back face */}
                      <div className="flashcard-face back rounded-xl shadow-xl bg-white text-gray-900 flex flex-col p-8 relative border border-gray-200">
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center" style={{ fontSize: '1.1em' }}>
                            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-green-600 font-bold">✓</span>
                            </span>
                            Đáp án
                          </h3>
                          
                          {/* Scrollable answer content */}
                          <div className="flex-1 overflow-y-auto pr-3 flashcard-scrollable">
                            <div className="text-xl font-bold text-green-700 mb-6 p-4 bg-green-50 rounded-lg border border-green-200" style={{ fontSize: '1em', width: '100%' }}>
                              <span className="text-green-600 font-bold">{String.fromCharCode(65 + currentQuestion.correctAnswer)}.</span> 
                              {currentQuestion.options[currentQuestion.correctAnswer]}
                            </div>
                            
                            <div className="space-y-3 mb-6">
                              {currentQuestion.options.map((option, idx) => (
                                <div 
                                  key={idx} 
                                  className={`text-base text-left p-4 rounded-lg border ${
                                    idx === currentQuestion.correctAnswer 
                                      ? 'bg-green-50 text-green-800 border-green-300' 
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}
                                  style={{ fontSize: '1em', width: '100%' }}
                                >
                                  <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span> 
                                  <span className="whitespace-pre-wrap">{option}</span>
                                  {idx === currentQuestion.correctAnswer && (
                                    <span className="ml-3 text-sm font-bold text-green-600 bg-green-200 px-3 py-1 rounded-full">✓ Đúng</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Bottom instruction */}
                          <div className="mt-auto pt-6 border-t border-gray-200">
                            <div className="text-center">
                              <p className="text-sm text-gray-500 font-medium" style={{ fontSize: '0.9em' }}>Nhấn để xem câu hỏi</p>
                              <div className="flex justify-center mt-2">
                                <div className="w-8 h-1 bg-green-600 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {isFlipped && (
                <div className="flex justify-center space-x-6 mt-8">
                  {(() => {
                    const questionLimit = getQuestionLimit(totalQuestions);
                    const isQuestionRestricted = currentIndex >= questionLimit;
                    return (
                      <>
                        <button
                          onClick={() => !isQuestionRestricted && handleKnownStatus(false)}
                          disabled={isQuestionRestricted}
                          className={`flex items-center space-x-3 px-8 py-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 shadow-sm ${
                            isQuestionRestricted ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <XCircle className="h-6 w-6" />
                          <span className="font-semibold">Chưa biết</span>
                        </button>
                        <button
                          onClick={() => !isQuestionRestricted && handleKnownStatus(true)}
                          disabled={isQuestionRestricted}
                          className={`flex items-center space-x-3 px-8 py-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200 shadow-sm ${
                            isQuestionRestricted ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <CheckCircle className="h-6 w-6" />
                          <span className="font-semibold">Đã biết</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Flashcard;