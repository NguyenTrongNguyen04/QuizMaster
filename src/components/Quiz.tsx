import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, RotateCcw, BookOpen, FileText } from 'lucide-react';
import { Subject, Question, QuizResult } from '../types';

interface QuizProps {
  subjects: Subject[];
  onQuizComplete: (result: QuizResult) => void;
}

const Quiz: React.FC<QuizProps> = ({ subjects, onQuizComplete }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(true);
  const [quizMode, setQuizMode] = useState<'full' | 'limited'>('full');
  const [customQuizSize, setCustomQuizSize] = useState(10);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedExam = selectedSubject?.exams.find(e => e.id === selectedExamId);

  const QUIZ_SIZE = quizMode === 'full' 
    ? (selectedExam?.questions?.length || 0)
    : Math.min(customQuizSize, selectedExam?.questions?.length || 0);
  const TIME_LIMIT = 30 * 60; // 30 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && !isFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStarted, isFinished, timeLeft]);

  const startQuiz = () => {
    if (!selectedExam || !selectedExam.questions || selectedExam.questions.length === 0) {
      alert('Không có câu hỏi nào để tạo quiz');
      return;
    }

    let questionsToUse: Question[];
    if (quizMode === 'full') {
      // Use all questions for full exam
      questionsToUse = [...selectedExam.questions];
    } else {
      // Use limited number of questions, shuffled
      questionsToUse = [...selectedExam.questions].sort(() => Math.random() - 0.5).slice(0, QUIZ_SIZE);
    }

    setQuizQuestions(questionsToUse);
    setUserAnswers(new Array(questionsToUse.length).fill(-1));
    setCurrentQuestionIndex(0);
    setTimeLeft(TIME_LIMIT);
    setStartTime(new Date());
    setIsStarted(true);
    setIsFinished(false);
    setResult(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleFinishQuiz = () => {
    if (!startTime || !selectedSubject || !selectedExam) return;

    const endTime = new Date();
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    let correctCount = 0;
    quizQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const quizResult: QuizResult = {
      id: Date.now().toString(),
      date: endTime,
      subjectId: selectedSubject.id,
      examId: selectedExam.id,
      questions: quizQuestions,
      userAnswers,
      score: correctCount,
      totalQuestions: quizQuestions.length,
      timeSpent,
    };

    setResult(quizResult);
    setIsFinished(true);
    onQuizComplete(quizResult);
  };

  const resetQuiz = () => {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizQuestions([]);
    setTimeLeft(0);
    setStartTime(null);
    setIsFinished(false);
    setResult(null);
  };

  const handleBackToSelection = () => {
    setIsSelecting(true);
    setSelectedSubjectId(null);
    setSelectedExamId(null);
    resetQuiz();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isSelecting) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Chọn môn học và đề thi</h2>
            <p className="text-gray-600 mt-2">Chọn môn học và đề thi để bắt đầu làm bài kiểm tra</p>
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
                        onClick={() => setSelectedExamId(exam.id)}
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

            {/* Quiz Mode Selection */}
            {selectedExamId && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Chế độ làm bài:</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="quizMode"
                      value="full"
                      checked={quizMode === 'full'}
                      onChange={() => setQuizMode('full')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">
                      Làm toàn bộ đề ({selectedExam!.questions.length} câu)
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="quizMode"
                      value="limited"
                      checked={quizMode === 'limited'}
                      onChange={() => setQuizMode('limited')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">
                      Làm {customQuizSize} câu (ngẫu nhiên)
                    </span>
                  </label>
                  {quizMode === 'limited' && (
                    <div className="ml-6">
                      <label className="block text-sm text-gray-700 mb-1">
                        Số câu hỏi:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedExam!.questions.length}
                        value={customQuizSize}
                        onChange={(e) => setCustomQuizSize(parseInt(e.target.value) || 10)}
                        className="w-20 p-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Chuẩn bị làm bài</h2>
            <p className="text-gray-600 mt-2">
              {selectedSubject?.name} - {selectedExam?.name}
            </p>
          </div>

          <div className="p-6">
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin bài kiểm tra</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{QUIZ_SIZE}</div>
                    <div className="text-sm text-gray-600">Câu hỏi</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatTime(TIME_LIMIT)}</div>
                    <div className="text-sm text-gray-600">Thời gian</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.round((QUIZ_SIZE / TIME_LIMIT) * 60)}</div>
                    <div className="text-sm text-gray-600">Phút/câu</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={startQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Bắt đầu làm bài
                </button>
                <button
                  onClick={handleBackToSelection}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2"
                >
                  Quay lại chọn đề
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Kết quả bài kiểm tra</h2>
            <p className="text-gray-600 mt-2">
              {selectedSubject?.name} - {selectedExam?.name}
            </p>
          </div>

          <div className="p-6">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {Math.round((result.score / result.totalQuestions) * 100)}%
              </div>
              <div className="text-xl text-gray-600">
                {result.score}/{result.totalQuestions} câu đúng
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Thời gian: {formatTime(result.timeSpent)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{result.score}</div>
                <div className="text-sm text-gray-600">Đúng</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{result.totalQuestions - result.score}</div>
                <div className="text-sm text-gray-600">Sai</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{formatTime(result.timeSpent)}</div>
                <div className="text-sm text-gray-600">Thời gian</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Làm lại
              </button>
              <button
                onClick={handleBackToSelection}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Chọn đề khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const userAnswer = userAnswers[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bài kiểm tra</h2>
              <p className="text-gray-600 mt-1">
                {selectedSubject?.name} - {selectedExam?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Câu {currentQuestionIndex + 1} / {quizQuestions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}% hoàn thành</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Câu {currentQuestionIndex + 1}: {currentQuestion.question}
            </h3>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    userAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={index}
                    checked={userAnswer === index}
                    onChange={() => handleAnswerSelect(index)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      userAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {userAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span className="flex-1 whitespace-pre-wrap">{option}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => goToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>← Trước</span>
            </button>

            <div className="flex space-x-2">
              {quizQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : userAnswers[index] !== -1
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === quizQuestions.length - 1 ? (
              <button
                onClick={handleFinishQuiz}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
              >
                Nộp bài
              </button>
            ) : (
              <button
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-2"
              >
                <span>Tiếp →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;