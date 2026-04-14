import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  shopAddress: process.env.BODYSTART_SHOP_ADDRESS ?? "8 Rue du Pont des Landes, 78310 Coignières",
  shopPhone: process.env.BODYSTART_SHOP_PHONE ?? "07 61 84 75 80",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000",
};
