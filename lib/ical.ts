export type BusyRange = { start: string; end: string };

function unfold(icsText: string): string {
  // RFC5545: le righe continuate iniziano con uno spazio o un tab.
  return icsText.replace(/\r?\n[ \t]/g, "");
}

function parseIcsDate(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "").slice(0, 8);
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function parseBusyRanges(icsText: string): BusyRange[] {
  const ranges: BusyRange[] = [];
  const blocks = unfold(icsText).split("BEGIN:VEVENT").slice(1);

  for (const block of blocks) {
    const startMatch = block.match(/DTSTART[^:\r\n]*:([0-9TZ]+)/);
    const endMatch = block.match(/DTEND[^:\r\n]*:([0-9TZ]+)/);
    if (startMatch && endMatch) {
      ranges.push({
        start: parseIcsDate(startMatch[1]),
        end: parseIcsDate(endMatch[1]),
      });
    }
  }

  return ranges;
}

async function fetchBusyRanges(url: string): Promise<BusyRange[]> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Impossibile scaricare il calendario (HTTP ${res.status})`);
  }
  const text = await res.text();
  return parseBusyRanges(text);
}

export function isIcalConfigured() {
  return Boolean(process.env.AIRBNB_ICAL_URL || process.env.BOOKING_ICAL_URL);
}

export async function getBusyRanges(): Promise<BusyRange[]> {
  const urls = [process.env.AIRBNB_ICAL_URL, process.env.BOOKING_ICAL_URL].filter(
    (url): url is string => Boolean(url),
  );
  if (urls.length === 0) return [];

  const results = await Promise.allSettled(urls.map(fetchBusyRanges));
  return results
    .filter(
      (r): r is PromiseFulfilledResult<BusyRange[]> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}
