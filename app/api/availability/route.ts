import { NextResponse } from "next/server";
import { getBusyRanges, isIcalConfigured } from "@/lib/ical";

export const revalidate = 3600;

export async function GET() {
  const configured = isIcalConfigured();

  if (!configured) {
    return NextResponse.json({ configured: false, busy: [] });
  }

  try {
    const busy = await getBusyRanges();
    return NextResponse.json({ configured: true, busy });
  } catch {
    return NextResponse.json(
      { configured: true, busy: [], error: "Impossibile leggere il calendario in questo momento." },
      { status: 200 },
    );
  }
}
