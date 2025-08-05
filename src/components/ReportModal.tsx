'use client';

import { useState, useEffect } from 'react';
import { reportContent, reportReasons, ReportRequest } from '@/api/report';
import { Button } from './ui/button';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'comment' | 'user' | 'story';
  contentId: string;
  title?: string;
}

export default function ReportModal({ 
  isOpen, 
  onClose, 
  contentType, 
  contentId, 
  title 
}: ReportModalProps) {
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReportReason('');
      setReportDescription('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleReport = async () => {
    if (!reportReason) {
      alert('Please select a reason for reporting');
      return;
    }

    setIsReporting(true);
    try {
      await reportContent({
        type: contentType,
        contentId,
        reason: reportReason as ReportRequest['reason'],
        description: reportDescription.trim() || undefined
      });
      
      alert(`${getContentTypeLabel()} reported successfully`);
      onClose();
    } catch (error: any) {
      console.error(`Error reporting ${contentType}:`, error);
      if (error?.response?.status === 409) {
        alert(`You have already reported this ${contentType}`);
      } else {
        alert(`Failed to report ${contentType}. Please try again.`);
      }
    } finally {
      setIsReporting(false);
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'post': return 'Post';
      case 'comment': return 'Comment';
      case 'user': return 'User';
      case 'story': return 'Story';
      default: return 'Content';
    }
  };

  const getPlaceholderText = () => {
    return `Provide more details about why you're reporting this ${contentType}...`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title || `Report ${getContentTypeLabel()}`}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-600 bg-white"
              disabled={isReporting}
            >
              <option value="" className="text-gray-500">Select a reason</option>
              {reportReasons.map((reason) => (
                <option key={reason.value} value={reason.value} className="text-gray-900">
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder={getPlaceholderText()}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-gray-900 bg-white placeholder-gray-500"
              rows={3}
              disabled={isReporting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isReporting}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReport}
            disabled={!reportReason || isReporting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReporting ? 'Reporting...' : 'Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}