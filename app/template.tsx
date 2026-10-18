/**
 * Il template, a differenza del layout, si rimonta a ogni cambio di
 * pagina: è il punto in cui dare a ogni pagina il suo ingresso (vedi
 * `.page-enter` in globals.css). L'animazione termina con `transform: none`
 * proprio per non intrappolare gli elementi `fixed` delle pagine.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
