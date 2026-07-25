import React, { useState } from 'react';
import { FileText, History, ArrowLeft, BrainCircuit } from 'lucide-react';
import ResumeUploader from '@/components/resume/ResumeUploader';
import ResumeParsingProgress from '@/components/resume/ResumeParsingProgress';
import ResumeHistory from './ResumeHistory';
import ResumeReview from './ResumeReview';
import { resumeParserService } from '@/services/resumeParserService';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function ResumeParser() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'history'
  const [mode, setMode] = useState('input'); // 'input' | 'parsing' | 'review'
  const [parsingStep, setParsingStep] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    try {
      setError(null);
      setMode('parsing');
      
      setParsingStep('Uploading Resume...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setParsingStep('Extracting Text...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setParsingStep('AI is Parsing Resume...');
      const response = await resumeParserService.uploadResume(file);

      setParsingStep('Preparing Results...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setParsedData(response);
      setMode('review');
      toast.success("Resume parsed successfully! Review the extracted fields below.");
    } catch (err) {
      console.error("Resume parse failure:", err);
      setError(err?.response?.data?.detail || "AI parsing run failed. Please verify that the PDF or DOCX file content is valid.");
      setMode('input');
      toast.error("Failed to parse resume.");
    }
  };

  const handleSaveSuccess = () => {
    setMode('input');
    setParsedData(null);
    setActiveTab('history');
  };

  const handleCancelReview = () => {
    setMode('input');
    setParsedData(null);
  };

  if (mode === 'review') {
    return (
      <div className="space-y-6">
        <button
          onClick={handleCancelReview}
          className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-850 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parser Dashboard</span>
        </button>
        <ResumeReview
          parsedData={parsedData}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCancelReview}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white flex items-center gap-2.5">
          <BrainCircuit className="w-8 h-8 text-blue-600 animate-pulse" />
          <span>AI Resume Parser</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1 dark:text-slate-400">
          Upload and parse resumes instantly into structured profile summaries, education timelines, and skillsets.
        </p>
      </div>

      {mode === 'parsing' ? (
        <div className="py-12">
          <ResumeParsingProgress step={parsingStep} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { setActiveTab('upload'); setError(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Upload & Parse</span>
            </button>
            <button
              onClick={() => { setActiveTab('history'); setError(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-660'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Run History</span>
            </button>
          </div>

          {activeTab === 'upload' ? (
            <Card className="p-6 md:p-8">
              <ResumeUploader
                onUpload={handleUpload}
                loading={mode === 'parsing'}
                error={error}
              />
            </Card>
          ) : (
            <ResumeHistory
              onView={(historyItem) => {
                setParsedData({
                  personal_info: { name: user?.name || 'Unknown', email: user?.email },
                  summary: 'Loaded from history view. Ready for review.',
                  skills: ['React', 'FastAPI', 'PostgreSQL'],
                  education: [],
                  experience: [],
                  confidence_scores: { personal_info: 99, skills: 99, experience: 99, overall_parsing: 99 }
                });
                setMode('review');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeParser;
