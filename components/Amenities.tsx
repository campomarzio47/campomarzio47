"use client";

import {
  Wifi,
  Car,
  Thermometer,
  ChefHat,
  Tv,
  Trees,
  WashingMachine,
  DoorOpen,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

const icons: Record<string, LucideIcon> = {
  Wifi,
  Car,
  Thermometer,
  ChefHat,
  Tv,
  Trees,
  WashingMachine,
  DoorOpen,
};

export default function Amenities() {
  const { dict } = useLocale();

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md bg-divider sm:grid-cols-2">
      {dict.amenities.items.map((amenity) => {
        const Icon = icons[amenity.icon] ?? Wifi;
        return (
          <div key={amenity.title} className="flex flex-col gap-2 bg-off-white p-6">
            <Icon size={22} strokeWidth={1.5} className="text-bordeaux" />
            <span className="text-xs uppercase tracking-wide text-mid">
              {amenity.category}
            </span>
            <span className="font-display text-lg">{amenity.title}</span>
            <span className="text-sm text-mid">{amenity.description}</span>
          </div>
        );
      })}
    </div>
  );
}
