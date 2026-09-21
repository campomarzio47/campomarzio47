/**
 * Genera le icone del sito a partire da un marchio disegnato in SVG:
 *
 *   app/favicon.ico     16 + 32 + 48 px (quello che usano Google e le schede)
 *   app/icon.png        512 px (schermi ad alta densita', anteprime, PWA)
 *   app/apple-icon.png  180 px (schermata Home di iOS)
 *
 * Si lancia a mano quando il marchio cambia — gli asset prodotti sono
 * committati, quindi non entra nella build:
 *
 *   node scripts/generate-icons.mjs
 *
 * Dipende da `sharp`, che arriva insieme a Next (ottimizzazione immagini).
 * Se un giorno non fosse piu' risolvibile: `npm i -D sharp`.
 *
 * Per un nuovo progetto (vedi TEMPLATE-SETUP.md §7b) basta cambiare le
 * costanti qui sotto: testo del marchio e colori. I colori vanno tenuti
 * allineati alle variabili CSS in app/globals.css — qui non possono essere
 * importati, perche' il rasterizzatore SVG vuole valori espliciti.
 */
import sharp from "sharp";
import { writeFileSync, statSync, mkdirSync } from "node:fs";

const MARK = "47"; // di solito property.nameAccent, o le iniziali del nome
const BG = "#8b2635"; // --color-bordeaux
const FG = "#f7f5f2"; // --color-off-white
const FONT = "Georgia"; // serif di sistema, vicino al Cormorant del sito
const OUT = "app";

/**
 * Il marchio e' disegnato su una griglia 100x100 e poi scalato.
 *
 * `weight` esiste perche' a 16 px il tratto sottile di un serif regular
 * sparisce nell'antialiasing e il numero diventa una macchia: le dimensioni
 * piccole usano il grassetto, quelle grandi il peso normale (piu' vicino
 * alla leggerezza del Cormorant usato nel sito).
 */
function mark({ radius = 12, weight = 700, fontSize = 68, baseline = 77 }) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">` +
      `<rect width="100" height="100" rx="${radius}" fill="${BG}"/>` +
      `<text x="50" y="${baseline}" font-family="${FONT}" font-weight="${weight}"` +
      ` font-size="${fontSize}" fill="${FG}" text-anchor="middle" letter-spacing="-1">${MARK}</text>` +
      `</svg>`
  );
}

const small = mark({ radius: 12, weight: 700 });
const large = mark({ radius: 18, weight: 400, fontSize: 60, baseline: 74 });

// density alta = l'SVG viene rasterizzato in grande e poi ridotto, cosi' i
// bordi delle cifre restano puliti anche a 16 px.
const render = (svg, size) =>
  sharp(svg, { density: 1200 }).resize(size, size).png({ compressionLevel: 9 });

/**
 * Incapsula un'immagine come DIB (BMP) per l'interno di un .ico.
 * Un .ico puo' contenere anche PNG, ma solo dal supporto Vista in poi: alle
 * dimensioni piccole il BMP costa pochi KB e lo legge chiunque, crawler
 * vecchi inclusi.
 */
async function dib(svg, size) {
  const raw = await sharp(svg, { density: 1200 })
    .resize(size, size)
    .ensureAlpha()
    .raw()
    .toBuffer();

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(size, 4); // biWidth
  header.writeInt32LE(size * 2, 8); // biHeight: XOR + maschera AND
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression = BI_RGB

  // BMP vuole i pixel in BGRA e le righe dal basso verso l'alto.
  const xor = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const src = (size - 1 - y) * size * 4;
    const dst = y * size * 4;
    for (let x = 0; x < size; x++) {
      xor[dst + x * 4 + 0] = raw[src + x * 4 + 2];
      xor[dst + x * 4 + 1] = raw[src + x * 4 + 1];
      xor[dst + x * 4 + 2] = raw[src + x * 4 + 0];
      xor[dst + x * 4 + 3] = raw[src + x * 4 + 3];
    }
  }

  // Maschera AND a 1 bit con righe allineate a 4 byte: tutta a zero, la
  // trasparenza vera sta gia' nel canale alpha.
  const mask = Buffer.alloc(Math.ceil(size / 32) * 4 * size, 0);

  header.writeUInt32LE(xor.length + mask.length, 20); // biSizeImage
  return Buffer.concat([header, xor, mask]);
}

function buildIco(layers, file) {
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(1, 2); // type = icona
  dir.writeUInt16LE(layers.length, 4);

  let offset = 6 + layers.length * 16;
  const entries = layers.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size === 256 ? 0 : size, 0); // 0 significa 256
    e.writeUInt8(size === 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bit per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  writeFileSync(file, Buffer.concat([dir, ...entries, ...layers.map((l) => l.data)]));
}

mkdirSync(OUT, { recursive: true });

buildIco(
  [
    { size: 16, data: await dib(small, 16) },
    { size: 32, data: await dib(small, 32) },
    { size: 48, data: await render(small, 48).toBuffer() },
  ],
  `${OUT}/favicon.ico`
);

await render(large, 512).toFile(`${OUT}/icon.png`);

// iOS arrotonda da solo gli angoli: l'icona deve essere un quadrato pieno,
// senza angoli tondi propri (altrimenti si vedono doppi) e senza alpha.
await render(mark({ radius: 0, weight: 400, fontSize: 60, baseline: 74 }), 180)
  .flatten({ background: BG })
  .toFile(`${OUT}/apple-icon.png`);

for (const f of ["favicon.ico", "icon.png", "apple-icon.png"]) {
  console.log(`${OUT}/${f}`, statSync(`${OUT}/${f}`).size, "byte");
}
