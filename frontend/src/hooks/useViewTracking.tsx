import { useEffect, useRef, useCallback } from 'react';
import publicApi from '@/lib/publicApi';

interface UseViewTrackingOptions {
  leadId: string;
  threshold?: number;
  debounceMs?: number;
}

interface ViewTracker {
  ref: React.RefObject<HTMLDivElement | null>;
}

// Global set to track which leads have already been viewed in this session
const viewedLeads = new Set<string>();

// Debounce map to prevent multiple calls for the same lead
const debounceMap = new Map<string, NodeJS.Timeout>();

export const useViewTracking = ({ 
  leadId, 
  threshold = 0.5, 
  debounceMs = 1000 
}: UseViewTrackingOptions): ViewTracker => {
  const ref = useRef<HTMLDivElement>(null);

  const incrementView = useCallback(async (id: string) => {
    // Check if this lead has already been viewed in this session
    if (viewedLeads.has(id)) {
      return;
    }

    // Clear any existing debounce for this lead
    const existingTimeout = debounceMap.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set up new debounced call
    const timeoutId = setTimeout(async () => {
      try {
        await publicApi.incrementLeadView(id);
        viewedLeads.add(id); // Mark as viewed
        debounceMap.delete(id); // Clean up timeout reference
      } catch (error) {
        console.error('Failed to increment view:', error);
        debounceMap.delete(id); // Clean up even on error
      }
    }, debounceMs);

    debounceMap.set(id, timeoutId);
  }, [debounceMs]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !leadId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            incrementView(leadId);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
      
      // Clean up debounce timeout if component unmounts
      const timeoutId = debounceMap.get(leadId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        debounceMap.delete(leadId);
      }
    };
  }, [leadId, threshold, incrementView]);

  return { ref };
};

// Utility function to clear viewed leads (for testing or page navigation)
export const clearViewedLeads = () => {
  viewedLeads.clear();
  // Clear all pending debounce timeouts
  debounceMap.forEach((timeoutId) => clearTimeout(timeoutId));
  debounceMap.clear();
};

// Utility function to manually mark a lead as viewed (for detail page views)
export const markLeadAsViewed = async (leadId: string) => {
  if (viewedLeads.has(leadId)) {
    return;
  }

  try {
    await publicApi.incrementLeadView(leadId);
    viewedLeads.add(leadId);
  } catch (error) {
    console.error('Failed to increment detail view:', error);
  }
};