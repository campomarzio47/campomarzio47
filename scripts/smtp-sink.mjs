/**
 * Server SMTP finto, solo per le prove in locale: accetta qualunque
 * credenziale, non inoltra niente a nessuno e salva ogni messaggio
 * ricevuto come file .eml (apribile con qualunque client di posta).
 *
 * Serve a collaudare check-in, contatti e richieste di prenotazione,
 * allegati compresi, senza un account SMTP vero e senza mandare email
 * reali — né all'host né agli ospiti.
 *
 *   node scripts/smtp-sink.mjs [porta=2525] [cartella=.smtp-sink]
 *
 * e nel file .env usato per la prova:
 *
 *   SMTP_HOST=127.0.0.1
 *   SMTP_PORT=2525
 *   SMTP_USER=prova
 *   SMTP_PASSWORD=prova
 *   MAIL_FROM=sito@example.test
 *   HOST_EMAIL=host@example.test
 *
 * Niente TLS di proposito: non pubblicizza STARTTLS, quindi nodemailer
 * resta in chiaro, il che va bene solo su 127.0.0.1.
 */
import net from "node:net";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.argv[2] || 2525);
const OUT = path.resolve(process.argv[3] || ".smtp-sink");
mkdirSync(OUT, { recursive: true });

let counter = 0;

const server = net.createServer((socket) => {
  // latin1 conserva i byte così come arrivano: il messaggio è già
  // codificato (base64/quoted-printable) da nodemailer.
  let buffer = "";
  let inData = false;
  let auth = null; // null | "plain" | "login-user" | "login-pass"
  let envelope = { from: "", to: [] };

  const reply = (...lines) => socket.write(lines.map((l) => `${l}\r\n`).join(""));
  reply("220 smtp-sink pronto");

  socket.on("data", (chunk) => {
    buffer += chunk.toString("latin1");

    for (;;) {
      if (inData) {
        // Il CRLF davanti permette di riconoscere anche un corpo vuoto.
        const data = `\r\n${buffer}`;
        const end = data.indexOf("\r\n.\r\n");
        if (end === -1) return;
        const body = data.slice(2, end).replace(/^\.\./gm, ".");
        buffer = data.slice(end + 5);
        inData = false;

        const file = path.join(OUT, `${Date.now()}-${++counter}.eml`);
        writeFileSync(file, body, "latin1");
        console.log(`ricevuta ${path.basename(file)}: ${envelope.from} -> ${envelope.to.join(", ")}`);
        envelope = { from: "", to: [] };
        reply("250 OK");
        continue;
      }

      const nl = buffer.indexOf("\r\n");
      if (nl === -1) return;
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 2);

      // Qualunque credenziale va bene: è un server di prova.
      if (auth === "plain" || auth === "login-pass") {
        auth = null;
        reply("235 Autenticato");
        continue;
      }
      if (auth === "login-user") {
        auth = "login-pass";
        reply("334 UGFzc3dvcmQ6");
        continue;
      }

      const [verb, ...rest] = line.split(" ");
      const arg = rest.join(" ");
      switch (verb.toUpperCase()) {
        case "EHLO":
          reply("250-smtp-sink", "250-AUTH PLAIN LOGIN", "250 SIZE 52428800");
          break;
        case "HELO":
          reply("250 smtp-sink");
          break;
        case "AUTH": {
          const [mech, initial] = arg.split(" ");
          if (mech.toUpperCase() === "PLAIN") {
            if (initial) reply("235 Autenticato");
            else {
              auth = "plain";
              reply("334 ");
            }
          } else if (mech.toUpperCase() === "LOGIN") {
            auth = "login-user";
            reply("334 VXNlcm5hbWU6");
          } else {
            reply("504 Meccanismo non supportato");
          }
          break;
        }
        case "MAIL":
          envelope.from = arg.replace(/^FROM:\s*/i, "");
          reply("250 OK");
          break;
        case "RCPT":
          envelope.to.push(arg.replace(/^TO:\s*/i, ""));
          reply("250 OK");
          break;
        case "DATA":
          inData = true;
          reply("354 Fine con <CRLF>.<CRLF>");
          break;
        case "RSET":
          envelope = { from: "", to: [] };
          reply("250 OK");
          break;
        case "NOOP":
          reply("250 OK");
          break;
        case "QUIT":
          reply("221 Ciao");
          socket.end();
          return;
        default:
          reply("502 Comando non supportato");
      }
    }
  });

  socket.on("error", () => {});
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`smtp-sink in ascolto su 127.0.0.1:${PORT}, messaggi in ${OUT}`);
});
