import React, { useRef, useState } from 'react';
import { UploadCloud, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import Spinner from './Spinner';

export const ImageUploader = ({
  src,
  label = 'Upload Company Logo',
  onChange,
  onRemove,
  isLoading = false,
  error = '',
  className = '',
  ...props
}) => {
  const fileInputRef = useRef(null);
  const [internalError, setInternalError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleContainerClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const processFile = (file) => {
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

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isLoading) {
      processFile(e.dataTransfer.files?.[0]);
    }
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
    <div className="space-y-2.5 w-full">
      {label && (
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pl-0.5 select-none">
          {label}
        </span>
      )}

      <div
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50/30' 
            : src 
              ? 'border-slate-200 bg-white hover:border-blue-400' 
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
        } ${isLoading ? 'opacity-70 pointer-events-none' : ''} ${className}`}
        {...props}
      >
        {src ? (
          /* Preview state */
          <div className="flex flex-col items-center gap-4 py-2 w-full">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm flex items-center justify-center p-1.5">
              <img src={src} alt="Upload Preview" className="max-w-full max-h-full object-contain" />
            </div>
            
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace Logo</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          /* Dropzone state */
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <UploadCloud className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-700">
                Drag and drop your logo, or <span className="text-blue-600 hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                PNG, JPG, or JPEG (Max 2MB)
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center rounded-2xl">
            <Spinner size="md" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png"
        className="hidden"
      />

      {/* Inline validation errors */}
      {displayError && (
        <span className="block text-[10.5px] font-bold text-rose-500 animate-fadeIn pl-0.5">
          {displayError}
        </span>
      )}
    </div>
  );
};

export default ImageUploader;
