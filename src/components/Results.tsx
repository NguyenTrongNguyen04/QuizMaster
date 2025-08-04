import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp, Calendar, Trophy, Target, BookOpen, FileText } from 'lucide-react';
import { QuizResult } from '../types';

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

interface ResultsProps {
  results: QuizResult[];
  subjects: SubjectWithExams[];
}

const Results: React.FC<ResultsProps> = ({ results, subjects }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSubjectAndExamName = (result: QuizResult) => {
    const subject = subjects.find(s => s.id === result.subjectId);
    const exam = subject?.exams.find(e => e.id === result.examId);
    return {
      subjectName: subject?.name || 'Môn học không xác định',
      examName: exam?.name || 'Đề không xác định'
    };
  };

  if (results.length === 0) {
    return (
      <div className={`max-w-4xl mx-auto p-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4 hover:text-gray-400 transition-colors duration-300" />
          <p className="text-gray-500 text-lg">Chưa có kết quả nào</p>
          <p className="text-gray-400 text-sm mt-2">Hoàn thành một quiz để xem kết quả ở đây</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalQuizzes = results.length;
  const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalQuizzes;
  const bestScore = Math.max(...results.map(r => r.score));
  const totalTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0);

  const recentResults = [...results].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return (
    <div className={`max-w-6xl mx-auto p-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-300">Kết quả học tập</h2>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-blue-600 hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totalQuizzes}</p>
                  <p className="text-sm text-gray-600">Tổng số quiz</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-green-600 hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{Math.round(averageScore)}%</p>
                  <p className="text-sm text-gray-600">Điểm trung bình</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-purple-600 hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(bestScore)}%</p>
                  <p className="text-sm text-gray-600">Điểm cao nhất</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in" style={{ animationDelay: '800ms' }}>
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-orange-600 hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{formatTime(totalTimeSpent)}</p>
                  <p className="text-sm text-gray-600">Tổng thời gian</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Kết quả gần đây</h3>
          <div className="space-y-4">
            {recentResults.map((result, index) => {
              const { subjectName, examName } = getSubjectAndExamName(result);
              const scorePercentage = result.score;
              const isPassed = scorePercentage >= 60;
              
              return (
                <div 
                  key={result.id}
                  className={`bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in`}
                  style={{ animationDelay: `${1000 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <h4 className="font-semibold text-gray-900">{subjectName}</h4>
                        <span className="text-sm text-gray-500">-</span>
                        <span className="text-sm text-gray-600">{examName}</span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(result.completedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(result.timeSpent)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{result.totalQuestions} câu hỏi</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {scorePercentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.correctAnswers}/{result.totalQuestions} đúng
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isPassed ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${scorePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;