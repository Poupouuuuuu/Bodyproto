import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = {
  firstName: string;
  consultationUrl: string;
  consultationDate: string;
  essentialCount: number;
  priorityCount: number;
  optimisationCount: number;
  shopAddress: string;
  shopPhone: string;
  logoUrl?: string;
};

export function ProtocolEmail({
  firstName,
  consultationUrl,
  consultationDate,
  essentialCount,
  priorityCount,
  optimisationCount,
  shopAddress,
  shopPhone,
  logoUrl,
}: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>Votre protocole BodyStart personnalisé</Preview>
      <Tailwind>
        <Body className="bg-[#f8f4ee] font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-2xl bg-white p-0 overflow-hidden shadow">
            <Section className="bg-[#f8f4ee] px-8 py-6">
              {logoUrl && (
                <Img src={logoUrl} alt="BodyStart Nutrition" width="160" height="40" />
              )}
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-base text-[#111827]">
                Bonjour {firstName},
              </Text>
              <Text className="text-base text-[#111827]">
                Voici votre protocole personnalisé BodyStart Nutrition, établi suite à votre consultation du {consultationDate}.
              </Text>

              <Section className="text-center py-4">
                <Button
                  href={consultationUrl}
                  className="bg-[#1a2e23] rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest text-white"
                >
                  Consulter en ligne
                </Button>
                <Text className="mt-2 text-xs text-[#4a5f4c]">
                  PDF en pièce jointe également
                </Text>
              </Section>

              <Hr className="my-6 border-[#1a2e23]/10" />

              <Text className="text-sm font-bold uppercase tracking-widest text-[#4a5f4c]">
                Récap en 3 points
              </Text>
              <Text className="text-sm text-[#111827]">
                • <strong>{essentialCount}</strong> complément{essentialCount > 1 ? "s" : ""} essentiel{essentialCount > 1 ? "s" : ""}<br />
                • <strong>{priorityCount}</strong> prioritaire{priorityCount > 1 ? "s" : ""}<br />
                • <strong>{optimisationCount}</strong> optimisation{optimisationCount > 1 ? "s" : ""}
              </Text>

              <Text className="mt-6 text-sm text-[#111827]">
                Questions ? Revenez nous voir en boutique ou répondez à cet email.
              </Text>

              <Text className="text-sm text-[#111827]">L&apos;équipe BodyStart</Text>
            </Section>

            <Section className="bg-[#1a2e23] px-8 py-6 text-center">
              <Text className="m-0 text-xs text-[#f8f4ee]">
                {shopAddress}
              </Text>
              <Text className="m-0 text-xs text-[#f8f4ee]">{shopPhone}</Text>
              <Text className="m-0 text-xs text-[#89a890]">bodystart.vercel.app</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ProtocolEmail;
