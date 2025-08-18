"use client";

interface Props {
  onEditAccount: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export default function AccountMenuDropdown({
  onEditAccount,
  onLogout,
  onClose,
}: Props) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
      <button
        className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        onClick={() => {
          onClose();
          onEditAccount();
        }}
      >
        アカウント情報の変更
      </button>
      <button
        className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        onClick={() => {
          onClose();
          onLogout();
        }}
      >
        ログアウト
      </button>
    </div>
  );
}
