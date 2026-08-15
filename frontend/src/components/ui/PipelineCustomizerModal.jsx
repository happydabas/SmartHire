import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Layers, ArrowUp, ArrowDown, Plus, Trash2, Edit2, RotateCcw, X, Check } from 'lucide-react';
import Button from './Button';

const DEFAULT_STAGES = ['Applied', 'Screening', 'Technical Interview', 'HR Interview', 'Offer'];

export const PipelineCustomizerModal = ({
  isOpen,
  onClose,
  initialStages = DEFAULT_STAGES,
  onSaveStages
}) => {
  const [stages, setStages] = useState([]);
  const [newStageName, setNewStageName] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Sync initial stages
  useEffect(() => {
    if (initialStages && initialStages.length > 0) {
      setStages([...initialStages]);
    } else {
      setStages([...DEFAULT_STAGES]);
    }
  }, [initialStages, isOpen]);

  // Lock body scroll when popup is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...stages];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setStages(updated);
  };

  const handleMoveDown = (index) => {
    if (index === stages.length - 1) return;
    const updated = [...stages];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setStages(updated);
  };

  const handleDeleteStage = (index) => {
    if (stages.length <= 1) {
      alert('A hiring pipeline must contain at least one stage.');
      return;
    }
    const updated = stages.filter((_, i) => i !== index);
    setStages(updated);
  };

  const handleAddStage = (e) => {
    e?.preventDefault();
    const trimmed = newStageName.trim();
    if (!trimmed) return;
    setStages([...stages, trimmed]);
    setNewStageName('');
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingValue(stages[index]);
  };

  const saveEditing = (index) => {
    const trimmed = editingValue.trim();
    if (trimmed) {
      const updated = [...stages];
      updated[index] = trimmed;
      setStages(updated);
    }
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleReset = () => {
    setStages([...DEFAULT_STAGES]);
  };

  const handleSave = () => {
    if (stages.length === 0) {
      alert('Pipeline must have at least one stage.');
      return;
    }
    onSaveStages?.(stages);
    onClose?.();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Blurred Backdrop Overlay covering the whole screen */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Centered Modal Card Box */}
      <div className="relative z-10 bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Customize Hiring Pipeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rearrange, rename, or add custom recruitment stages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Add New Stage Control */}
          <form onSubmit={handleAddStage} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Behavioral Screening, Assignment, Technical Trial..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#0d1017] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!newStageName.trim()}
              className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stage</span>
            </Button>
          </form>

          {/* List of Stages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Sequence ({stages.length} Stages)</span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer lowercase first-letter:uppercase"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="space-y-2">
              {stages.map((stage, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === stages.length - 1;
                const isEditing = editingIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50/80 dark:bg-[#0d1017] border border-slate-200 dark:border-slate-800/80 rounded-2xl group hover:border-blue-200 dark:hover:border-blue-900 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-black shrink-0">
                        {idx + 1}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(idx);
                              if (e.key === 'Escape') setEditingIndex(null);
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-blue-400 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => saveEditing(idx)}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            title="Save Stage Name"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="p-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-300 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {stage}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={isFirst}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={isLast}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Edit Stage Name */}
                        <button
                          type="button"
                          onClick={() => startEditing(idx)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Rename Stage"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Stage */}
                        <button
                          type="button"
                          onClick={() => handleDeleteStage(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Stage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-[#15161e] border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 font-bold border border-slate-200 dark:border-slate-800"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="rounded-xl px-5 py-2.5 font-bold"
          >
            Save Pipeline
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PipelineCustomizerModal;
