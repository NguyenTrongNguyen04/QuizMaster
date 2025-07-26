import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Shuffle, BookOpen, FileText } from 'lucide-react';
import { Subject, Question, FlashcardProgress } from '../types';

interface FlashcardProps {
  subjects: Subject[];
  progress: FlashcardProgress[];
  onProgressChange: (progress: FlashcardProgress[]) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ subjects, progress, onProgressChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(true);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedExam = selectedSubject?.exams.find(e => e.id === selectedExamId);

  useEffect(() => {
    if (selectedExam) {
      setShuffledQuestions([...selectedExam.questions]);
      setIsSelecting(false);
    }
  }, [selectedExam]);

  const shuffleQuestions = () => {
    if (!selectedExam) return;
    const shuffled = [...selectedExam.questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentQuestion = shuffledQuestions[currentIndex];
  const currentProgress = progress.find(p => p.questionId === currentQuestion?.id);

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleKnownStatus = (known: boolean) => {
    if (!currentQuestion) return;

    const newProgress = progress.filter(p => p.questionId !== currentQuestion.id);
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

  const resetProgress = () => {
    if (confirm('Bạn có chắc chắn muốn reset tiến trình học?')) {
      onProgressChange([]);
    }
  };

  const handleBackToSelection = () => {
    setIsSelecting(true);
    setSelectedSubjectId(null);
    setSelectedExamId(null);
    setShuffledQuestions([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Tính tổng số câu hỏi từ tất cả các môn học
  const totalQuestions = subjects.reduce((total, subject) => {
    return total + subject.exams.reduce((examTotal, exam) => {
      return examTotal + exam.questions.length;
    }, 0);
  }, 0);

  if (totalQuestions === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Chưa có câu hỏi nào để học</p>
          <p className="text-gray-400 text-sm mt-2">Vui lòng thêm câu hỏi trong phần Quản lý</p>
        </div>
      </div>
    );
  }

  if (isSelecting) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Chọn môn học và đề để học</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chọn môn học */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Chọn môn học
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
                      onClick={() => setSelectedSubjectId(subject.id)}
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Chọn đề thi
                </h3>
                {selectedSubject ? (
                  <div className="space-y-2">
                    {selectedSubject.exams.map((exam) => (
                      <div
                        key={exam.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                          selectedExamId === exam.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedExamId(exam.id)}
                      >
                        <div className="font-medium text-gray-900">{exam.name}</div>
                        <div className="text-sm text-gray-500">{exam.code}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {exam.questions.length} câu hỏi
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

            {selectedExam && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSelecting(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Bắt đầu học với {selectedExam.name}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const knownCount = progress.filter(p => p.known).length;
  const unknownCount = progress.filter(p => !p.known).length;
  const progressPercentage = (progress.length / selectedExam!.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header with controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Học Flashcard</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleBackToSelection}
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Đổi đề</span>
              </button>
              <button
                onClick={shuffleQuestions}
                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Shuffle className="h-4 w-4" />
                <span>Trộn</span>
              </button>
              <button
                onClick={resetProgress}
                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
          
          {/* Subject and Exam info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{selectedSubject!.name}</span> - 
              <span className="font-medium ml-1">{selectedExam!.name}</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Câu {currentIndex + 1} / {shuffledQuestions.length}</span>
              <span>{Math.round(progressPercentage)}% hoàn thành</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentIndex / shuffledQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{knownCount} đã biết</span>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{unknownCount} chưa biết</span>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="p-6">
          <div className="relative h-96 mx-auto max-w-2xl">
            <div 
              className={`absolute inset-0 w-full h-full cursor-pointer transition-transform duration-700 transform-gpu ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front of card */}
              <div className={`absolute inset-0 w-full h-full rounded-xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center p-8 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-4">Câu hỏi:</h3>
                  <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                  <p className="text-sm opacity-75 mt-4">Nhấn để xem đáp án</p>
                </div>
              </div>

              {/* Back of card */}
              <div className={`absolute inset-0 w-full h-full rounded-xl shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center p-8 backface-hidden rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-center">
                  <h3 className="text-xl font-medium mb-4">Đáp án đúng:</h3>
                  <p className="text-lg font-medium mb-2">
                    {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-sm opacity-75">Các đáp án khác:</p>
                    {currentQuestion.options.map((option, index) => {
                      if (index === currentQuestion.correctAnswer) return null;
                      return (
                        <p key={index} className="text-sm opacity-60">
                          {String.fromCharCode(65 + index)}. {option}
                        </p>
                      );
                    })}
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
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <XCircle className="h-5 w-5" />
                <span>Chưa biết</span>
              </button>
              <button
                onClick={() => handleKnownStatus(true)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Đã biết</span>
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Trước</span>
            </button>
            
            <div className="text-center">
              {currentProgress && (
                <div className="text-sm text-gray-500">
                  Đã xem {currentProgress.reviewCount} lần
                  {currentProgress.known ? (
                    <span className="text-green-600 ml-2">✓ Đã biết</span>
                  ) : (
                    <span className="text-red-600 ml-2">✗ Chưa biết</span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === shuffledQuestions.length - 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
            >
              <span>Tiếp</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;