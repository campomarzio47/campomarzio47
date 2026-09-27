import nodemailer from "nodemailer";

export type Attachment = { filename: string; content: string | Buffer };

/**
 * Invio delle email generate dal sito.
 *
 * Volutamente generico via SMTP e non legato a Gmail: le email contengono
 * dati personali (fino agli estremi di un documento d'identità), e chi li
 * trasporta per conto del titolare dev'essere un responsabile del
 * trattamento con cui esiste un accordo ai sensi dell'art. 28 GDPR. Un
 * account Gmail gratuito non ne ha uno — è un servizio per uso personale.
 * Con SMTP generico si può usare Brevo, Mailjet, la casella del proprio
 * dominio o qualunque altro fornitore adeguato, senza toccare il codice.
 *
 * `.trim()` su host e porta per la stessa ragione per cui lo faceva la
 * vecchia integrazione Stripe: un copia-incolla nella dashboard di Vercel
 * può lasciare uno spazio o un a-capo invisibile, che qui produrrebbe un
 * errore di connessione difficile da diagnosticare.
 */
export async function sendMail(options: {
  subject: string;
  text: string;
  to?: string;
  replyTo?: string;
  attachments?: Attachment[];
}) {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.MAIL_FROM?.trim() || user;
  const hostEmail = process.env.HOST_EMAIL?.trim();

  if (!host || !user || !pass || !from || !hostEmail) {
    throw new Error(
      "Invio email non configurato: impostare SMTP_HOST, SMTP_USER, SMTP_PASSWORD, MAIL_FROM e HOST_EMAIL.",
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    // 465 è SMTPS (TLS dall'inizio); 587 e 25 partono in chiaro e passano
    // a TLS con STARTTLS, che nodemailer negozia da sé.
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: options.to || hostEmail,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    attachments: options.attachments,
  });
}
