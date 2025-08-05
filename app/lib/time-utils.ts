// Timezone utilities for Indonesian time (WIB)

const WIB_TIMEZONE = 'Asia/Jakarta';

export interface FormattedTime {
  date: string;
  time: string;
  dateTime: string;
  relative: string;
}

/**
 * Format date/time to Indonesian timezone (WIB)
 */
export function formatToWIB(dateInput: string | Date): FormattedTime {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    // Format date in WIB timezone
    const wibDate = new Date(date.toLocaleString("en-US", { timeZone: WIB_TIMEZONE }));
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: WIB_TIMEZONE }));
    
    // Date formatting
    const dateFormatted = wibDate.toLocaleDateString('id-ID', {
      timeZone: WIB_TIMEZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Time formatting
    const timeFormatted = wibDate.toLocaleTimeString('id-ID', {
      timeZone: WIB_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' WIB';

    // Combined date-time
    const dateTimeFormatted = `${dateFormatted}, ${timeFormatted}`;

    // Relative time
    const relativeFormatted = getRelativeTime(wibDate, now);

    return {
      date: dateFormatted,
      time: timeFormatted,
      dateTime: dateTimeFormatted,
      relative: relativeFormatted
    };
  } catch (error) {
    console.warn('Error formatting time to WIB:', error);
    return {
      date: 'Invalid Date',
      time: 'Invalid Time',
      dateTime: 'Invalid DateTime',
      relative: 'Unknown'
    };
  }
}

/**
 * Get relative time in Indonesian
 */
function getRelativeTime(date: Date, now: Date): string {
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Future time
  if (diffInSeconds < 0) {
    const absDiffInMinutes = Math.abs(diffInMinutes);
    const absDiffInHours = Math.abs(diffInHours);
    const absDiffInDays = Math.abs(diffInDays);

    if (absDiffInMinutes < 1) return 'Sebentar lagi';
    if (absDiffInMinutes < 60) return `${absDiffInMinutes} menit lagi`;
    if (absDiffInHours < 24) return `${absDiffInHours} jam lagi`;
    if (absDiffInDays === 1) return 'Besok';
    if (absDiffInDays < 7) return `${absDiffInDays} hari lagi`;
    
    return date.toLocaleDateString('id-ID', {
      timeZone: WIB_TIMEZONE,
      day: 'numeric',
      month: 'short'
    });
  }

  // Past time
  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
  
  return date.toLocaleDateString('id-ID', {
    timeZone: WIB_TIMEZONE,
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Format economic event time from UTC string to WIB
 */
export function formatEventTime(timeString: string): string {
  try {
    // Parse time string (assuming format like "14:00" or "19:00")
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return timeString + ' WIB'; // Return original with WIB suffix if parsing fails
    }

    // Create date object (using today as base)
    const today = new Date();
    const utcDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes));
    
    // Convert to WIB
    const wibTime = utcDate.toLocaleTimeString('id-ID', {
      timeZone: WIB_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return wibTime + ' WIB';
  } catch (error) {
    console.warn('Error formatting event time:', error);
    return timeString + ' WIB';
  }
}

/**
 * Format date header for economic calendar
 */
export function formatDateHeader(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: WIB_TIMEZONE }));
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    // Convert input date to WIB for comparison
    const wibDate = new Date(date.toLocaleString("en-US", { timeZone: WIB_TIMEZONE }));
    
    // Compare dates (ignoring time)
    const wibDateString = wibDate.toDateString();
    const nowString = now.toDateString();
    const tomorrowString = tomorrow.toDateString();
    
    if (wibDateString === nowString) {
      return 'Hari Ini';
    } else if (wibDateString === tomorrowString) {
      return 'Besok';
    } else {
      return wibDate.toLocaleDateString('id-ID', {
        timeZone: WIB_TIMEZONE,
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  } catch (error) {
    console.warn('Error formatting date header:', error);
    return dateString;
  }
}

/**
 * Get current WIB time
 */
export function getCurrentWIBTime(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: WIB_TIMEZONE }));
}

/**
 * Format last updated time for UI
 */
export function formatLastUpdated(dateString: string | null): string {
  if (!dateString) return 'Belum pernah';
  
  try {
    const date = new Date(dateString);
    const now = getCurrentWIBTime();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      timeZone: WIB_TIMEZONE,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  } catch (error) {
    console.warn('Error formatting last updated:', error);
    return 'Tidak diketahui';
  }
}