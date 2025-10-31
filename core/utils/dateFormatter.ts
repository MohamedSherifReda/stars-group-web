class DateFormatter {
  private static months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /**
   * Formats a date string to "Month Day, Year" (e.g., "September 28, 2021")
   * @param dateString - ISO date string (e.g., "2025-04-03T10:28:34.271Z")
   * @returns Formatted date string
   */
  public static formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    const month = DateFormatter.months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  /**
   * Formats a date string to a custom format
   * @param dateString - ISO date string or Date object
   * @param format - Format string (e.g., "MM/DD/YYYY", "DD-MM-YYYY")
   * @returns Formatted date string
   */
  public static formatCustom(
    dateString: string | Date,
    format: string
  ): string {
    const date = new Date(dateString);
    const pad = (num: number) => num.toString().padStart(2, '0');

    const replacements: Record<string, string> = {
      YYYY: date.getFullYear().toString(),
      YY: date.getFullYear().toString().slice(-2),
      MMMM: DateFormatter.months[date.getMonth()],
      MMM: DateFormatter.months[date.getMonth()].slice(0, 3),
      MM: pad(date.getMonth() + 1),
      DD: pad(date.getDate()),
      dd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      HH: pad(date.getHours()),
      hh: pad(date.getHours() % 12 || 12),
      mm: pad(date.getMinutes()),
      ss: pad(date.getSeconds()),
      a: date.getHours() < 12 ? 'AM' : 'PM',
    };

    return format.replace(
      /YYYY|YY|MMMM|MMM|MM|DD|dd|HH|hh|mm|ss|a/g,
      (match) => replacements[match]
    );
  }

  /**
   * Returns the time difference between now and the given date in human-readable format
   * @param dateString - ISO date string or Date object
   * @returns Relative time string (e.g., "3 days ago", "2 months ago")
   */
  public static timeAgo(dateString: string | Date): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'just now';
  }
}

export default DateFormatter;
