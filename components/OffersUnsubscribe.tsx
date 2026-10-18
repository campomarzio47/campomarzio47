"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/content/dictionaries";

export default function OffersUnsubscribe({
  state,
  email = "",
  token = "",
}: {
  state: "ask" | "done" | "notFound";
  email?: string;
  token?: string;
}) {
  const { dict } = useLocale();
  const t = dict.offers;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20">
      <PageHeader section="offers" />
      <div className="max-w-xl">
        {state === "ask" ? (
          <form action="/api/newsletter/unsubscribe" method="post" className="flex flex-col items-start gap-6">
            <p className="text-[1.0625rem] leading-relaxed">{fill(t.question, { email })}</p>
            <input type="hidden" name="t" value={token} />
            <button type="submit" className="btn btn-primary">
              {t.confirm}
            </button>
          </form>
        ) : (
          <p role="status" className="text-[1.0625rem] leading-relaxed">
            {state === "done" ? t.done : t.notFound}
          </p>
        )}
        <Link href="/" className="link-draw mt-10 inline-block text-[0.9375rem] font-medium">
          {t.back}
        </Link>
      </div>
    </div>
  );
}
