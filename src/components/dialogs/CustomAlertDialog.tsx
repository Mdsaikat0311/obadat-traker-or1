import React from 'react';

interface CustomAlertDialogProps {
  title: string;
  message: string;
  isSuccess: boolean;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onDismiss: () => void;
}

export const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  title,
  message,
  isSuccess,
  isConfirm = false,
  onConfirm,
  onDismiss
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs">
        <h3
          className={`text-lg font-bold mb-2 ${
            !isSuccess && isConfirm ? 'text-red-600' : 'text-gray-900'
          }`}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end space-x-2">
          {isConfirm && (
            <button
              type="button"
              onClick={onDismiss}
              className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              বাতিল করুন
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isConfirm && onConfirm) {
                onConfirm();
              } else {
                onDismiss();
              }
            }}
            className={`py-2 px-4 rounded-lg text-white font-medium transition cursor-pointer ${
              isConfirm ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isConfirm ? 'নিশ্চিত করুন' : 'ঠিক আছে'}
          </button>
        </div>
      </div>
    </div>
  );
};
