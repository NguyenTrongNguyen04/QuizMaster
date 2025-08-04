import React, { useState } from 'react';
import { addAdmin, checkAdminStatus } from '../config/firebase';

const AdminSetup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddAdmin = async () => {
    if (!email) {
      setMessage('Vui lòng nhập email!');
      return;
    }

    setLoading(true);
    try {
      const success = await addAdmin(email);
      if (success) {
        setMessage(`Đã thêm ${email} làm admin thành công!`);
        setEmail('');
      } else {
        setMessage('Có lỗi xảy ra khi thêm admin!');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra!');
    }
    setLoading(false);
  };

  const handleCheckAdmin = async () => {
    if (!email) {
      setMessage('Vui lòng nhập email!');
      return;
    }

    setLoading(true);
    try {
      const isAdmin = await checkAdminStatus(email);
      setMessage(isAdmin ? `${email} là admin!` : `${email} không phải admin!`);
    } catch (error) {
      setMessage('Có lỗi xảy ra!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Thiết lập Admin</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Admin:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@company.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleAddAdmin}
          disabled={loading}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang thêm...' : 'Thêm Admin'}
        </button>
        
        <button
          onClick={handleCheckAdmin}
          disabled={loading}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
        >
          {loading ? 'Đang kiểm tra...' : 'Kiểm tra'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('thành công') || message.includes('là admin') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="text-sm text-gray-600 mt-4">
        <p><strong>Hướng dẫn:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Nhập email của admin</li>
          <li>Click "Thêm Admin" để thêm quyền</li>
          <li>Click "Kiểm tra" để xác nhận</li>
          <li>Admin sẽ có quyền thêm/sửa/xóa nội dung</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSetup; 