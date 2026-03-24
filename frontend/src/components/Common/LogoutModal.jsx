import React from 'react';

const LogoutModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
        <p className="text-sm text-gray-600 mt-2">Are you sure you want to logout?</p>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 text-gray-700">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 rounded bg-primary-500 text-white">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
