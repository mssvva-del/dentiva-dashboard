/**
 * UI text constants. Centralized to prep for i18n (Iter 2+).
 * No hardcoded copy in components.
 */
export const APP_NAME = "Dentiva";

export const NAV = {
  dashboard: "Dashboard",
  calls: "Calls",
  bookings: "Bookings",
  settings: "Settings",
} as const;

export const COPY = {
  // Dashboard home
  dashboardTitle: "Today",
  dashboardSubtitle: "Live overview of your practice's AI receptionist.",
  metricCallsToday: "Calls today",
  metricAnsweredByAi: "Answered by AI",
  metricCallsMissed: "Missed",
  metricBookingsToday: "Bookings made today",
  metricUpcomingToday: "Upcoming appointments today",

  // Calls
  callsTitle: "Calls",
  callsSubtitle: "Recent calls handled by your AI receptionist.",
  callsEmpty: "No calls yet. They'll appear here as they come in.",

  // Bookings
  bookingsTitle: "Bookings",
  bookingsSubtitle: "Upcoming and recent appointments.",
  bookingsEmpty: "No bookings yet.",

  // Settings
  settingsTitle: "Settings",
  settingsSubtitle: "Practice configuration.",

  // Generic states
  loading: "Loading…",
  errorTitle: "Couldn't load data",
  errorBody:
    "The backend may not be running yet. Data will appear once the API is reachable.",
  retry: "Retry",
} as const;

/** Poll interval for live data per Weekend Mode (5s). */
export const POLL_INTERVAL_MS = 5000;
