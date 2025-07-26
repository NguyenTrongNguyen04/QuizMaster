import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { Question } from '../types';

interface QuestionManagerProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ questions, onQuestionsChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim())) {
      alert('Vui lòng điền đầy đủ câu hỏi và các đáp án');
      return;
    }

    if (editingId) {
      const updatedQuestions = questions.map(q => 
        q.id === editingId 
          ? { ...q, ...formData }
          : q
      );
      onQuestionsChange(updatedQuestions);
      setEditingId(null);
    } else {
      const newQuestion: Question = {
        id: Date.now().toString(),
        ...formData,
      };
      onQuestionsChange([...questions, newQuestion]);
      setIsAdding(false);
    }
    resetForm();
  };

  const handleEdit = (question: Question) => {
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
    });
    setEditingId(question.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      onQuestionsChange(questions.filter(q => q.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Quản lý câu hỏi</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Tổng số: {questions.length} câu hỏi
              </span>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm câu hỏi</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {isAdding && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câu hỏi
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Nhập câu hỏi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Các đáp án
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Chọn radio button để đánh dấu đáp án đúng
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingId ? 'Cập nhật' : 'Thêm'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Chưa có câu hỏi nào</p>
              <p className="text-gray-400 text-sm mt-2">Thêm câu hỏi đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-3">
                        {index + 1}. {question.question}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded-lg text-sm ${
                              optIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {optIndex === question.correctAnswer && (
                              <span className="ml-2 font-medium">(Đúng)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;