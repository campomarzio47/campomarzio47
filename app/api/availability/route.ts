import { NextResponse } from "next/server";
import { getBusyRanges, isIcalConfigured } from "@/lib/ical";
import { leadTimeBusyRange } from "@/lib/pricing";

export const revalidate = 3600;

export async function GET() {
  const configured = isIcalConfigured();

  if (!configured) {
    return NextResponse.json({ configured: false, busy: [] });
  }

  // Il preavviso minimo (property.pricing.minAdvanceDays) va sempre
  // applicato, indipendentemente da cosa riportano i feed iCal: Booking.com
  // non include nel proprio export le date bloccate solo dal preavviso
  // minimo impostato sulla piattaforma, solo le prenotazioni vere e proprie.
  const lead = leadTimeBusyRange();

  try {
    const busy = await getBusyRanges();
    return NextResponse.json({ configured: true, busy: lead ? [...busy, lead] : busy });
  } catch {
    return NextResponse.json(
      {
        configured: true,
        busy: lead ? [lead] : [],
        error: "Impossibile leggere il calendario in questo momento.",
      },
      { status: 200 },
    );
  }
}
