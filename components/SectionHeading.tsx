import Reveal from "@/components/Reveal";
import Emphasis from "@/components/Emphasis";

/** Intestazione di sezione: etichetta con la scacchiera, titolo in Bodoni, sottotitolo. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
  className = "",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <p className={`eyebrow ${tone === "light" ? "!text-off-white/80" : ""}`}>{eyebrow}</p>
      <h2 className="mt-5 font-display text-[2.6rem] leading-[1.02] tracking-[-0.02em] md:text-[4.25rem]">
        <Emphasis text={title} />
      </h2>
      {subtitle && (
        <p
          className={`mt-5 max-w-md text-[1.0625rem] leading-relaxed ${
            tone === "light" ? "text-off-white/70" : "text-mid"
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
