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

  if (isSelecting) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Chọn môn học và đề thi</h2>
            <p className="text-gray-600 mt-2">Chọn môn học và đề thi để bắt đầu học flashcard</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chọn môn học */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Môn học
                </h3>
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                        selectedSubjectId === subject.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSubjectClick(subject.id)}
                    >
                      <div className="font-medium text-gray-900">{subject.name}</div>
                      <div className="text-sm text-gray-500">{subject.code}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {subject.exams.length} đề thi
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chọn đề thi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Đề thi
                </h3>
                {selectedSubjectId ? (
                  <div className="space-y-2">
                    {selectedSubject!.exams.map((exam) => (
                      <div
                        key={exam.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                          selectedExamId === exam.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleExamClick(exam.id)}
                      >
                        <div className="font-medium text-gray-900">{exam.name}</div>
                        <div className="text-sm text-gray-500">{exam.code}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {(exam.questions || []).length} câu hỏi
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Vui lòng chọn môn học trước
                  </div>
                )}
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Flashcard</h2>
              <p className="text-gray-600 mt-1">
                {selectedSubject?.name} - {selectedExam?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToSelection}
                className="text-gray-600 hover:text-gray-900"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                onClick={shuffleQuestions}
                className="text-gray-600 hover:text-gray-900"
                title="Xáo trộn câu hỏi"
              >
                <Shuffle className="h-5 w-5" />
              </button>
            </div>
            </div>
          </div>
          
        {/* Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{currentIndex + 1}/{totalQuestions}</div>
              <div className="text-xs text-gray-500">Câu hỏi</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{reviewedQuestions}</div>
              <div className="text-xs text-gray-500">Đã học</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{knownQuestions}</div>
              <div className="text-xs text-gray-500">Đã biết</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">{bookmarkedQuestions}</div>
              <div className="text-xs text-gray-500">Đánh dấu</div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative w-full max-w-2xl">
              {/* Navigation buttons */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === totalQuestions - 1}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Card */}
              <div 
                className={`flashcard-3d w-full h-80 cursor-pointer transition-transform duration-300 ${
                  slideDirection === 'left' ? 'animate-slide-left' : 
                  slideDirection === 'right' ? 'animate-slide-right' : ''
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`flashcard-inner w-full h-full transition-transform duration-500 ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}>
                  {/* Front face */}
                  <div className="flashcard-face front rounded-xl shadow-lg bg-white text-gray-900 flex items-center justify-center p-8 relative border-2 border-gray-200">
                    {/* Bookmark button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark();
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    >
                      {currentProgress?.bookmarked ? (
                        <BookmarkCheck className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                <div className="text-center">
                      <h3 className="text-xl font-medium mb-4 text-gray-900">Câu hỏi:</h3>
                      <div className="text-lg leading-relaxed mb-4 whitespace-pre-wrap text-left text-gray-800">
                        {currentQuestion.question}
                      </div>
                      <div className="space-y-2 mb-2">
                        {currentQuestion.options.map((option, idx) => (
                          <div key={idx} className="text-base text-left text-gray-700">
                            <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {option}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-4">Nhấn để xem đáp án</p>
                </div>
              </div>

                  {/* Back face */}
                  <div className="flashcard-face back rounded-xl shadow-lg bg-white text-gray-900 flex items-center justify-center p-8 relative border-2 border-gray-200">
                <div className="text-center">
                      <h3 className="text-xl font-medium mb-4 text-gray-900">Đáp án:</h3>
                      <div className="text-lg font-semibold text-green-600 mb-4">
                    {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                      </div>
                      <div className="space-y-2 mb-6">
                        {currentQuestion.options.map((option, idx) => (
                          <div 
                            key={idx} 
                            className={`text-base text-left p-2 rounded ${
                              idx === currentQuestion.correctAnswer 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {option}
                            {idx === currentQuestion.correctAnswer && (
                              <span className="ml-2 text-sm font-medium">✓ Đúng</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Nhấn để xem câu hỏi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isFlipped && (
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => handleKnownStatus(false)}
                className="flex items-center space-x-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <XCircle className="h-5 w-5" />
                <span>Chưa biết</span>
              </button>
              <button
                onClick={() => handleKnownStatus(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Đã biết</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;