import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export function EmailLayout({
  preview,
  title,
  children,
}: {
  preview: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            margin: "24px auto",
            maxWidth: "560px",
            padding: "24px",
          }}
        >
          <Heading style={{ marginTop: 0, color: "#0f172a", fontSize: "24px" }}>
            {title}
          </Heading>
          <Section>
            {children}
            <Text style={{ color: "#475569", marginTop: "24px", fontSize: "13px" }}>
              - Team techDr Tele Health
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
