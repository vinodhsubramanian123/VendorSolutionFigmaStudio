import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface AnnotationCellProps {
  initialValue: string;
  onSave: (value: string) => void;
}

export const AnnotationCell = React.memo(function AnnotationCell({
  initialValue,
  onSave,
}: AnnotationCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (value !== initialValue) {
      onSave(value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.stopPropagation();
      handleSave();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[40px] flex flex-col justify-center">
      {isEditing ? (
        <div 
          role="presentation"
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 bg-surface-elevated border border-brand-indigo/40 rounded-lg shadow-xl shadow-black/50 p-2 flex flex-col gap-2 min-w-[200px]"
          onClick={e => e.stopPropagation()}
          onKeyDown={e => e.stopPropagation()}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add engineer annotation..."
            className="w-full bg-surface-canvas/50 text-content-primary text-[10px] p-2 rounded border border-white/10 focus:outline-none focus:border-brand-indigo/50 resize-y min-h-[60px]"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={handleCancel}
              className="p-1 rounded hover:bg-white/10 text-content-secondary hover:text-content-primary transition"
              title="Cancel (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 rounded bg-brand-indigo/20 hover:bg-brand-indigo/30 text-brand-indigo border border-brand-indigo/30 transition"
              title="Save (Cmd/Ctrl + Enter)"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          role="button"
          tabIndex={0}
          aria-label={value ? `Edit annotation: ${value}` : 'Add engineer annotation'}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              setIsEditing(true);
            }
          }}
          className="group cursor-text flex items-start w-full min-h-[32px] p-1.5 rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 focus:outline-none focus:border-brand-indigo/50"
        >
          {value ? (
            <div className="flex gap-2 w-full">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo mt-1 shrink-0" />
              <span className="text-[10px] text-content-secondary group-hover:text-content-primary transition-colors line-clamp-2 leading-snug break-words w-full">
                {value}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-content-muted group-hover:text-brand-indigo/70 transition-colors opacity-0 group-hover:opacity-100">
              <Pencil className="w-3 h-3" />
              <span className="text-[9px] uppercase font-bold tracking-wider">Annotate</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
