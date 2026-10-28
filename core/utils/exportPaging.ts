export const EXPORT_PAGE_SIZE = 1000; // rows per request (API-friendly, well under 2000)
export const EXPORT_MAX_ROWS = 20000; // hard cap on a single export

interface Page<T> {
  data?: T[];
  meta?: { total?: number };
}

/**
 * Pages through a list endpoint instead of asking for everything in one request.
 * Stops at the last page or at EXPORT_MAX_ROWS, whichever comes first.
 */
export async function fetchAllForExport<T>(
  fetchPage: (pagination: { skip: number; take: number }) => Promise<Page<T> | undefined>
): Promise<{ rows: T[]; truncated: boolean }> {
  const rows: T[] = [];
  let truncated = false;
  for (let skip = 0; skip < EXPORT_MAX_ROWS; skip += EXPORT_PAGE_SIZE) {
    const page = await fetchPage({ skip, take: EXPORT_PAGE_SIZE });
    const batch = page?.data ?? [];
    rows.push(...batch);
    const total = page?.meta?.total;
    if (batch.length < EXPORT_PAGE_SIZE || (typeof total === 'number' && rows.length >= total)) {
      return { rows, truncated: false };
    }
  }
  truncated = true;
  return { rows: rows.slice(0, EXPORT_MAX_ROWS), truncated };
}

export const exportTruncatedMessage = `Export limited to the first ${EXPORT_MAX_ROWS} rows. Narrow the filters to export the rest.`;
