import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, RotateCcw, BookOpen, FileText } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, QuizResult } from '../types';

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

interface QuizProps {
  subjects: SubjectWithExams[];
  onQuizComplete: (result: QuizResult) => void;
}

const Quiz: React.FC<QuizProps> = ({ subjects, onQuizComplete }) => {
  const { majorId, subjectId, examId } = useParams();
  const navigate = useNavigate();
  
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [selectedMajorId, setSelectedMajorId] = useState<string | null>(majorId || null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(subjectId || null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(examId || null);
  const [isSelecting, setIsSelecting] = useState(!examId);
  const [quizMode, setQuizMode] = useState<'full' | 'limited'>('full');
  const [customQuizSize, setCustomQuizSize] = useState(10);

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

  // Group subjects by major
  const subjectsByMajor = subjects.reduce((acc, subject) => {
    if (!acc[subject.majorId]) {
      acc[subject.majorId] = [];
    }
    acc[subject.majorId].push(subject);
    return acc;
  }, {} as { [majorId: string]: SubjectWithExams[] });

  const selectedMajor = selectedMajorId ? subjectsByMajor[selectedMajorId]?.[0] : null;
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
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
    setSelectedMajorId(null);
    setSelectedSubjectId(null);
    setSelectedExamId(null);
    resetQuiz();
    navigate('/quiz');
  };

  const handleMajorClick = (majorId: string) => {
    setSelectedMajorId(majorId);
    setSelectedSubjectId(null);
    setSelectedExamId(null);
    navigate(`/quiz/${majorId}`);
  };

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedExamId(null);
    navigate(`/quiz/${selectedMajorId}/${subjectId}`);
  };

  const handleExamClick = (examId: string) => {
    setSelectedExamId(examId);
    navigate(`/quiz/${selectedMajorId}/${selectedSubjectId}/${examId}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isSelecting) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            {!selectedMajorId ? (
              <>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chọn chuyên ngành để kiểm tra
                </h2>
                <p className="text-gray-600 mt-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  Chọn chuyên ngành để bắt đầu làm bài kiểm tra
                </p>
              </>
            ) : !selectedSubjectId ? (
              <>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chọn môn học
                </h2>
                <p className="text-gray-600 mt-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  Chọn môn học thuộc chuyên ngành {getFriendlyMajorName(selectedMajor?.majorId || '')}
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
                  ].map((majorId) => {
                    const majorSubjects = subjectsByMajor[majorId] || [];
                    const friendlyMajorName = getFriendlyMajorName(majorId);
                    const colors = getMajorColor(majorId);
                    const totalSubjects = majorSubjects.length;
                    const totalExams = majorSubjects.reduce((sum, subject) => sum + subject.exams.length, 0);
                    
                    return (
                      <div
                        key={majorId}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover-lift ${
                          selectedMajorId === majorId
                            ? `${colors.bg} ${colors.border} shadow-lg`
                            : `${colors.bg} ${colors.border} hover:shadow-md`
                        }`}
                        onClick={() => handleMajorClick(majorId)}
                      >
                        <div className="text-center">
                          <div className={`font-bold text-lg mb-2 ${colors.text}`}>{friendlyMajorName}</div>
                          <div className="text-sm text-gray-500 mb-2">({majorId})</div>
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
                    Môn học thuộc {getFriendlyMajorName(selectedMajor?.majorId || '')}
                  </h3>
                  <button
                    onClick={() => navigate('/quiz')}
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
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    Đề thi thuộc {selectedSubject?.name}
                  </h3>
                  <button
                    onClick={() => navigate(`/quiz/${selectedMajorId}`)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ← Quay lại chọn môn học
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedSubject!.exams.map((exam) => (
                    <div
                      key={exam.id}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover-lift ${
                        selectedExamId === exam.id
                          ? 'border-green-500 bg-green-50/80 shadow-lg'
                          : 'border-gray-200 hover:border-green-300 bg-white/60 hover:bg-white/80'
                      }`}
                      onClick={() => handleExamClick(exam.id)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📝</div>
                        <div className="font-bold text-gray-900 text-lg mb-2">{exam.name}</div>
                        <div className="text-sm text-gray-500 mb-3">{exam.code}</div>
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            exam.examType === 'PE' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {exam.examType === 'PE' ? 'PE' : 'FE'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(exam.questions || []).length} câu hỏi
                          </span>
                        </div>
                        {selectedExamId === exam.id && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
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
              Câu {currentQuestionIndex + 1}: <span className="whitespace-pre-wrap">{currentQuestion.question}</span>
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