import { permanentRedirect } from "next/navigation";

// Vecchia route rimasta solo per non rompere link salvati o gia'
// indicizzati: la sezione ora e' un'ancora dentro la home.
// permanentRedirect = 308 (non 307): dice ai motori di trasferire il
// valore del vecchio URL alla home e di togliere questo dall'indice.
export default function RecensioniPage() {
  permanentRedirect("/#recensioni");
}
