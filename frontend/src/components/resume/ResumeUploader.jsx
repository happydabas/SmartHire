import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

export function ResumeUploader({ onUpload, loading, error }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;
    const allowed = ['.pdf', '.docx'];
    const suffix = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowed.includes(suffix)) {
      setValidationError("Invalid format. Only PDF and DOCX files are allowed.");
      return false;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      setValidationError("File exceeds maximum permitted limit (20MB).");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onUpload(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onUpload(file);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const displayError = validationError || error;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center transition-all ${
          dragActive 
            ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10' 
            : 'border-slate-200 bg-white hover:border-slate-350 dark:bg-slate-900 dark:border-slate-800'
        }`}
      >
        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 dark:bg-blue-950/20">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
          Upload Your Resume
        </h3>
        <p className="text-xs text-slate-450 font-bold mt-1 mb-6 dark:text-slate-500">
          Drag & drop your file here, or browse files (PDF, DOCX up to 20MB)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          disabled={loading}
        />

        <Button
          variant="primary"
          onClick={onButtonClick}
          disabled={loading}
          className="rounded-xl font-black px-6 py-2.5"
        >
          Browse Files
        </Button>
      </div>

      {displayError && (
        <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl dark:bg-rose-950/10 dark:border-rose-950/20 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

export default ResumeUploader;
