import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Exam, Subject } from '../config/firebase';
import QuestionManager from './QuestionManager';

interface ExamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Exam) => void;
  exam?: Exam | null;
  subjects: Subject[];
  loading?: boolean;
}

const ExamForm: React.FC<ExamFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  exam, 
  subjects,
  loading = false 
}) => {
  const [formData, setFormData] = useState<Partial<Exam>>({
    id: '',
    subjectId: '',
    name: '',
    description: '',
    timeLimit: 60,
    totalQuestions: 20,
    examType: 'PE'
  });
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);

  useEffect(() => {
    if (exam) {
      setFormData(exam);
      setCurrentExam(exam);
    } else {
      setFormData({
        id: '',
        subjectId: subjects.length > 0 ? subjects[0].id : '',
        name: '',
        description: '',
        timeLimit: 60,
        totalQuestions: 20,
        examType: 'PE'
      });
      setCurrentExam(null);
    }
  }, [exam, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.subjectId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const examData: Exam = {
      id: formData.id || `exam-${Date.now()}`,
      subjectId: formData.subjectId,
      name: formData.name,
      description: formData.description,
      timeLimit: formData.timeLimit || 60,
      totalQuestions: formData.totalQuestions || 20,
      createdAt: exam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: exam?.questions || [],
      examType: formData.examType || 'PE'
    };

    onSave(examData);
    setCurrentExam(examData);
  };

  const handleOpenQuestionManager = () => {
    if (currentExam) {
      setShowQuestionManager(true);
    }
  };

  const handleQuestionManagerSave = (updatedExam: Exam) => {
    console.log('[ExamForm] QuestionManager save called with exam:', updatedExam);
    onSave(updatedExam);
    setCurrentExam(updatedExam);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {exam ? 'Sửa đề thi' : 'Thêm đề thi mới'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-2">
                Môn học *
              </label>
              <select
                id="subjectId"
                value={formData.subjectId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Chọn môn học</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đề thi *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ví dụ: Midterm Exam - OOP"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Mô tả chi tiết về đề thi"
                required
              />
            </div>

            <div>
              <label htmlFor="examType" className="block text-sm font-medium text-gray-700 mb-2">
                Loại đề thi *
              </label>
              <select
                id="examType"
                value={formData.examType || 'PE'}
                onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value as 'PE' | 'FE' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="PE">Đề thi PE (Practice Exam)</option>
                <option value="FE">Đề thi FE (Final Exam)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian (phút)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={formData.timeLimit || 60}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="300"
                />
              </div>

              <div>
                <label htmlFor="totalQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                  Số câu hỏi
                </label>
                <input
                  type="number"
                  id="totalQuestions"
                  value={formData.totalQuestions || 20}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) || 20 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </>
                )}
              </button>
            </div>
            
            {currentExam && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleOpenQuestionManager}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">📝</span>
                  Quản lý câu hỏi ({currentExam.questions?.length || 0} câu)
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      <QuestionManager
        isOpen={showQuestionManager}
        onClose={() => setShowQuestionManager(false)}
        exam={currentExam}
        onSave={handleQuestionManagerSave}
        loading={loading}
      />
    </>
  );
};

export default ExamForm; 