// Google Analytics 4 Event Tracking Utility
// Tracks custom events for YouTool.io

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track when a user uses a tool (clicks analyze, submit, etc.)
 */
export const trackToolUsage = (toolName: string, inputType?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'tool_used', {
      tool_name: toolName,
      input_type: inputType || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track when results are successfully displayed
 */
export const trackResultsDisplayed = (
  toolName: string,
  resultCount?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'results_displayed', {
      tool_name: toolName,
      result_count: resultCount || 0,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track errors encountered during tool usage
 */
export const trackError = (
  toolName: string,
  errorType: string,
  errorMessage?: string
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'error_encountered', {
      tool_name: toolName,
      error_type: errorType,
      error_message: errorMessage || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track time spent on a tool
 * Call this when user has been active for a certain duration
 */
export const trackTimeSpent = (toolName: string, durationSeconds: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'time_spent_on_tool', {
      tool_name: toolName,
      duration_seconds: durationSeconds,
      duration_minutes: Math.round(durationSeconds / 60),
      engagement_level:
        durationSeconds >= 120
          ? 'high'
          : durationSeconds >= 60
          ? 'medium'
          : 'low',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track when ads are viewed
 */
export const trackAdViewed = (adSlot: string, toolName?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ad_viewed', {
      ad_slot: adSlot,
      tool_name: toolName || 'unknown',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Track repeat user (returning visitor)
 * This is automatically tracked by GA4, but we can add custom logic
 */
export const trackRepeatUser = (visitCount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'repeat_visitor', {
      visit_count: visitCount,
      user_type: visitCount === 1 ? 'new' : 'returning',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Custom hook to track time spent on a page/tool
 * Returns a function to start tracking and automatically sends event after threshold
 */
export const useTimeTracking = (toolName: string, thresholdSeconds = 120) => {
  let startTime: number | null = null;
  let trackingInterval: NodeJS.Timeout | null = null;

  const startTracking = () => {
    startTime = Date.now();

    // Track after threshold (default 2 minutes)
    trackingInterval = setTimeout(() => {
      if (startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        trackTimeSpent(toolName, duration);
      }
    }, thresholdSeconds * 1000);
  };

  const stopTracking = () => {
    if (trackingInterval) {
      clearTimeout(trackingInterval);
    }
    if (startTime) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      // Only track if user spent at least 10 seconds
      if (duration >= 10) {
        trackTimeSpent(toolName, duration);
      }
    }
    startTime = null;
  };

  return { startTracking, stopTracking };
};

/**
 * Track page views for specific tools
 * (GA4 auto-tracks page_view, but this adds tool-specific context)
 */
export const trackToolPageView = (toolName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'tool_page_view', {
      tool_name: toolName,
      timestamp: new Date().toISOString(),
    });
  }
};
