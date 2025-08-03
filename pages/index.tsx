export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Tailwind CSS は動作しています 🎉
        </h1>
        <p className="text-lg text-gray-700">
          このテキストが中央・青背景・太字になっていれば成功です。
        </p>
        <button className="mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          テストボタン
        </button>
      </div>
    </div>
  );
}
