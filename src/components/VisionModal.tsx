'use client';

import { useState } from 'react';

interface VisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (visionPurpose: string, visionEndState: string) => void;
}

export default function VisionModal({ isOpen, onClose, onSubmit }: VisionModalProps) {
  const [visionPurpose, setVisionPurpose] = useState('');
  const [visionEndState, setVisionEndState] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (visionPurpose.trim() && visionEndState.trim()) {
      onSubmit(visionPurpose.trim(), visionEndState.trim());
      setVisionPurpose('');
      setVisionEndState('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Complete Your Vision</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          To create your Vision Framework, we need two more pieces to complete your vision:
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Vision: Purpose
            </label>
            <p className="text-gray-400 text-sm mb-3">
              Why does your company exist? What is the fundamental reason you're building this?
            </p>
            <textarea
              value={visionPurpose}
              onChange={(e) => setVisionPurpose(e.target.value)}
              placeholder="e.g., To eliminate construction site delivery delays that waste time and money"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 resize-none h-24"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {visionPurpose.length}/200 characters
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Vision: End State
            </label>
            <p className="text-gray-400 text-sm mb-3">
              What does success look like when you've achieved your mission? Paint the end-state in 2-3 sentences.
            </p>
            <textarea
              value={visionEndState}
              onChange={(e) => setVisionEndState(e.target.value)}
              placeholder="e.g., A world where every construction site receives materials exactly when and where needed, eliminating costly delays and improving project efficiency across the industry."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 resize-none h-32"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {visionEndState.length}/500 characters
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!visionPurpose.trim() || !visionEndState.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Vision Framework
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
