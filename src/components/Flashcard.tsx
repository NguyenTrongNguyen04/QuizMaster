import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Shuffle, BookOpen, FileText, Bookmark, BookmarkCheck } from 'lucide-react';
import { Subject, Question, FlashcardProgress } from '../types';

interface FlashcardProps {
  subjects: Subject[];
  flashcardProgress: FlashcardProgress[];
  onProgressChange: (progress: FlashcardProgress[]) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ subjects, flashcardProgress, onProgressChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Track selection state to prevent unnecessary resets
  const selectionRef = useRef({
    subjectId: selectedSubjectId,
    examId: selectedExamId,
    isSelecting: isSelecting
  });

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedExam = selectedSubject?.exams.find(e => e.id === selectedExamId);

  // Update ref when selection changes
  useEffect(() => {
    selectionRef.current = {
      subjectId: selectedSubjectId,
      examId: selectedExamId,
      isSelecting: isSelecting
    };
  }, [selectedSubjectId, selectedExamId, isSelecting]);

  useEffect(() => {
    if (selectedExam) {
      setShuffledQuestions([...selectedExam.questions]);
      setIsSelecting(false);
    }
  }, [selectedExam]);

  // Preserve selection if still valid when subjects change
  useEffect(() => {
    // Nếu đang loading subjects hoặc subjects tạm thời rỗng, không reset selection
    if (!subjects || subjects.length === 0) {
      return;
    }
    
    // Debounce để tránh reset quá nhanh
    const timeoutId = setTimeout(() => {
      // Chỉ reset nếu đã có selection trước đó và subject đó không còn tồn tại
      if (selectedSubjectId) {
        const subject = subjects.find(s => s.id === selectedSubjectId);
        
        if (!subject) {
          // Subject đã chọn không còn tồn tại, reset selection
          setSelectedSubjectId(null);
          setSelectedExamId(null);
          setIsSelecting(true);
          return;
        }
        
        // Nếu đã chọn exam và exam đó không còn tồn tại
        if (selectedExamId) {
          const exam = subject.exams.find(e => e.id === selectedExamId);
          
          if (!exam) {
            setSelectedExamId(null);
            setIsSelecting(true);
          }
        }
      }
    }, 100); // Debounce 100ms

    return () => {
      clearTimeout(timeoutId);
    };
  }, [subjects, selectedSubjectId, selectedExamId]);

  // Stabilize selection state - không reset nếu subjects chỉ thay đổi reference
  useEffect(() => {
    if (subjects && subjects.length > 0 && selectedSubjectId) {
      const subject = subjects.find(s => s.id === selectedSubjectId);
      if (subject && selectedExamId) {
        const exam = subject.exams.find(e => e.id === selectedExamId);
        if (exam) {
          // Selection vẫn hợp lệ, không cần reset
          return;
        }
      }
    }
  }, [subjects, selectedSubjectId, selectedExamId]);

  const shuffleQuestions = () => {
    if (!selectedExam) return;
    const shuffled = [...selectedExam.questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentQuestion = shuffledQuestions[currentIndex];
  const currentProgress = flashcardProgress.find(p => p.questionId === currentQuestion?.id);

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
    if (!currentQuestion) return;

    const newProgress = flashcardProgress.filter(p => p.questionId !== currentQuestion.id);
    newProgress.push({
      questionId: currentQuestion.id,
      known,
      reviewCount: (currentProgress?.reviewCount || 0) + 1,
      lastReviewed: new Date(),
    });
    
    onProgressChange(newProgress);
    
    // Auto advance to next card
    setTimeout(() => {
      if (currentIndex < shuffledQuestions.length - 1) {
        handleNext();
      }
    }, 500);
  };

  const toggleBookmark = () => {
    if (!currentQuestion) return;

    const newProgress = flashcardProgress.filter(p => p.questionId !== currentQuestion.id);
    const isBookmarked = currentProgress?.bookmarked || false;
    
    newProgress.push({
      questionId: currentQuestion.id,
      known: currentProgress?.known || false,
      reviewCount: currentProgress?.reviewCount || 0,
      lastReviewed: currentProgress?.lastReviewed || new Date(),
      bookmarked: !isBookmarked,
    });
    
    onProgressChange(newProgress);
  };

  const resetProgress = () => {
      onProgressChange([]);
  };

  const handleBackToSelection = () => {
    setIsSelecting(true);
    setSelectedSubjectId(null);
    setSelectedExamId(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSubjectClick = (subjectId: string) => {
    // Stabilize selection - không reset nếu chỉ thay đổi reference
    if (selectionRef.current.subjectId !== subjectId) {
      setSelectedSubjectId(subjectId);
      setSelectedExamId(null); // Reset exam khi chọn subject mới
    }
  };

  const handleExamClick = (examId: string) => {
    // Stabilize selection - không reset nếu chỉ thay đổi reference
    if (selectionRef.current.examId !== examId) {
      setSelectedExamId(examId);
    }
  };

  // Calculate stats
  const totalQuestions = shuffledQuestions.length;
  const reviewedQuestions = flashcardProgress.length;
  const knownQuestions = flashcardProgress.filter(p => p.known).length;
  const bookmarkedQuestions = flashcardProgress.filter(p => p.bookmarked).length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isSelecting) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case 'k':
        case 'K':
          event.preventDefault();
          if (isFlipped) {
            handleKnownStatus(true);
          }
          break;
        case 'n':
        case 'N':
          event.preventDefault();
          if (isFlipped) {
            handleKnownStatus(false);
          }
          break;
        case 'b':
        case 'B':
          event.preventDefault();
          toggleBookmark();
          break;
        case 's':
        case 'S':
          event.preventDefault();
          shuffleQuestions();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSelecting, isFlipped, currentIndex, shuffledQuestions.length]);

