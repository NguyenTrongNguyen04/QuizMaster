import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus, Edit, Trash2, Eye, EyeOff, Upload as UploadIcon } from 'lucide-react';
import { Question, Exam } from '../config/firebase';
import Upload from './Upload';

interface QuestionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  onSave: (exam: Exam) => void;
  loading?: boolean;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ 
  isOpen, 
  onClose, 
  exam, 
  onSave,
  loading = false 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    console.log('[QuestionManager] Exam changed:', exam);
    if (exam) {
      console.log('[QuestionManager] Loading questions from exam:', exam.questions);
      setQuestions(exam.questions || []);
    }
  }, [exam]);

  const handleAddQuestion = () => {
    const timestamp = Date.now();
    const newQuestion: Question = {
      id: `question-${timestamp}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      examId: exam?.id || '',
      category: '',
      difficulty: 'medium',
      createdAt: new Date().toISOString()
    };
    console.log('[QuestionManager] Creating new question with ID:', newQuestion.id);
    setEditingQuestion(newQuestion);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      
      if (exam) {
        const updatedExam = { ...exam, questions: updatedQuestions };
        onSave(updatedExam);
      }
    }
  };

  const handleSaveQuestion = (question: Question) => {
    console.log('[QuestionManager] Saving question:', question);
    console.log('[QuestionManager] Current questions:', questions);
    console.log('[QuestionManager] Editing question ID:', editingQuestion?.id);
    
    let updatedQuestions: Question[];
    
    // Check if we're editing an existing question (has a real ID, not a temporary one)
    const isEditing = editingQuestion?.id && 
                     !editingQuestion.id.startsWith('question-') && 
                     questions.some(q => q.id === editingQuestion.id);
    
    console.log('[QuestionManager] Is editing existing question:', isEditing);
    
    if (isEditing) {
      // Editing existing question
      updatedQuestions = questions.map(q => q.id === question.id ? question : q);
      console.log('[QuestionManager] Editing existing question');
    } else {
      // Adding new question
      const newQuestion = { 
        ...question, 
        id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        examId: exam?.id || ''
      };
      updatedQuestions = [...questions, newQuestion];
      console.log('[QuestionManager] Adding new question:', newQuestion);
    }
    
    console.log('[QuestionManager] Updated questions:', updatedQuestions);
    setQuestions(updatedQuestions);
    setShowQuestionForm(false);
    setEditingQuestion(null);
    
    // Immediately save the updated exam
    if (exam) {
      const updatedExam = { ...exam, questions: updatedQuestions };
      console.log('[QuestionManager] Saving updated exam:', updatedExam);
      onSave(updatedExam);
    }
  };

  const handleSaveAll = () => {
    if (exam) {
      const updatedExam = { ...exam, questions };
      onSave(updatedExam);
    }
  };

  const handleUploadQuestions = (uploadedQuestions: Question[]) => {
    // Set examId for uploaded questions
    const questionsWithExamId = uploadedQuestions.map(q => ({
      ...q,
      examId: exam?.id || ''
    }));
    
    // Add uploaded questions to existing questions
    const updatedQuestions = [...questions, ...questionsWithExamId];
    setQuestions(updatedQuestions);
    
    // Save to exam
    if (exam) {
      const updatedExam = { ...exam, questions: updatedQuestions };
      onSave(updatedExam);
    }
    
    setShowUploadModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-auto max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Quản lý câu hỏi - {exam?.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {questions.length} câu hỏi
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              title={previewMode ? 'Tắt xem trước' : 'Xem trước'}
            >
              {previewMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Question List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách câu hỏi</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('[QuestionManager] Manual refresh - exam:', exam);
                      console.log('[QuestionManager] Manual refresh - exam questions:', exam?.questions);
                      if (exam) {
                        setQuestions(exam.questions || []);
                      }
                    }}
                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm câu hỏi
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Câu {index + 1}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {question.question}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Đáp án đúng: {String.fromCharCode(65 + question.correctAnswer)}
                    </div>
                  </div>
                ))}
                
                {questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có câu hỏi nào</p>
                    <p className="text-sm">Click "Thêm câu hỏi" để bắt đầu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview/Form */}
          <div className="w-1/2 overflow-y-auto">
            {showQuestionForm ? (
              <QuestionForm
                question={editingQuestion}
                onSave={handleSaveQuestion}
                onCancel={() => {
                  setShowQuestionForm(false);
                  setEditingQuestion(null);
                }}
              />
            ) : previewMode ? (
              <QuestionPreview questions={questions} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>Chọn một câu hỏi để chỉnh sửa hoặc bật chế độ xem trước</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Tổng cộng: {questions.length} câu hỏi
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveAll}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu tất cả
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Upload
          onQuestionsUploaded={handleUploadQuestions}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

// Question Form Component
interface QuestionFormProps {
  question: Question | null;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    difficulty: 'medium'
  });

  useEffect(() => {
    if (question) {
      setFormData(question);
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question || formData.options?.some(opt => !opt.trim())) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const questionData: Question = {
      id: question?.id && !question.id.startsWith('question-') ? question.id : `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: formData.question || '',
      options: formData.options || ['', '', '', ''],
      correctAnswer: formData.correctAnswer || 0,
      examId: question?.examId || '',
      category: formData.category || '',
      difficulty: formData.difficulty || 'medium',
      createdAt: question?.createdAt || new Date().toISOString()
    };

    console.log('[QuestionForm] Submitting question data:', questionData);
    onSave(questionData);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(formData.options || ['', '', '', ''])];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    const newOptions = [...(formData.options || ['', '', '', '']), ''];
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const removeOption = (index: number) => {
    const currentOptions = formData.options || ['', '', '', ''];
    if (currentOptions.length <= 2) {
      alert('Phải có ít nhất 2 lựa chọn');
      return;
    }
    
    const newOptions = currentOptions.filter((_, i) => i !== index);
    setFormData(prev => ({ 
      ...prev, 
      options: newOptions,
      correctAnswer: Math.min(prev.correctAnswer || 0, newOptions.length - 1)
    }));
  };

  const currentOptions = formData.options || ['', '', '', ''];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {question ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Câu hỏi *
          </label>
          <textarea
            value={formData.question || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Nhập câu hỏi..."
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Các lựa chọn *
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <span>+</span>
              <span>Thêm đáp án</span>
            </button>
          </div>
          <div className="space-y-2">
            {currentOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={index}
                  checked={formData.correctAnswer === index}
                  onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: parseInt(e.target.value) }))}
                  className="text-blue-600"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                  required
                />
                {currentOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Xóa lựa chọn này"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục (tùy chọn)
          </label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Lý thuyết, Thực hành..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ khó
          </label>
          <select
            value={formData.difficulty || 'medium'}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lưu câu hỏi
          </button>
        </div>
      </form>
    </div>
  );
};

// Question Preview Component
interface QuestionPreviewProps {
  questions: Question[];
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ questions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Không có câu hỏi để xem trước</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Xem trước</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
          >
            ←
          </button>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          Câu {currentIndex + 1}: {currentQuestion.question}
        </h4>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                index === currentQuestion.correctAnswer
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
              {index === currentQuestion.correctAnswer && (
                <span className="ml-2 text-sm font-bold text-green-600">✓ Đúng</span>
              )}
            </div>
          ))}
        </div>

        {currentQuestion.category && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Danh mục: {currentQuestion.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionManager;