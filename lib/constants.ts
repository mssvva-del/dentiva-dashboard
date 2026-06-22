/**
 * UI text constants. Centralized to prep for i18n (Iter 2+).
 * No hardcoded copy in components.
 *
 * NOTE: These strings are mirrored in /messages/en.json for i18n.
 * Future: components will use useTranslations() from next-intl.
 * Migration will happen in Iter 1 when ES/RU support is activated.
 */
export const APP_NAME = "Dentiva";

export const NAV = {
  dashboard: "Dashboard",
  calls: "Calls",
  bookings: "Bookings",
  knowledgeBase: "Knowledge Base",
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

  // Pagination
  paginationPrev: "Previous",
  paginationNext: "Next",
  paginationShowing: "Showing",
  paginationOf: "of",
  paginationCalls: "calls",
  paginationBookings: "bookings",

  // Filters
  filterAll: "All",
  filterDirection: "Direction",
  filterStatus: "Status",
  filterClear: "Clear filters",
  filterInbound: "Inbound",
  filterOutbound: "Outbound",
  filterCompleted: "Completed",
  filterMissed: "Missed",
  filterVoicemail: "Voicemail",
  filterConfirmed: "Confirmed",
  filterCancelled: "Cancelled",
  filterNoShow: "No Show",
  filterBookingCompleted: "Completed",
  filterFromDate: "From",
  filterToDate: "To",

  // Booking detail
  bookingSourceCallLabel: "This booking was created during an AI call.",

  // Call detail
  callDetailNoTranscript: "No transcript available for this call.",
  callDetailNoRecording: "Recording not available.",
  callDetailTranscriptLabel: "Transcript",
  callDetailRecordingLabel: "Recording",

  // Generic states
  loading: "Loading…",
  errorTitle: "Couldn't load data",
  errorBody:
    "The backend may not be running yet. Data will appear once the API is reachable.",
  retry: "Retry",
} as const;

/** Poll interval for live data per Weekend Mode (5s). */
export const POLL_INTERVAL_MS = 5000;