  // Auto-advance timer
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFlipped && currentIndex < shuffledQuestions.length - 1) {
      const timer = setTimeout(() => {
        handleNext();
      }, 10000); // Auto-advance after 10 seconds
      
      setAutoAdvanceTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isFlipped, currentIndex]);

  // Clear timer when manually navigating
  useEffect(() => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
  }, [currentIndex, isFlipped]);

  if (isSelecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chọn môn học và đề thi
              </h2>
              <p className="text-gray-600 mt-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Chọn môn học và đề thi để bắt đầu học flashcard
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chọn môn học */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    Môn học
                  </h3>
                  <div className="space-y-3">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover-lift ${
                          selectedSubjectId === subject.id
                            ? 'border-blue-500 bg-blue-50/80 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 bg-white/60 hover:bg-white/80'
                        }`}
                        onClick={() => handleSubjectClick(subject.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{subject.name}</div>
                            <div className="text-sm text-gray-500">{subject.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">{subject.exams.length} đề thi</div>
                            {selectedSubjectId === subject.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chọn đề thi */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    Đề thi
                  </h3>
                  {selectedSubjectId ? (
                    <div className="space-y-3">
                      {selectedSubject!.exams.map((exam) => (
                        <div
                          key={exam.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover-lift ${
                            selectedExamId === exam.id
                              ? 'border-green-500 bg-green-50/80 shadow-lg'
                              : 'border-gray-200 hover:border-green-300 bg-white/60 hover:bg-white/80'
                          }`}
                          onClick={() => handleExamClick(exam.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-gray-900">{exam.name}</div>
                              <div className="text-sm text-gray-500">{exam.code}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400">{(exam.questions || []).length} câu hỏi</div>
                              {selectedExamId === exam.id && (
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-300">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="font-medium">Vui lòng chọn môn học trước</p>
                    </div>
                  )}
                </div>
              </div>
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
          <div className="p-8">
            <div className="flex items-center justify-center min-h-[450px]">
              <div className="relative w-full max-w-3xl">
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
                  className={`flashcard-3d w-full h-96 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    slideDirection === 'left' ? 'animate-slide-left' : 
                    slideDirection === 'right' ? 'animate-slide-right' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
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
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                          <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold">?</span>
                          </span>
                          Câu hỏi
                        </h3>
                        
                        {/* Scrollable question content */}
                        <div className="flex-1 overflow-y-auto pr-3 flashcard-scrollable">
                          <div className="text-lg leading-relaxed mb-6 whitespace-pre-wrap text-left text-gray-800">
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
                              <div key={idx} className="text-base text-left text-gray-700 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <span className="font-bold text-blue-600 mr-3">{String.fromCharCode(65 + idx)}.</span> 
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Bottom instruction */}
                        <div className="mt-auto pt-6 border-t border-gray-200">
                          <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">Nhấn để xem đáp án</p>
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
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                          <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 font-bold">✓</span>
                          </span>
                          Đáp án
                        </h3>
                        
                        {/* Scrollable answer content */}
                        <div className="flex-1 overflow-y-auto pr-3 flashcard-scrollable">
                          <div className="text-xl font-bold text-green-700 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
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
                              >
                                <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span> 
                                {option}
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
                            <p className="text-sm text-gray-500 font-medium">Nhấn để xem câu hỏi</p>
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
                <button
                  onClick={() => handleKnownStatus(false)}
                  className="flex items-center space-x-3 px-8 py-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200 shadow-sm"
                >
                  <XCircle className="h-6 w-6" />
                  <span className="font-semibold">Chưa biết</span>
                </button>
                <button
                  onClick={() => handleKnownStatus(true)}
                  className="flex items-center space-x-3 px-8 py-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200 shadow-sm"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">Đã biết</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;