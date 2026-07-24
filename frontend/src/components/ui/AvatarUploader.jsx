import React, { useRef, useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';
import Avatar from './Avatar';
import Spinner from './Spinner';

export const AvatarUploader = ({
  src,
  name = '',
  onChange,
  onRemove,
  isLoading = false,
  error = '',
  className = '',
  ...props
}) => {
  const fileInputRef = useRef(null);
  const [internalError, setInternalError] = useState('');

  const handleContainerClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setInternalError('Only JPG, JPEG, and PNG files are accepted.');
      return;
    }

    // Validate size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setInternalError('File exceeds the 2MB size limit.');
      return;
    }

    setInternalError('');
    onChange?.(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  const displayError = error || internalError;

  return (
    <div className="flex flex-col items-center gap-3.5 select-none">
      {/* Circle Photo Container */}
      <div 
        onClick={handleContainerClick}
        className={`relative group cursor-pointer w-28 h-28 rounded-full border-4 border-white shadow-md ring-2 ring-slate-100 flex items-center justify-center overflow-hidden transition-all ${
          isLoading ? 'opacity-70 pointer-events-none' : 'hover:scale-[1.02] hover:ring-blue-100'
        } ${className}`}
        {...props}
      >
        <Avatar
          src={src}
          name={name}
          size="lg"
          className="w-full h-full object-cover"
        />

        {/* Hover overlay uploader control */}
        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isLoading ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            <>
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
            </>
          )}
        </div>

        {/* Loading Spinner override */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        )}
      </div>

      {/* Upload Controls text list */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleContainerClick}
          disabled={isLoading}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:text-slate-400 transition-colors"
        >
          Upload Photo
        </button>
        {src && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isLoading}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 disabled:text-slate-400 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png"
        className="hidden"
      />

      {/* Error message */}
      {displayError && (
        <span className="text-[10.5px] font-bold text-rose-500 animate-fadeIn text-center max-w-xs">
          {displayError}
        </span>
      )}
    </div>
  );
};

export default AvatarUploader;
