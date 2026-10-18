import { Fragment } from "react";

/**
 * Rende in corsivo il testo fra asterischi: "Dentro *la casa*". È la sola
 * "formattazione" ammessa nei titoli del dizionario, e basta a dare il
 * ritmo tipografico delle riviste (tondo + corsivo dello stesso Bodoni).
 */
export default function Emphasis({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} className="italic">
            {part}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Lo stesso testo senza asterischi, per attributi e metadati. */
export function plainText(text: string): string {
  return text.replace(/\*/g, "");
}
