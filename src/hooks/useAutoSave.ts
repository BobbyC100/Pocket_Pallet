import { useEffect, useRef, useState, useCallback } from 'react';
import { saveDraft, updateDraft } from '@/lib/anonymous-session';

interface AutoSaveOptions {
  debounceMs?: number;
  enabled?: boolean;
  onSave?: (draftId: string) => void;
  onError?: (error: Error) => void;
}

interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Hook for auto-saving drafts with debouncing
 * 
 * @param data - Data to save
 * @param options - Configuration options
 * @returns Auto-save status and manual save function
 */
export function useAutoSave<T>(
  data: T | null,
  options: AutoSaveOptions = {}
) {
  const {
    debounceMs = 3000, // 3 seconds default
    enabled = true,
    onSave,
    onError
  } = options;

  const [draftId, setDraftId] = useState<string | null>(null);
  const [status, setStatus] = useState<AutoSaveStatus>({
    status: 'idle',
    lastSaved: null,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async (dataToSave: T, currentDraftId: string | null) => {
    if (isSavingRef.current) {
      console.log('🔄 Save already in progress, skipping...');
      return;
    }

    try {
      isSavingRef.current = true;
      setStatus(prev => ({ ...prev, status: 'saving', error: null }));

      const draft = currentDraftId
        ? updateDraft(currentDraftId, {
            contentJson: dataToSave,
            metadata: { 
              autoSaved: true, 
              timestamp: new Date().toISOString() 
            }
          })
        : saveDraft({
            type: 'brief',
            title: 'Auto-saved Draft',
            contentJson: dataToSave,
            metadata: { 
              autoSaved: true, 
              timestamp: new Date().toISOString() 
            }
          });

      if (draft) {
        const newDraftId = draft.id;
        setDraftId(newDraftId);
        setStatus({
          status: 'saved',
          lastSaved: new Date(),
          error: null
        });

        console.log(`✅ Auto-saved draft: ${newDraftId}`);
        onSave?.(newDraftId);

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus(prev => ({ ...prev, status: 'idle' }));
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      console.error('❌ Auto-save error:', error);
      
      setStatus({
        status: 'error',
        lastSaved: null,
        error: errorMessage
      });
      
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onError]);

  useEffect(() => {
    // Don't save if disabled or no data
    if (!enabled || !data) {
      return;
    }

    // Don't save if data hasn't changed
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      lastDataRef.current = data;
      save(data, draftId);
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, draftId, save]);

  // Manual save function (no debounce)
  const saveNow = useCallback(() => {
    if (data && enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      lastDataRef.current = data;
      save(data, draftId);
    }
  }, [data, enabled, draftId, save]);

  return {
    status,
    draftId,
    saveNow,
    setDraftId // Allow external setting of draft ID
  };
}

/**
 * Format auto-save status for display
 */
export function formatAutoSaveStatus(status: AutoSaveStatus): string {
  switch (status.status) {
    case 'saving':
      return 'Saving...';
    case 'saved':
      if (status.lastSaved) {
        const seconds = Math.floor((Date.now() - status.lastSaved.getTime()) / 1000);
        if (seconds < 60) {
          return 'Saved just now';
        } else if (seconds < 3600) {
          const minutes = Math.floor(seconds / 60);
          return `Saved ${minutes}m ago`;
        }
      }
      return 'Saved';
    case 'error':
      return status.error || 'Error saving';
    default:
      return '';
  }
}

