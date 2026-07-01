import nodemailer from "nodemailer";

export type Attachment = { filename: string; content: string | Buffer };

export async function sendMail(options: {
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
}) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const hostEmail = process.env.HOST_EMAIL;

  if (!user || !pass || !hostEmail) {
    throw new Error(
      "Invio email non configurato: impostare GMAIL_USER, GMAIL_APP_PASSWORD e HOST_EMAIL.",
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: user,
    to: hostEmail,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    attachments: options.attachments,
  });
}
