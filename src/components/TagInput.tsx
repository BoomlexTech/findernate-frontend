'use client'
import React, { useState } from 'react'

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
    const [tagInput, setTagInput] = useState('')
    const MAX_TAGS = 15;

    const handleAddTag = () => {
      if (!tagInput.trim()) return;

      // Check if we've reached the maximum number of tags
      if (tags.length >= MAX_TAGS) {
        return; // Don't add more tags if we've reached the limit
      }

      // Split by comma, semicolon, or whitespace and clean each tag
      const rawTags = tagInput.split(/[,;\s]+/);

      const formattedTags = rawTags
        .map(tag => tag.trim()) // Remove whitespace
        .map(tag => tag.replace(/^#+/, '')) // Remove any existing # symbols
        .filter(tag => tag !== '') // Remove empty strings
        .map(tag => tag.toLowerCase()); // Convert to lowercase for consistency

      // Remove duplicates by combining with existing tags
      const uniqueTags = Array.from(new Set([...tags, ...formattedTags]));

      // Limit to maximum number of tags
      const limitedTags = uniqueTags.slice(0, MAX_TAGS);

      setTags(limitedTags);
      setTagInput('');
    };

  const handleRemove = (i: number) => {
    const updated = [...tags]
    updated.splice(i, 1)
    setTags(updated)
  }

  const isAtLimit = tags.length >= MAX_TAGS;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <span className={`text-xs ${isAtLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {tags.length}/{MAX_TAGS}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isAtLimit && handleAddTag()}
          placeholder={isAtLimit ? "Maximum tags reached" : "Add tags separated by commas or spaces"}
          disabled={isAtLimit}
          className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            isAtLimit
              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-black focus:ring-yellow-500'
          }`}
        />
        <button
          type="button"
          onClick={handleAddTag}
          disabled={isAtLimit || !tagInput.trim()}
          className={`px-4 py-2 rounded-md transition-colors ${
            isAtLimit || !tagInput.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 text-black hover:bg-yellow-600'
          }`}
        >
          Add
        </button>
      </div>
      {isAtLimit && (
        <p className="text-xs text-red-500 mt-1">
          Maximum of {MAX_TAGS} tags allowed. Remove some tags to add new ones.
        </p>
      )}

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