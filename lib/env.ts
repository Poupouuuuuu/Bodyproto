import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  shopAddress: process.env.BODYSTART_SHOP_ADDRESS ?? "",
  shopPhone: process.env.BODYSTART_SHOP_PHONE ?? "",
};
