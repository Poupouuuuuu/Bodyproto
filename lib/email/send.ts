import "server-only";
import { render } from "@react-email/components";
import { getResend } from "./client";
import { ProtocolEmail } from "./templates/ProtocolEmail";
import { env } from "@/lib/env";

export type SendProtocolEmailArgs = {
  toEmail: string;
  firstName: string;
  consultationId: string;
  consultationDate: string;
  essentialCount: number;
  priorityCount: number;
  optimisationCount: number;
  pdfBuffer: Buffer;
};

export async function sendProtocolEmail(args: SendProtocolEmailArgs): Promise<{ id: string }> {
  const consultationUrl = `${env.appOrigin}/r/${args.consultationId}`;

  const html = await render(
    ProtocolEmail({
      firstName: args.firstName,
      consultationUrl,
      consultationDate: args.consultationDate,
      essentialCount: args.essentialCount,
      priorityCount: args.priorityCount,
      optimisationCount: args.optimisationCount,
      shopAddress: env.shopAddress,
      shopPhone: env.shopPhone,
      logoUrl: `${env.appOrigin}/logo.webp`,
    }),
  );

  const resend = getResend();
  const response = await resend.emails.send({
    from: env.resendFromEmail,
    to: args.toEmail,
    subject: "Votre protocole BodyStart personnalisé",
    html,
    attachments: [
      {
        filename: `protocole-bodystart-${args.consultationId}.pdf`,
        content: args.pdfBuffer,
      },
    ],
  });

  if (response.error) {
    throw new Error(`Resend error: ${response.error.message}`);
  }
  return { id: response.data?.id ?? "" };
}
