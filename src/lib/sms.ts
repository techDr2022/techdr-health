import twilio from "twilio";

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

export function getSmsProvider(): "msg91" | "twilio" {
  const raw = envValue("SMS_PROVIDER").toLowerCase();
  return raw === "twilio" ? "twilio" : "msg91";
}

export function hasMsg91Credentials(): boolean {
  return Boolean(
    envValue("MSG91_AUTH_KEY", "MSG91_AUTHKEY", "MSG91_API_KEY") &&
      envValue("MSG91_TEMPLATE_ID", "MSG91_OTP_TEMPLATE_ID")
  );
}

export function hasTwilioCredentials(): boolean {
  return Boolean(
    envValue("TWILIO_ACCOUNT_SID", "TWILIO_SID") &&
      envValue("TWILIO_AUTH_TOKEN", "TWILIO_TOKEN") &&
      envValue("TWILIO_PHONE_NUMBER", "TWILIO_FROM_NUMBER")
  );
}

export function hasAnySmsProviderConfigured(): boolean {
  return hasMsg91Credentials() || hasTwilioCredentials();
}

export async function sendOTPviaSMS(phone: string, otp: string): Promise<boolean> {
  const provider = getSmsProvider();
  if (provider === "twilio") return sendOTPviaTwilio(phone, otp);

  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const msg91AuthKey = envValue("MSG91_AUTH_KEY", "MSG91_AUTHKEY", "MSG91_API_KEY");
  const msg91TemplateId = envValue("MSG91_TEMPLATE_ID", "MSG91_OTP_TEMPLATE_ID");

  if (!msg91AuthKey || !msg91TemplateId) {
    console.error("[SMS] MSG91 credentials are missing");
    return false;
  }

  try {
    const response = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: msg91AuthKey,
      },
      body: JSON.stringify({
        template_id: msg91TemplateId,
        mobile: formattedPhone.replace("+", ""),
        authkey: msg91AuthKey,
        otp,
      }),
    });

    const data = (await response.json()) as { type?: string };
    return data.type === "success";
  } catch (error) {
    console.error("[SMS] Failed to send OTP:", error);
    return false;
  }
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
