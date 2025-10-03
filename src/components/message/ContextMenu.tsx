import React from 'react';
import { Trash2 } from 'lucide-react';

interface ContextMenuProps {
  messageId: string;
  x: number;
  y: number;
  onDelete: (messageId: string) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  messageId,
  x,
  y,
  onDelete,
  onClose
}) => {
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]"
        style={{
          left: x,
          top: y,
          transform: 'translate(-50%, -10px)'
        }}
      >
        <button
          onClick={() => onDelete(messageId)}
          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </>
  );
};