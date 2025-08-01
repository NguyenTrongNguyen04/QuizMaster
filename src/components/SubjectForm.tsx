import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Subject, Major } from '../config/firebase';

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  subject?: Subject | null;
  majors: Major[];
  loading?: boolean;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  subject, 
  majors,
  loading = false 
}) => {
  const [formData, setFormData] = useState<Partial<Subject>>({
    id: '',
    majorId: '',
    name: '',
    description: '',
    code: ''
  });

  useEffect(() => {
    if (subject) {
      setFormData(subject);
    } else {
      setFormData({
        id: '',
        majorId: majors.length > 0 ? majors[0].id : '',
        name: '',
        description: '',
        code: ''
      });
    }
  }, [subject, majors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.code || !formData.majorId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const subjectData: Subject = {
      id: formData.id || `subject-${Date.now()}`,
      majorId: formData.majorId,
      name: formData.name,
      description: formData.description,
      code: formData.code,
      createdAt: subject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(subjectData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {subject ? 'Sửa môn học' : 'Thêm môn học mới'}
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
            <label htmlFor="majorId" className="block text-sm font-medium text-gray-700 mb-2">
              Chuyên ngành *
            </label>
            <select
              id="majorId"
              value={formData.majorId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, majorId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Chọn chuyên ngành</option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.name} ({major.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tên môn học *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Object-Oriented Programming"
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Mã môn học *
            </label>
            <input
              type="text"
              id="code"
              value={formData.code || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: OOP"
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
              placeholder="Mô tả chi tiết về môn học"
              required
            />
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
        </form>
      </div>
    </div>
  );
};

export default SubjectForm; 