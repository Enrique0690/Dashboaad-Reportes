export function Spinner() {
  return (
    <div className="w-full h-full inset-0 flex items-center justify-center z-50">
      <div className="inset-0 bg-gray-200 bg-opacity-20 backdrop-blur-sm"></div>
      <div className="relative">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
