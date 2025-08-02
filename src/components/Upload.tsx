import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { Question } from '../config/firebase';

interface UploadProps {
  onQuestionsUploaded: (questions: Question[]) => void;
  onClose: () => void;
}

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const Upload: React.FC<UploadProps> = ({ onQuestionsUploaded, onClose }) => {
  const [text, setText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parseQuestions = (inputText: string): ParsedQuestion[] => {
    const questions: ParsedQuestion[] = [];
    const lines = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('[Upload] Parsing lines:', lines);
    
    let currentQuestion: Partial<ParsedQuestion> = {};
    let questionNumber = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`[Upload] Processing line ${i}: "${line}"`);
      
      // Check if this is a question (starts with number and dot)
      if (/^\d+\./.test(line)) {
        console.log(`[Upload] Found question: "${line}"`);
        // Save previous question if exists
        if (currentQuestion.question && currentQuestion.options && currentQuestion.correctAnswer !== undefined) {
          console.log('[Upload] Saving previous question:', currentQuestion);
          questions.push(currentQuestion as ParsedQuestion);
        }
        
        // Start new question
        currentQuestion = {
          question: line.replace(/^\d+\.\s*/, '').trim(),
          options: [],
          correctAnswer: -1
        };
        questionNumber++;
        continue;
      }
      
      // Check if this is an option (starts with A-Z and dot)
      if (/^[A-Z]\./.test(line)) {
        const option = line.replace(/^[A-Z]\.\s*/, '').trim();
        console.log(`[Upload] Found option: "${option}"`);
        if (currentQuestion.options) {
          currentQuestion.options.push(option);
        }
        continue;
      }
      
      // Check if this is the answer line (multiple formats)
      if (line.toLowerCase().startsWith('đáp án:') || 
          line.toLowerCase().startsWith('answer:') ||
          line.toLowerCase().startsWith('correct:')) {
        console.log(`[Upload] Found answer line: "${line}"`);
        // Try multiple regex patterns to find the answer
        let answerMatch = null;
        
        // First, try to find answer after colon (most reliable)
        const afterColon = line.split(':')[1];
        if (afterColon) {
          answerMatch = afterColon.trim().match(/[A-Z]/i);
          console.log(`[Upload] After colon: "${afterColon.trim()}", match:`, answerMatch);
        }
        
        // If no match after colon, try the whole line but exclude common words
        if (!answerMatch) {
          // Exclude common words like ANSWER, ĐÁP, etc.
          const cleanLine = line.replace(/answer|đáp án|correct/gi, '').trim();
          answerMatch = cleanLine.match(/[A-Z]/i);
          console.log(`[Upload] Clean line: "${cleanLine}", match:`, answerMatch);
        }
        
        if (answerMatch) {
          const answerLetter = answerMatch[0].toUpperCase();
          const answerIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
          console.log(`[Upload] Found answer: ${answerLetter} (index: ${answerIndex})`);
          currentQuestion.correctAnswer = answerIndex;
        } else {
          console.log(`[Upload] No answer letter found in line: "${line}"`);
        }
        continue;
      }
      
      // Check for separator line (multiple formats)
      if (line.includes('----------') || line === '---' || line === '====') {
        console.log('[Upload] Found separator, saving question if complete');
        // Save current question if complete
        if (currentQuestion.question && currentQuestion.options && currentQuestion.correctAnswer !== undefined) {
          console.log('[Upload] Saving question at separator:', currentQuestion);
          questions.push(currentQuestion as ParsedQuestion);
        } else {
          console.log('[Upload] Question incomplete at separator:', currentQuestion);
        }
        // Reset for next question
        currentQuestion = {
          question: '',
          options: [],
          correctAnswer: -1
        };
        continue;
      }
      
      // If we have a question but no options yet, this might be continuation of question
      if (currentQuestion.question && (!currentQuestion.options || currentQuestion.options.length === 0)) {
        console.log(`[Upload] Continuing question: "${line}"`);
        currentQuestion.question += ' ' + line;
      }
    }
    
    // Don't forget the last question
    if (currentQuestion.question && currentQuestion.options && currentQuestion.correctAnswer !== undefined) {
      console.log('[Upload] Saving last question:', currentQuestion);
      questions.push(currentQuestion as ParsedQuestion);
    } else if (currentQuestion.question) {
      console.log('[Upload] Last question incomplete:', currentQuestion);
    }
    
    console.log('[Upload] Final parsed questions:', questions);
    return questions;
  };

  const handleParse = () => {
    if (!text.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi');
      return;
    }

    setIsParsing(true);
    setError('');
    setSuccess('');

    try {
      // Auto-convert old format to new format
      let processedText = text;
      
      // Convert "Đáp án:" to "ANSWER:"
      processedText = processedText.replace(/Đáp án:/gi, 'ANSWER:');
      
      // Convert "----------" to "===="
      processedText = processedText.replace(/----------/g, '====');
      
      console.log('[Upload] Processed text:', processedText);

      // Test with your specific data to debug
      const testData = `13. Which of the following is not one of the eight key principles of total quality management?
A. Strive for zero defects.
B. Define quality in terms of customers and their requirements
C. Focus on output rather than process.
D. Make quality everyone's responsibility.
E. Stress objective rather than subjective analysis.
ANSWER: C
====
14. _____ is the process of identifying how many and which suppliers a buyer will maintain.
A. Supply base optimization
B. Supply base rationalization
C. Six Sigma
D. Zero defects
E. Strategic sourcing
ANSWER: B
====
15. Maintaining multiple suppliers for each item can actually increase the probability and level of risk.
A. True
B. False
ANSWER: A`;

      console.log('[Upload] Testing with your data...');
      const testQuestions = parseQuestions(testData);
      console.log('[Upload] Test parse result:', testQuestions);

      const questions = parseQuestions(processedText);
      console.log('[Upload] Parsed questions:', questions);
      
      if (questions.length === 0) {
        setError('Không thể parse được câu hỏi nào. Vui lòng kiểm tra format.');
        setIsParsing(false);
        return;
      }

      // Validate questions
      const validQuestions = questions.filter(q => {
        const hasQuestion = !!q.question;
        const hasEnoughOptions = q.options.length >= 2;
        const hasValidAnswer = q.correctAnswer >= 0 && q.correctAnswer < q.options.length;
        
        const isValid = hasQuestion && hasEnoughOptions && hasValidAnswer;
        
        console.log('[Upload] Validating question:', {
          question: q.question,
          optionsCount: q.options.length,
          correctAnswer: q.correctAnswer,
          hasQuestion,
          hasEnoughOptions,
          hasValidAnswer,
          isValid
        });
        
        if (!isValid) {
          console.log('[Upload] Invalid question details:', {
            question: q.question,
            optionsCount: q.options.length,
            correctAnswer: q.correctAnswer,
            hasQuestion,
            hasEnoughOptions,
            hasValidAnswer
          });
        }
        
        return isValid;
      });

      console.log('[Upload] Valid questions:', validQuestions.length, 'Total:', questions.length);
      console.log('[Upload] All questions before validation:', questions);
      console.log('[Upload] Valid questions after validation:', validQuestions);

      if (validQuestions.length !== questions.length) {
        setError(`Có ${questions.length - validQuestions.length} câu hỏi không hợp lệ. Vui lòng kiểm tra lại.`);
      }

      setParsedQuestions(validQuestions);
      setSuccess(`Đã parse thành công ${validQuestions.length} câu hỏi`);
    } catch (error) {
      console.error('[Upload] Parse error:', error);
      setError('Có lỗi xảy ra khi parse câu hỏi');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpload = () => {
    if (parsedQuestions.length === 0) {
      setError('Không có câu hỏi nào để upload');
      return;
    }

    // Convert to Question format
    const questions: Question[] = parsedQuestions.map((q, index) => {
      const question = {
        id: `uploaded-${Date.now()}-${index}`,
        examId: '', // Will be set by parent component
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: '',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        category: '',
        createdAt: new Date().toISOString()
      };
      
      console.log(`[Upload] Created question ${index + 1}:`, {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        finalQuestion: question
      });
      
      return question;
    });

    onQuestionsUploaded(questions);
    setSuccess('Đã upload thành công!');
    
    // Reset form
    setTimeout(() => {
      setText('');
      setParsedQuestions([]);
      setSuccess('');
      onClose();
    }, 1500);
  };

  const handleClear = () => {
    setText('');
    setParsedQuestions([]);
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UploadIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Câu Hỏi</h2>
              <p className="text-sm text-gray-600">Nhập câu hỏi theo format chuẩn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Format Example */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Format chuẩn:
            </h3>
            <div className="text-sm text-blue-800 font-mono bg-white p-3 rounded border">
{`1. Which of the following is not one of the eight key principles of total quality management?
A. Strive for zero defects.
B. Define quality in terms of customers and their requirements
C. Focus on output rather than process.
D. Make quality everyone's responsibility.
E. Stress objective rather than subjective analysis.
ANSWER: C
====
2. _____ is the process of identifying how many and which suppliers a buyer will maintain.
A. Supply base optimization
B. Supply base rationalization
C. Six Sigma
D. Zero defects
E. Strategic sourcing
ANSWER: B
====
3. Maintaining multiple suppliers for each item can actually increase the probability and level of risk.
A. True
B. False
ANSWER: A`}
            </div>
          </div>

          {/* Text Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung câu hỏi:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập câu hỏi theo format trên..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={handleParse}
              disabled={isParsing || !text.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isParsing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span>Parse Câu Hỏi</span>
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Xóa
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          )}

          {/* Parsed Questions Preview */}
          {parsedQuestions.length > 0 && (
            <div className="border border-gray-200 rounded-lg">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Preview ({parsedQuestions.length} câu hỏi):
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {parsedQuestions.map((q, index) => (
                  <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="font-medium text-gray-900 mb-2">
                      {index + 1}. {q.question}
                    </div>
                    <div className="space-y-1">
                      {q.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`text-sm ${
                            optIndex === q.correctAnswer 
                              ? 'text-green-700 font-semibold' 
                              : 'text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === q.correctAnswer && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Đúng
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {parsedQuestions.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleUpload}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UploadIcon className="h-4 w-4" />
                <span>Upload {parsedQuestions.length} Câu Hỏi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload; 