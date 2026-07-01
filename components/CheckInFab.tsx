"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";

export default function CheckInFab() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 320);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/check-in" || !scrolled) return null;

  return (
    <Link
      href="/check-in"
      aria-label="Check-in online"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-bordeaux px-5 py-3 text-sm font-medium text-off-white shadow-lg transition-colors hover:bg-bordeaux-dark md:hidden"
    >
      <LogIn size={17} strokeWidth={2} />
      Check-in
    </Link>
  );
}
