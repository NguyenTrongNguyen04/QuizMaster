import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, BookOpen, FileText } from 'lucide-react';
import { Subject, Exam, Question } from '../types';

interface QuestionManagerProps {
  subjects: Subject[];
  onSubjectsChange: (subjects: Subject[]) => void;
}

const QuestionManager: React.FC<QuestionManagerProps> = ({ subjects, onSubjectsChange }) => {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form data cho Subject
  const [subjectFormData, setSubjectFormData] = useState({
    code: '',
    name: '',
  });

  // Form data cho Exam
  const [examFormData, setExamFormData] = useState({
    code: '',
    name: '',
  });

  // Form data cho Question
  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const resetSubjectForm = () => {
    setSubjectFormData({ code: '', name: '' });
  };

  const resetExamForm = () => {
    setExamFormData({ code: '', name: '' });
  };

  const resetQuestionForm = () => {
    setQuestionFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    });
  };

  // Subject handlers
  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFormData.code.trim() || !subjectFormData.name.trim()) {
      alert('Vui lòng điền đầy đủ mã môn học và tên môn học');
      return;
    }

    if (editingSubjectId) {
      const updatedSubjects = subjects.map(s => 
        s.id === editingSubjectId 
          ? { ...s, ...subjectFormData }
          : s
      );
      onSubjectsChange(updatedSubjects);
      setEditingSubjectId(null);
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        ...subjectFormData,
        exams: [],
      };
      onSubjectsChange([...subjects, newSubject]);
      setIsAddingSubject(false);
    }
    resetSubjectForm();
  };

  const handleSubjectEdit = (subject: Subject) => {
    setSubjectFormData({
      code: subject.code,
      name: subject.name,
    });
    setEditingSubjectId(subject.id);
    setIsAddingSubject(true);
  };

  const handleSubjectDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa môn học này? Tất cả đề và câu hỏi sẽ bị xóa.')) {
      onSubjectsChange(subjects.filter(s => s.id !== id));
    }
  };

  // Exam handlers
  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !examFormData.code.trim() || !examFormData.name.trim()) {
      alert('Vui lòng chọn môn học và điền đầy đủ mã đề và tên đề');
      return;
    }

    const updatedSubjects = subjects.map(s => {
      if (s.id === selectedSubjectId) {
        if (editingExamId) {
          // Update existing exam
          const updatedExams = s.exams.map(e => 
            e.id === editingExamId 
              ? { ...e, ...examFormData }
              : e
          );
          return { ...s, exams: updatedExams };
        } else {
          // Add new exam
          const newExam: Exam = {
            id: Date.now().toString(),
            ...examFormData,
            questions: [],
          };
          return { ...s, exams: [...s.exams, newExam] };
        }
      }
      return s;
    });

    onSubjectsChange(updatedSubjects);
    setEditingExamId(null);
    setIsAddingExam(false);
    resetExamForm();
  };

  const handleExamEdit = (exam: Exam) => {
    setExamFormData({
      code: exam.code,
      name: exam.name,
    });
    setEditingExamId(exam.id);
    setIsAddingExam(true);
  };

  const handleExamDelete = (subjectId: string, examId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đề này? Tất cả câu hỏi sẽ bị xóa.')) {
      const updatedSubjects = subjects.map(s => {
        if (s.id === subjectId) {
          return { ...s, exams: s.exams.filter(e => e.id !== examId) };
        }
        return s;
      });
      onSubjectsChange(updatedSubjects);
    }
  };

  // Question handlers
  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !questionFormData.question.trim() || questionFormData.options.some(opt => !opt.trim())) {
      alert('Vui lòng chọn đề và điền đầy đủ câu hỏi và các đáp án');
      return;
    }

    const updatedSubjects = subjects.map(s => {
      return {
        ...s,
        exams: s.exams.map(e => {
          if (e.id === selectedExamId) {
            if (editingQuestionId) {
              // Update existing question
              const updatedQuestions = e.questions.map(q => 
                q.id === editingQuestionId 
                  ? { ...q, ...questionFormData }
                  : q
              );
              return { ...e, questions: updatedQuestions };
            } else {
              // Add new question
              const newQuestion: Question = {
                id: Date.now().toString(),
                ...questionFormData,
                examId: selectedExamId,
              };
              return { ...e, questions: [...e.questions, newQuestion] };
            }
          }
          return e;
        })
      };
    });

    onSubjectsChange(updatedSubjects);
    setEditingQuestionId(null);
    setIsAddingQuestion(false);
    resetQuestionForm();
  };

  const handleQuestionEdit = (question: Question) => {
    setQuestionFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
    });
    setEditingQuestionId(question.id);
    setIsAddingQuestion(true);
  };

  const handleQuestionDelete = (subjectId: string, examId: string, questionId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const updatedSubjects = subjects.map(s => {
        if (s.id === subjectId) {
          return {
            ...s,
            exams: s.exams.map(e => {
              if (e.id === examId) {
                return { ...e, questions: e.questions.filter(q => q.id !== questionId) };
              }
              return e;
            })
          };
        }
        return s;
      });
      onSubjectsChange(updatedSubjects);
    }
  };

  const handleCancel = () => {
    setIsAddingSubject(false);
    setIsAddingExam(false);
    setIsAddingQuestion(false);
    setEditingSubjectId(null);
    setEditingExamId(null);
    setEditingQuestionId(null);
    resetSubjectForm();
    resetExamForm();
    resetQuestionForm();
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const selectedExam = selectedSubject?.exams.find(e => e.id === selectedExamId);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Quản lý môn học và đề thi</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {subjects.length} môn học
              </span>
              {!isAddingSubject && (
                <button
                  onClick={() => setIsAddingSubject(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Thêm môn học</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Danh sách môn học */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Môn học
            </h3>
            
            {isAddingSubject && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <form onSubmit={handleSubjectSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã môn học
                    </label>
                    <input
                      type="text"
                      value={subjectFormData.code}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên môn học
                    </label>
                    <input
                      type="text"
                      value={subjectFormData.name}
                      onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Lập trình cơ bản"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      {editingSubjectId ? 'Cập nhật' : 'Thêm'}
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{subject.name}</div>
                      <div className="text-sm text-gray-500">{subject.code}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {subject.exams.length} đề thi
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubjectEdit(subject);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubjectDelete(subject.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danh sách đề thi */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Đề thi
            </h3>
            
            {selectedSubject && (
              <>
                {isAddingExam && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <form onSubmit={handleExamSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã đề
                        </label>
                        <input
                          type="text"
                          value={examFormData.code}
                          onChange={(e) => setExamFormData({ ...examFormData, code: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="VD: DE01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên đề
                        </label>
                        <input
                          type="text"
                          value={examFormData.name}
                          onChange={(e) => setExamFormData({ ...examFormData, name: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="VD: Đề thi giữa kỳ"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          {editingExamId ? 'Cập nhật' : 'Thêm'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="mb-4">
                  <button
                    onClick={() => setIsAddingExam(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Thêm đề thi</span>
                  </button>
                </div>

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
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{exam.name}</div>
                          <div className="text-sm text-gray-500">{exam.code}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {exam.questions.length} câu hỏi
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExamEdit(exam);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExamDelete(selectedSubject.id, exam.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Danh sách câu hỏi */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Câu hỏi</h3>
            
            {selectedExam && (
              <>
                {isAddingQuestion && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <form onSubmit={handleQuestionSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Câu hỏi
                        </label>
                        <textarea
                          value={questionFormData.question}
                          onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          placeholder="Nhập câu hỏi..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Các đáp án
                        </label>
                        <div className="space-y-2">
                          {questionFormData.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={questionFormData.correctAnswer === index}
                                onChange={() => setQuestionFormData({ ...questionFormData, correctAnswer: index })}
                                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...questionFormData.options];
                                  newOptions[index] = e.target.value;
                                  setQuestionFormData({ ...questionFormData, options: newOptions });
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          {editingQuestionId ? 'Cập nhật' : 'Thêm'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="mb-4">
                  <button
                    onClick={() => setIsAddingQuestion(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Thêm câu hỏi</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedExam.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2 text-sm">
                            {index + 1}. {question.question}
                          </h4>
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-1 rounded text-xs ${
                                  optIndex === question.correctAnswer
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-50 text-gray-700'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {optIndex === question.correctAnswer && (
                                  <span className="ml-1 font-medium">(Đúng)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleQuestionEdit(question)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleQuestionDelete(selectedSubject!.id, selectedExam!.id, question.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;