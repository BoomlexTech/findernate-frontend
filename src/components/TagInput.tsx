'use client'
import React, { useState } from 'react'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
    const [tagInput, setTagInput] = useState('')

    const handleAddTag = () => {
      if (!tagInput.trim()) return;
    
      // Split by comma, semicolon, or whitespace and clean each tag
      const rawTags = tagInput.split(/[,;\s]+/);
    
      const formattedTags = rawTags
        .map(tag => tag.trim()) // Remove whitespace
        .map(tag => tag.replace(/^#+/, '')) // Remove any existing # symbols
        .filter(tag => tag !== '') // Remove empty strings
        .map(tag => tag.toLowerCase()); // Convert to lowercase for consistency
    
      // Remove duplicates by combining with existing tags
      const uniqueTags = Array.from(new Set([...tags, ...formattedTags]));
    
      setTags(uniqueTags);
      setTagInput('');
    };

  const handleRemove = (i: number) => {
    const updated = [...tags]
    updated.splice(i, 1)
    setTags(updated)
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          placeholder="Add tags separated by commas or spaces"
          className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
        >
          Add
        </button>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagInput