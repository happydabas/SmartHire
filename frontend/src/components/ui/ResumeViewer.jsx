import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Spinner from './Spinner';
import { applicationService } from '@/services/applications/applicationService';
import { resumeService } from '@/services/resume/resumeService';

export const ResumeViewer = ({
  resume,
  applicationId,
  onDownload,
  downloadLoading = false,
  className,
  ...props
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const rawUrl = resume?.resume_url_or_path || resume?.file_path || resume?.url;
  const fileName = resume?.resume_file_name || resume?.file_name || 'candidate_resume.pdf';

  useEffect(() => {
    let active = true;
    let createdUrl = null;

    const loadPdfBlob = async () => {
      // If rawUrl is already a blob: URL, use it directly
      if (rawUrl && rawUrl.startsWith('blob:')) {
        if (active) {
          setBlobUrl(rawUrl);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        let url = null;
        if (applicationId || resume?.application_id) {
          url = await applicationService.getResumeFileUrl(applicationId || resume?.application_id);
        } else {
          url = await resumeService.getResumeFileUrl();
        }
        if (active && url) {
          createdUrl = url;
          setBlobUrl(url);
        }
      } catch (err) {
        console.error("Error loading resume blob:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPdfBlob();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [applicationId, resume?.id, rawUrl]);

  if (!resume && !applicationId && !rawUrl) {
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

  return (
    <Card className={`p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-4 ${className}`} {...props}>
      {/* File Details bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate" title={fileName}>
              {fileName}
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">PDF DOCUMENT</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {blobUrl && (
            <button
              type="button"
              onClick={() => window.open(blobUrl, '_blank')}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Fullscreen PDF</span>
            </button>
          )}

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              disabled={downloadLoading}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF View embedded frame */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900 h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Spinner className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading candidate resume PDF...</p>
          </div>
        ) : blobUrl ? (
          <iframe
            src={blobUrl}
            title="Resume PDF Preview"
            className="w-full h-full rounded-2xl border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-2 p-6 text-center">
            <FileText className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unable to load PDF document preview.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResumeViewer;
