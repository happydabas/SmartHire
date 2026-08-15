import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const SegmentedDateInput = ({
  label,
  id,
  value = '',
  onChange,
  error,
  disabled = false,
  required = false,
  className
}) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const dateInputRef = useRef(null);

  // Sync internal DD, MM, YYYY states when value prop (YYYY-MM-DD) changes externally
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
        return;
      }
    }
    if (!value) {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  const updateParentDate = (d, m, y) => {
    if (d && m && y && y.length === 4) {
      const formattedDate = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      onChange?.({ target: { id, value: formattedDate } });
    } else if (!d && !m && !y) {
      onChange?.({ target: { id, value: '' } });
    }
  };

  const handleDayChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(val);
    updateParentDate(val, month, year);
    if (val.length === 2) {
      // Auto advance to month input
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  };

  const handleMonthChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(val);
    updateParentDate(day, val, year);
    if (val.length === 2) {
      // Auto advance to year input
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  };

  const handleYearChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(val);
    updateParentDate(day, month, val);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Backspace') {
      if (field === 'month' && !month) {
        dayRef.current?.focus();
      } else if (field === 'year' && !year) {
        monthRef.current?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (field === 'day') monthRef.current?.focus();
      if (field === 'month') yearRef.current?.focus();
    } else if (e.key === 'ArrowLeft') {
      if (field === 'year') monthRef.current?.focus();
      if (field === 'month') dayRef.current?.focus();
    }
  };

  const handleNativePickerChange = (e) => {
    const pickerVal = e.target.value; // YYYY-MM-DD
    if (pickerVal) {
      const parts = pickerVal.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
        onChange?.({ target: { id, value: pickerVal } });
      }
    }
  };

  const clearDate = () => {
    setDay('');
    setMonth('');
    setYear('');
    onChange?.({ target: { id, value: '' } });
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-500 dark:text-slate-400 select-none uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div
        className={twMerge(
          'w-full px-3 py-2 bg-white dark:bg-[#15161e] border rounded-2xl transition-all flex items-center justify-between gap-2 focus-within:ring-2',
          error
            ? 'border-red-400 focus-within:ring-red-400/20 focus-within:border-red-500'
            : 'border-slate-200 dark:border-slate-800 focus-within:ring-blue-500/20 focus-within:border-blue-500 hover:border-slate-300 dark:hover:border-slate-700',
          disabled && 'opacity-60 pointer-events-none bg-slate-50 dark:bg-slate-850/40',
          className
        )}
      >
        <div className="flex items-center gap-1.5 text-sm text-slate-800 dark:text-slate-200 font-medium">
          {/* Day Input */}
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            placeholder="DD"
            value={day}
            onChange={handleDayChange}
            onKeyDown={(e) => handleKeyDown(e, 'day')}
            disabled={disabled}
            className="w-8 text-center bg-transparent focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-950/40 rounded-md py-1 font-semibold placeholder:text-slate-400"
          />
          <span className="text-slate-300 dark:text-slate-600 font-bold">/</span>

          {/* Month Input */}
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            placeholder="MM"
            value={month}
            onChange={handleMonthChange}
            onKeyDown={(e) => handleKeyDown(e, 'month')}
            disabled={disabled}
            className="w-8 text-center bg-transparent focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-950/40 rounded-md py-1 font-semibold placeholder:text-slate-400"
          />
          <span className="text-slate-300 dark:text-slate-600 font-bold">/</span>

          {/* Year Input */}
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            placeholder="YYYY"
            value={year}
            onChange={handleYearChange}
            onKeyDown={(e) => handleKeyDown(e, 'year')}
            disabled={disabled}
            className="w-12 text-center bg-transparent focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-950/40 rounded-md py-1 font-semibold placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1">
          {(day || month || year) && !disabled && (
            <button
              type="button"
              onClick={clearDate}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear Date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Native HTML5 Calendar Picker Launcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
              disabled={disabled}
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Select from Calendar"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={value}
              onChange={handleNativePickerChange}
              disabled={disabled}
              className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>
      )}
    </div>
  );
};

export default SegmentedDateInput;
