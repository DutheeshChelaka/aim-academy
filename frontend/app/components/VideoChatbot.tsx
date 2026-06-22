'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface ChunkResult {
  text: string;
  startTime: number;
  endTime: number;
}

interface VideoChatbotProps {
  videoId: string;
  onSeek: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoChatbot({ videoId, onSeek }: VideoChatbotProps) {
  const [question, setQuestion] = useState('');
  const [results, setResults] = useState<ChunkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState(false);

  const ask = async () => {
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setAsked(true);

    try {
      const res = await api.post(`/rag/videos/${videoId}/ask`, {
        question: q,
      });
      setResults(res.data.results || []);
    } catch {
      setError('Search isn\u2019t available right now. Try again in a moment.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Ask about this video
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Find the moment a topic is explained and jump straight to it.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
placeholder="පයිතගරස් කියන්නේ මොකක්ද?"          className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-gray-900"
        />
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-gray-600 bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
          {error}
        </div>
      )}

      {!error && asked && !loading && results.length === 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
          No matching part found. Try rephrasing the question.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onSeek(r.startTime)}
              className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 transition-all group flex gap-3 items-start"
            >
              <span className="flex-shrink-0 px-2.5 py-1 bg-red-100 group-hover:bg-red-600 text-red-700 group-hover:text-white text-xs font-bold rounded-lg transition-colors">
                {formatTime(r.startTime)}
              </span>
              <span className="text-sm text-gray-700 line-clamp-3">
                {r.text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}