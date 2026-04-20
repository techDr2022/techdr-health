import twilio from "twilio";

export async function sendOTPviaSMS(phone: string, otp: string): Promise<boolean> {
  const provider = (process.env.SMS_PROVIDER || "msg91").toLowerCase();
  if (provider === "twilio") return sendOTPviaTwilio(phone, otp);

  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_TEMPLATE_ID) {
    console.error("[SMS] MSG91 credentials are missing");
    return false;
  }

  try {
    const response = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: formattedPhone.replace("+", ""),
        authkey: process.env.MSG91_AUTH_KEY,
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
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error("[Twilio] Missing Twilio credentials");
    return false;
  }

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your TechDrHealth OTP is: ${otp}. Valid for 10 minutes. Do not share this code. - TechDrHealth`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone.startsWith("+") ? phone : `+91${phone}`,
    });
    return true;
  } catch (error) {
    console.error("[Twilio] OTP send failed:", error);
    return false;
  }
}
