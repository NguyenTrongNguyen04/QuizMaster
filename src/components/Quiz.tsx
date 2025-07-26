import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Question, QuizResult } from '../types';

interface QuizProps {
  questions: Question[];
  onResultSave: (result: QuizResult) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onResultSave }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const QUIZ_SIZE = Math.min(10, questions.length);
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
    if (questions.length === 0) {
      alert('Không có câu hỏi nào để tạo quiz');
      return;
    }

    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, QUIZ_SIZE);
    setQuizQuestions(shuffled);
    setUserAnswers(new Array(shuffled.length).fill(-1));
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
    if (!startTime) return;

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
      questions: quizQuestions,
      userAnswers,
      score: correctCount,
      totalQuestions: quizQuestions.length,
      timeSpent,
    };

    setResult(quizResult);
    setIsFinished(true);
    onResultSave(quizResult);
  };

  const resetQuiz = () => {
    setIsStarted(false);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizQuestions([]);
    setTimeLeft(0);
    setStartTime(null);
    setResult(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">Chưa có câu hỏi nào cho quiz</p>
          <p className="text-gray-400 text-sm mt-2">Vui lòng thêm câu hỏi trong phần Quản lý</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bài kiểm tra trắc nghiệm</h2>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{QUIZ_SIZE}</p>
                  <p className="text-sm text-gray-600">Câu hỏi</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{formatTime(TIME_LIMIT)}</p>
                  <p className="text-sm text-gray-600">Thời gian</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
                  <p className="text-sm text-gray-600">Tổng câu hỏi có sẵn</p>
                </div>
              </div>
            </div>
            <button
              onClick={startQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
            >
              Bắt đầu Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished && result) {
    const scorePercentage = (result.score / result.totalQuestions) * 100;
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kết quả Quiz</h2>
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
              scorePercentage >= 80 ? 'bg-green-100' : scorePercentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-3xl font-bold ${
                scorePercentage >= 80 ? 'text-green-600' : scorePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(scorePercentage)}%
              </span>
            </div>
            <p className="text-xl text-gray-700">
              Bạn đã trả lời đúng {result.score}/{result.totalQuestions} câu
            </p>
            <p className="text-gray-500">Thời gian: {formatTime(result.timeSpent)}</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Chi tiết từng câu:</h3>
            {result.questions.map((question, index) => {
              const userAnswer = result.userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              const wasAnswered = userAnswer !== -1;

              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Câu {index + 1}: {question.question}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {question.options.map((option, optIndex) => {
                          let bgClass = 'bg-gray-50';
                          let textClass = 'text-gray-700';
                          
                          if (optIndex === question.correctAnswer) {
                            bgClass = 'bg-green-100 border-green-200';
                            textClass = 'text-green-800';
                          } else if (wasAnswered && optIndex === userAnswer && !isCorrect) {
                            bgClass = 'bg-red-100 border-red-200';
                            textClass = 'text-red-800';
                          }

                          return (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border ${bgClass} ${textClass} text-sm`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {optIndex === question.correctAnswer && (
                                <span className="ml-2 font-medium">(Đáp án đúng)</span>
                              )}
                              {wasAnswered && optIndex === userAnswer && optIndex !== question.correctAnswer && (
                                <span className="ml-2 font-medium">(Bạn chọn)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {!wasAnswered && (
                        <p className="text-red-500 text-sm mt-2">Không trả lời</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={resetQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Làm lại Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const answeredCount = userAnswers.filter(answer => answer !== -1).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Quiz đang diễn ra</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Câu {currentQuestionIndex + 1} / {quizQuestions.length}</span>
            <span>Đã trả lời: {answeredCount}/{quizQuestions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question navigation */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quizQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors duration-200 ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : userAnswers[index] !== -1
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question content */}
        <div className="p-6">
          <h3 className="text-xl font-medium text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                  userAnswers[currentQuestionIndex] === index
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              ← Câu trước
            </button>
            
            <div className="flex space-x-3">
              {currentQuestionIndex === quizQuestions.length - 1 ? (
                <button
                  onClick={handleFinishQuiz}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  Nộp bài
                </button>
              ) : (
                <button
                  onClick={() => goToQuestion(Math.min(quizQuestions.length - 1, currentQuestionIndex + 1))}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Câu tiếp →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;