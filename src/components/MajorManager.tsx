import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, FileText, Users, ChevronRight, GraduationCap, BookOpen as BookOpenIcon, FileText as FileTextIcon, Lock } from 'lucide-react';
import { Major, Subject, Exam } from '../config/firebase';
import { 
  saveMajor, 
  loadPublicMajors, 
  deleteMajor,
  saveSubject,
  loadSubjectsByMajor,
  deleteSubject,
  saveExam,
  loadExamsBySubject,
  deleteExam,
  createSampleMajors,
  createSampleSubjects,
  createSampleExams,
  auth,
  debugCurrentUser,
  testDatabaseAccess
} from '../config/firebase';
import { useUserPlan } from '../hooks/useUserPlan';
import MajorForm from './MajorForm';
import SubjectForm from './SubjectForm';
import ExamForm from './ExamForm';
import { useNavigate } from 'react-router-dom';

interface MajorManagerProps {
  userRole: string;
  user: any;
}

const MajorManager: React.FC<MajorManagerProps> = ({ userRole, user }) => {
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<{ [majorId: string]: Subject[] }>({});
  const [exams, setExams] = useState<{ [subjectId: string]: Exam[] }>({});
  const [loading, setLoading] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // Form states
  const [showMajorForm, setShowMajorForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const { canAccessExamType, isPro } = useUserPlan({ user });
  const navigate = useNavigate();

  // Load majors
  useEffect(() => {
    const loadMajors = async () => {
      setLoading(true);
      try {
        console.log('[MajorManager] Loading majors...');
        const majorsData = await loadPublicMajors();
        console.log('[MajorManager] Loaded majors:', majorsData);
        setMajors(majorsData as Major[]);
      } catch (error) {
        console.error('[MajorManager] Error loading majors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMajors();
  }, []);

  // Load subjects when major is selected
  useEffect(() => {
    if (selectedMajor) {
      const loadSubjects = async () => {
        console.log('[MajorManager] Loading subjects for major:', selectedMajor);
        try {
          const subjectsData = await loadSubjectsByMajor(selectedMajor);
          console.log('[MajorManager] Loaded subjects:', subjectsData);
          setSubjects(prev => ({ ...prev, [selectedMajor]: subjectsData as Subject[] }));
        } catch (error) {
          console.error('Error loading subjects:', error);
        }
      };

      loadSubjects();
    }
  }, [selectedMajor]);

  // Load exams when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      const loadExams = async () => {
        try {
          const examsData = await loadExamsBySubject(selectedSubject);
          // Filter exams based on user plan
          const filteredExams = (examsData as Exam[]).filter((exam: Exam) => canAccessExamType(exam.examType));
          setExams(prev => ({ ...prev, [selectedSubject]: filteredExams }));
        } catch (error) {
          console.error('Error loading exams:', error);
        }
      };

      loadExams();
    }
  }, [selectedSubject, canAccessExamType]);

  const handleCreateSampleData = async () => {
    setLoading(true);
    try {
      console.log('[MajorManager] Creating sample data...');
      await createSampleMajors();
      await createSampleSubjects();
      await createSampleExams();
      
      // Reload data
      const majorsData = await loadPublicMajors();
      console.log('[MajorManager] Sample data created, reloaded majors:', majorsData);
      setMajors(majorsData as Major[]);
      
      alert('Sample data created successfully!');
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data');
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check admin status
  const debugAdminStatus = async () => {
    try {
      const { checkAdminStatus } = await import('../config/firebase');
      const user = auth.currentUser;
      if (user?.email) {
        const isAdmin = await checkAdminStatus(user.email);
        console.log('[MajorManager] Admin status for', user.email, ':', isAdmin);
        alert(`Admin status: ${isAdmin ? 'ADMIN' : 'NOT ADMIN'}`);
      } else {
        console.log('[MajorManager] No user logged in');
        alert('No user logged in');
      }
    } catch (error) {
      console.error('[MajorManager] Error checking admin status:', error);
      alert('Error checking admin status');
    }
  };

  // Debug function to check current user details
  const debugCurrentUserDetails = async () => {
    try {
      const userInfo = await debugCurrentUser();
      if (userInfo) {
        console.log('[MajorManager] User debug info:', userInfo);
        alert(`User: ${userInfo.user.email}\nAdmin: ${userInfo.isAdmin}\nExists in DB: ${userInfo.userExists}`);
      } else {
        alert('No user logged in');
      }
    } catch (error) {
      console.error('[MajorManager] Error debugging user:', error);
      alert('Error debugging user');
    }
  };

  // Debug function to test database access
  const debugDatabaseAccess = async () => {
    try {
      const success = await testDatabaseAccess();
      if (success) {
        alert('Database access test: SUCCESS');
      } else {
        alert('Database access test: FAILED');
      }
    } catch (error) {
      console.error('[MajorManager] Error testing database access:', error);
      alert('Error testing database access');
    }
  };

  const handleSaveMajor = async (major: Major) => {
    setLoading(true);
    try {
      console.log('[MajorManager] Saving major:', major);
      const success = await saveMajor(major);
      
      if (success) {
        console.log('[MajorManager] Major saved successfully');
        const majorsData = await loadPublicMajors();
        console.log('[MajorManager] Reloaded majors:', majorsData);
        setMajors(majorsData as Major[]);
        setShowMajorForm(false);
        setEditingMajor(null);
        alert('Chuyên ngành đã được lưu thành công!');
      } else {
        console.error('[MajorManager] Failed to save major');
        alert('Lỗi khi lưu chuyên ngành. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('[MajorManager] Error saving major:', error);
      alert(`Lỗi khi lưu chuyên ngành: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubject = async (subject: Subject) => {
    setLoading(true);
    try {
      console.log('[MajorManager] Saving subject:', subject);
      const success = await saveSubject(subject);
      
      if (success) {
        console.log('[MajorManager] Subject saved successfully');
        const subjectsData = await loadSubjectsByMajor(subject.majorId);
        console.log('[MajorManager] Reloaded subjects:', subjectsData);
        setSubjects(prev => ({ ...prev, [subject.majorId]: subjectsData as Subject[] }));
        setShowSubjectForm(false);
        setEditingSubject(null);
        alert('Môn học đã được lưu thành công!');
      } else {
        console.error('[MajorManager] Failed to save subject');
        alert('Lỗi khi lưu môn học. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('[MajorManager] Error saving subject:', error);
      alert(`Lỗi khi lưu môn học: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async (exam: Exam) => {
    setLoading(true);
    try {
      console.log('[MajorManager] Saving exam:', exam);
      const success = await saveExam(exam);
      
      if (success) {
        console.log('[MajorManager] Exam saved successfully');
        console.log('[MajorManager] Reloading exams for subject:', exam.subjectId);
        const examsData = await loadExamsBySubject(exam.subjectId);
        console.log('[MajorManager] Reloaded exams:', examsData);
        setExams(prev => ({ ...prev, [exam.subjectId]: examsData as Exam[] }));
        console.log('[MajorManager] Closing exam form and resetting editingExam');
        setShowExamForm(false);
        setEditingExam(null);
        alert('Đề thi đã được lưu thành công!');
      } else {
        console.error('[MajorManager] Failed to save exam');
        alert('Lỗi khi lưu đề thi. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('[MajorManager] Error saving exam:', error);
      alert(`Lỗi khi lưu đề thi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMajor = async (majorId: string) => {
    if (!confirm('Are you sure you want to delete this major?')) return;
    
    setLoading(true);
    try {
      await deleteMajor(majorId);
      const majorsData = await loadPublicMajors();
      setMajors(majorsData as Major[]);
    } catch (error) {
      console.error('Error deleting major:', error);
      alert('Error deleting major');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    setLoading(true);
    try {
      await deleteSubject(subjectId);
      const subjectsData = await loadSubjectsByMajor(selectedMajor!);
      setSubjects(prev => ({ ...prev, [selectedMajor!]: subjectsData as Subject[] }));
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Error deleting subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    setLoading(true);
    try {
      await deleteExam(examId);
      const examsData = await loadExamsBySubject(selectedSubject!);
      setExams(prev => ({ ...prev, [selectedSubject!]: examsData as Exam[] }));
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Error deleting exam');
    } finally {
      setLoading(false);
    }
  };

  // Filter exams for display based on user plan
  const getFilteredExams = (subjectId: string) => {
    const subjectExams = exams[subjectId] || [];
    return subjectExams.filter(exam => canAccessExamType(exam.examType));
  };

  // Render exams list with plan restrictions
  const renderExamsList = (subjectId: string) => {
    const filteredExams = getFilteredExams(subjectId);
    const allExams = exams[subjectId] || [];
    const restrictedExams = allExams.filter(exam => !canAccessExamType(exam.examType));

    return (
      <div className="space-y-3">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{exam.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{exam.description}</p>
                <div className="flex space-x-2">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                    {exam.totalQuestions} câu hỏi
                  </span>
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                    {exam.timeLimit} phút
                  </span>
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                    exam.examType === 'PE' 
                      ? 'bg-blue-100 text-blue-800' 
                      : exam.examType === 'FE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {exam.examType === 'PE' ? 'PE' : exam.examType === 'FE' ? 'FE' : 'Quizlet'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => {
                    setEditingExam(exam);
                    setShowExamForm(true);
                  }}
                  className="text-purple-600 hover:text-purple-700 p-1 rounded hover:bg-purple-50"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Show restricted exams for Basic users */}
        {!isPro && restrictedExams.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Lock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Đề thi bị giới hạn</span>
            </div>
            <div className="space-y-2">
              {restrictedExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200 opacity-60">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{exam.name}</h4>
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                      exam.examType === 'PE' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {exam.examType === 'PE' ? 'PE' : 'FE'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/upgrade')}
                    className="w-full bg-white text-orange-600 border border-orange-200 hover:border-orange-300 hover:bg-orange-50 py-2 px-3 rounded-full font-medium text-xs transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Nâng cấp gói của bạn ngay!</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {filteredExams.length === 0 && restrictedExams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có đề thi nào</p>
            <p className="text-sm">Click nút + để thêm đề thi</p>
          </div>
        )}
      </div>
    );
  };

  if (userRole !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Chuyên ngành</h1>
            <p className="text-gray-600">Quản lý chuyên ngành, môn học và đề thi theo cấu trúc phân cấp</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={debugAdminStatus}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Debug Admin
            </button>
            <button
              onClick={debugCurrentUserDetails}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Debug User
            </button>
            <button
              onClick={debugDatabaseAccess}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Debug DB
            </button>
            <button
              onClick={handleCreateSampleData}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Creating...' : 'Tạo dữ liệu mẫu'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Chuyên ngành</p>
              <p className="text-2xl font-bold text-blue-900">{majors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Môn học</p>
              <p className="text-2xl font-bold text-green-900">
                {Object.values(subjects).reduce((total, subjectList) => total + subjectList.length, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-600 rounded-lg">
              <FileTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Đề thi</p>
              <p className="text-2xl font-bold text-purple-900">
                {Object.values(exams).reduce((total, examList) => total + examList.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Majors Column */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Chuyên ngành</h2>
            </div>
            <button
              onClick={() => {
                setEditingMajor(null);
                setShowMajorForm(true);
              }}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-3">
            {majors.map((major) => (
              <div
                key={major.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedMajor === major.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMajor(major.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{major.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{major.description}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {major.code}
                    </span>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMajor(major);
                        setShowMajorForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMajor(major.id);
                      }}
                      className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {majors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có chuyên ngành nào</p>
                <p className="text-sm">Click nút + để thêm chuyên ngành đầu tiên</p>
              </div>
            )}
          </div>
        </div>

        {/* Subjects Column */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <BookOpenIcon className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Môn học</h2>
            </div>
            {selectedMajor && (
              <button
                onClick={() => {
                  setEditingSubject(null);
                  setShowSubjectForm(true);
                }}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="p-6">
            {selectedMajor ? (
              <div className="space-y-3">
                {subjects[selectedMajor]?.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSubject === subject.id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{subject.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{subject.description}</p>
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          {subject.code}
                        </span>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubject(subject);
                            setShowSubjectForm(true);
                          }}
                          className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubject(subject.id);
                          }}
                          className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!subjects[selectedMajor] || subjects[selectedMajor].length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có môn học nào</p>
                    <p className="text-sm">Click nút + để thêm môn học</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chọn chuyên ngành để xem môn học</p>
              </div>
            )}
          </div>
        </div>

        {/* Exams Column */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <FileTextIcon className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Đề thi</h2>
            </div>
            {selectedSubject && (
              <button
                onClick={() => {
                  setEditingExam(null);
                  setShowExamForm(true);
                }}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="p-6">
            {selectedSubject ? (
              renderExamsList(selectedSubject)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chọn môn học để xem đề thi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forms */}
      <MajorForm
        isOpen={showMajorForm}
        onClose={() => {
          setShowMajorForm(false);
          setEditingMajor(null);
        }}
        onSave={handleSaveMajor}
        major={editingMajor}
        loading={loading}
      />

      <SubjectForm
        isOpen={showSubjectForm}
        onClose={() => {
          setShowSubjectForm(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        subject={editingSubject}
        majors={majors}
        loading={loading}
      />

      <ExamForm
        isOpen={showExamForm}
        onClose={() => {
          setShowExamForm(false);
          setEditingExam(null);
        }}
        onSave={handleSaveExam}
        exam={editingExam}
        subjects={Object.values(subjects).flat()}
        loading={loading}
      />
    </div>
  );
};

export default MajorManager; 