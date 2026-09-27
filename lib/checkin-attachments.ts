import archiver from "archiver";
import zipEncryptedFormat from "archiver-zip-encrypted";
import type { Attachment } from "@/lib/mailer";

/**
 * Impacchetta gli allegati del check-in.
 *
 * Perché esiste: i tre file contengono i dati anagrafici di tutti gli
 * ospiti e, nel tracciato Alloggiati Web, il numero del documento
 * d'identità. Spediti così, restano in chiaro per sempre nella casella di
 * posta dell'host. Se `CHECKIN_ZIP_PASSWORD` è impostata, finiscono invece
 * in un unico ZIP cifrato AES-256.
 *
 * Perché è facoltativo e spento di default: lo ZIP AES-256 non si apre con
 * il doppio clic di Esplora file su Windows, serve 7-Zip. È una frizione
 * reale su un'operazione che l'host fa a ogni arrivo, quindi la scelta
 * resta sua. La password non viaggia mai nell'email: deve già conoscerla.
 *
 * NOTA SULLA VERSIONE DI ARCHIVER: serve la 7.x. La 8 è ESM pura e ha
 * rimosso `registerFormat`, su cui si appoggia archiver-zip-encrypted per
 * installare il formato "zip-encrypted". Aggiornare archiver a 8 rompe
 * questo file in modo silenzioso a runtime, non in compilazione.
 */

// `encryptionMethod` e `password` non appartengono ad archiver: le
// introduce il formato registrato da archiver-zip-encrypted, e per questo
// non compaiono in ArchiverOptions.
type EncryptedZipOptions = archiver.ArchiverOptions & {
  encryptionMethod: "aes256";
  password: string;
};

function ensureEncryptedZipFormat(): void {
  // Registrare due volte lo stesso formato lancia: succede quando il
  // modulo viene rivalutato dopo un hot reload in sviluppo.
  if (archiver.isRegisteredFormat("zip-encrypted")) return;
  archiver.registerFormat("zip-encrypted", zipEncryptedFormat);
}

async function toEncryptedZip(
  files: Attachment[],
  password: string,
  filename: string,
): Promise<Attachment> {
  ensureEncryptedZipFormat();

  const options: EncryptedZipOptions = {
    zlib: { level: 8 },
    encryptionMethod: "aes256",
    password,
  };
  const archive = archiver.create("zip-encrypted", options);

  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));

  const finished = new Promise<void>((resolve, reject) => {
    archive.on("end", () => resolve());
    archive.on("error", reject);
  });

  for (const file of files) {
    archive.append(
      typeof file.content === "string" ? Buffer.from(file.content) : file.content,
      { name: file.filename },
    );
  }

  await archive.finalize();
  await finished;

  return { filename, content: Buffer.concat(chunks) };
}

/**
 * Restituisce gli allegati pronti per `sendMail`: i file così come sono,
 * oppure un unico ZIP cifrato se la password è configurata.
 *
 * Se la cifratura fallisce non blocchiamo il check-in dell'ospite, che non
 * c'entra nulla e ha un arrivo da organizzare: si torna agli allegati in
 * chiaro e si scrive l'errore nei log, perché l'host se ne accorga.
 */
export async function buildCheckInAttachments(
  files: Attachment[],
  arrivalDate: string,
): Promise<Attachment[]> {
  const password = process.env.CHECKIN_ZIP_PASSWORD?.trim();
  if (!password) return files;

  try {
    const zip = await toEncryptedZip(files, password, `check-in-${arrivalDate}.zip`);
    return [zip];
  } catch (error) {
    console.error(
      "Cifratura degli allegati del check-in non riuscita: invio in chiaro",
      error,
    );
    return files;
  }
}
