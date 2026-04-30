import twilio from "twilio";

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

export function getSmsProvider(): "twilio" {
  return "twilio";
}

export function hasTwilioCredentials(): boolean {
  return Boolean(
    envValue("TWILIO_ACCOUNT_SID", "TWILIO_SID") &&
      envValue("TWILIO_AUTH_TOKEN", "TWILIO_TOKEN") &&
      envValue("TWILIO_PHONE_NUMBER", "TWILIO_FROM_NUMBER")
  );
}

export function hasAnySmsProviderConfigured(): boolean {
  return hasTwilioCredentials();
}

export async function sendOTPviaSMS(phone: string, otp: string): Promise<boolean> {
  return sendOTPviaTwilio(phone, otp);
}

export async function sendOTPviaTwilio(phone: string, otp: string): Promise<boolean> {
  const accountSid = envValue("TWILIO_ACCOUNT_SID", "TWILIO_SID");
  const authToken = envValue("TWILIO_AUTH_TOKEN", "TWILIO_TOKEN");
  const phoneNumber = envValue("TWILIO_PHONE_NUMBER", "TWILIO_FROM_NUMBER");

  if (!accountSid || !authToken || !phoneNumber) {
    console.error("[Twilio] Missing Twilio credentials");
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: `Your TechDrHealth OTP is: ${otp}. Valid for 10 minutes. Do not share this code. - TechDrHealth`,
      from: phoneNumber,
      to: phone.startsWith("+") ? phone : `+91${phone}`,
    });
    return true;
  } catch (error) {
    console.error("[Twilio] OTP send failed:", error);
    return false;
  }
}

function normalizeIndianPhone(phone: string) {
  const digitsOnly = phone.replace(/[^\d]/g, "");
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) return `+${digitsOnly}`;
  if (phone.startsWith("+")) return phone;
  return `+${digitsOnly}`;
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.error("[Twilio] Missing Twilio credentials for WhatsApp");
    return false;
  }

  const fromNumber =
    process.env.TWILIO_WHATSAPP_FROM ||
    (process.env.TWILIO_PHONE_NUMBER ? `whatsapp:${process.env.TWILIO_PHONE_NUMBER}` : "");
  if (!fromNumber) {
    console.error("[Twilio] Missing TWILIO_WHATSAPP_FROM or TWILIO_PHONE_NUMBER");
    return false;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`,
      to: `whatsapp:${normalizeIndianPhone(phone)}`,
    });
    return true;
  } catch (error) {
    console.error("[Twilio] WhatsApp send failed:", error);
    return false;
  }
}
