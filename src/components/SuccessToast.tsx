import { Check } from 'lucide-react';

export default function SuccessToast({ show, message = "Post created successfully!" }: { show: boolean, message: string }) {
  if (!show) return null;
  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-3 shadow-lg animate-in fade-in duration-300">
      <Check className="w-6 h-6 text-white" />
      <span className="font-semibold">{message}</span>
    </div>
  );
}
