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
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-divider sm:grid-cols-4">
      {dict.amenities.items.map((amenity) => {
        const Icon = icons[amenity.icon] ?? Wifi;
        return (
          <div
            key={amenity.title}
            className="flex flex-col gap-1.5 bg-off-white p-4 transition-colors duration-200 hover:bg-beam/20"
          >
            <Icon size={18} strokeWidth={1.5} className="text-bordeaux" />
            <span className="font-display text-base leading-snug">{amenity.title}</span>
            <span className="text-xs leading-snug text-mid">{amenity.description}</span>
          </div>
        );
      })}
    </div>
  );
}
