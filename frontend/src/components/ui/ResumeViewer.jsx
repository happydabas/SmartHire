import React from 'react';
import { FileText, Download } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export const ResumeViewer = ({
  resume,
  onDownload,
  downloadLoading = false,
  className,
  ...props
}) => {
  if (!resume || !resume.resume_url_or_path) {
    return (
      <Card className={`p-8 border border-dashed border-slate-200 bg-slate-50/50 rounded-3xl text-center space-y-3 ${className}`} {...props}>
        <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-700">Resume Preview Unavailable</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-xs mx-auto">
            This candidate has not attached a valid resume file or the file is temporarily offline.
          </p>
        </div>
      </Card>
    );
  }

  const fileName = resume.resume_file_name || 'candidate_resume.pdf';
  const fileUrl = resume.resume_url_or_path;

  return (
    <Card className={`p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-4 ${className}`} {...props}>
      {/* File Details bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-100/50 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100/50 rounded-xl text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 truncate">
            <h4 className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={fileName}>
              {fileName}
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">PDF DOCUMENT</span>
          </div>
        </div>
        {onDownload && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onDownload}
            isLoading={downloadLoading}
            disabled={downloadLoading}
            className="rounded-xl font-bold flex items-center gap-1.5 py-2 border border-slate-200 hover:bg-slate-100"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Button>
        )}
      </div>

      {/* PDF View embedded frame */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0`}
          className="w-full h-[450px] border-0"
          title="Resume Document Preview"
        />
      </div>
    </Card>
  );
};

export default ResumeViewer;
