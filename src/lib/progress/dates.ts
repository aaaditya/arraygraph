/** Returns the calendar day ("YYYY-MM-DD") for `date` as seen in `timeZone`. */
export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Converts a "YYYY-MM-DD" key into the Date Prisma expects for a `@db.Date` column. */
export function dateKeyToDbDate(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}
