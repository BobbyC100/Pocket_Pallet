import { v4 as uuidv4 } from 'uuid';

const ANONYMOUS_ID_KEY = 'banyan_anonymous_id';
const DRAFTS_KEY = 'banyan_drafts';

/**
 * Get or create an anonymous user ID
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  
  let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);
  
  if (!anonymousId) {
    anonymousId = `anon_${uuidv4()}`;
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
  }
  
  return anonymousId;
}

/**
 * Clear the anonymous ID (after successful account upgrade)
 */
export function clearAnonymousId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ANONYMOUS_ID_KEY);
}

/**
 * Save a draft to localStorage
 */
export interface Draft {
  id: string;
  type: 'brief' | 'vision_statement' | 'vision_framework_v2' | 'executive_onepager' | 'vc_summary';
  title?: string;
  contentJson: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export function saveDraft(draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>): Draft {
  if (typeof window === 'undefined') throw new Error('saveDraft can only be called on client');
  
  const drafts = getAllDrafts();
  const now = new Date().toISOString();
  
  const newDraft: Draft = {
    id: `draft_${uuidv4()}`,
    ...draft,
    createdAt: now,
    updatedAt: now,
  };
  
  drafts.push(newDraft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  
  return newDraft;
}

/**
 * Update an existing draft
 */
export function updateDraft(draftId: string, updates: Partial<Omit<Draft, 'id' | 'createdAt'>>): Draft | null {
  if (typeof window === 'undefined') throw new Error('updateDraft can only be called on client');
  
  const drafts = getAllDrafts();
  const draftIndex = drafts.findIndex(d => d.id === draftId);
  
  if (draftIndex === -1) return null;
  
  const updatedDraft: Draft = {
    ...drafts[draftIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  drafts[draftIndex] = updatedDraft;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  
  return updatedDraft;
}

/**
 * Get all drafts for the current anonymous user
 */
export function getAllDrafts(): Draft[] {
  if (typeof window === 'undefined') return [];
  
  const draftsStr = localStorage.getItem(DRAFTS_KEY);
  if (!draftsStr) return [];
  
  try {
    return JSON.parse(draftsStr);
  } catch (error) {
    console.error('Failed to parse drafts:', error);
    return [];
  }
}

/**
 * Get a specific draft by ID
 */
export function getDraft(draftId: string): Draft | null {
  const drafts = getAllDrafts();
  return drafts.find(d => d.id === draftId) || null;
}

/**
 * Delete a draft
 */
export function deleteDraft(draftId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const drafts = getAllDrafts();
  const filteredDrafts = drafts.filter(d => d.id !== draftId);
  
  if (filteredDrafts.length === drafts.length) return false;
  
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filteredDrafts));
  return true;
}

/**
 * Clear all drafts (after successful migration to account)
 */
export function clearAllDrafts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFTS_KEY);
}

/**
 * Get drafts ready for migration to authenticated account
 */
export function getDraftsForMigration(): Array<Omit<Draft, 'id'>> {
  const drafts = getAllDrafts();
  return drafts.map(({ id, ...draft }) => draft);
}

/**
 * Auto-save functionality for debounced saving
 */
let autoSaveTimeout: NodeJS.Timeout | null = null;

export function autoSaveDraft(
  draftId: string | null,
  draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>,
  debounceMs: number = 1000
): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = setTimeout(() => {
    if (draftId) {
      updateDraft(draftId, draft);
    } else {
      saveDraft(draft);
    }
  }, debounceMs);
}

