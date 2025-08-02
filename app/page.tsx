import { Suspense } from 'react';
import Dashboard from './components/Dashboard';
import { Loader2 } from 'lucide-react';

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 1800; // 30 minutes

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading CryptoMood</h2>
        <p className="text-gray-600">Preparing Bitcoin sentiment analysis...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Dashboard />
    </Suspense>
  );
}