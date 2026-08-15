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
    <div className="space-y-3 w-full">
      {label && (
        <span className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5 select-none">
          {label}
        </span>
      )}

      {src ? (
        /* Preview State: Full Box Coverage */
        <div className="space-y-3 w-full">
          <div 
            onClick={handleContainerClick}
            className={`w-full h-48 sm:h-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161e] p-4 flex items-center justify-center shadow-sm overflow-hidden cursor-pointer hover:border-blue-500 transition-all relative group ${
              isLoading ? 'opacity-70 pointer-events-none' : ''
            } ${className}`}
          >
            <img 
              src={src} 
              alt="Company Logo Preview" 
              className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105" 
            />
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                <Spinner size="md" />
              </div>
            )}
          </div>

          {/* Action buttons MOVED OUTSIDE of the logo box */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleContainerClick}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace Logo</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone State */
        <div
          onClick={handleContainerClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 h-48 sm:h-56 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30' 
              : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-[#15161e] hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-400 dark:hover:border-slate-700'
          } ${isLoading ? 'opacity-70 pointer-events-none' : ''} ${className}`}
          {...props}
        >
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-800 dark:text-white">
                Drag and drop your logo, or <span className="text-blue-600 dark:text-blue-400 hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                PNG, JPG, or JPEG (Max 2MB)
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
              <Spinner size="md" />
            </div>
          )}
        </div>
      )}

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
