import React from 'react';
import { Trophy, Calendar, Clock, Target, TrendingUp, Trash2 } from 'lucide-react';
import { QuizResult } from '../types';

interface ResultsProps {
  results: QuizResult[];
  onResultsChange: (results: QuizResult[]) => void;
}

const Results: React.FC<ResultsProps> = ({ results, onResultsChange }) => {
  const deleteResult = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa kết quả này?')) {
      onResultsChange(results.filter(r => r.id !== id));
    }
  };

  const clearAllResults = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả kết quả?')) {
      onResultsChange([]);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
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

  if (results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Chưa có kết quả nào</p>
          <p className="text-gray-400 text-sm mt-2">Hoàn thành một quiz để xem kết quả ở đây</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalQuizzes = results.length;
  const averageScore = results.reduce((sum, result) => sum + (result.score / result.totalQuestions), 0) / totalQuizzes * 100;
  const bestScore = Math.max(...results.map(r => (r.score / r.totalQuestions) * 100));
  const totalTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0);

  const recentResults = [...results].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Kết quả học tập</h2>
            {results.length > 0 && (
              <button
                onClick={clearAllResults}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totalQuizzes}</p>
                  <p className="text-sm text-gray-600">Tổng số quiz</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{Math.round(averageScore)}%</p>
                  <p className="text-sm text-gray-600">Điểm trung bình</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(bestScore)}%</p>
                  <p className="text-sm text-gray-600">Điểm cao nhất</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-orange-600" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử làm bài</h3>
          <div className="space-y-4">
            {recentResults.map((result) => {
              const scorePercentage = (result.score / result.totalQuestions) * 100;
              return (
                <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                          scorePercentage >= 80 ? 'bg-green-100' : scorePercentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-lg font-bold ${
                            scorePercentage >= 80 ? 'text-green-600' : scorePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {Math.round(scorePercentage)}%
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {result.score}/{result.totalQuestions} câu đúng
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(result.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(result.timeSpent)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            scorePercentage >= 80 ? 'bg-green-500' : scorePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${scorePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteResult(result.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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