import Razorpay from "razorpay";

let razorpaySingleton: Razorpay | null = null;

export function getRazorpayClient() {
  if (razorpaySingleton) return razorpaySingleton;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay configuration in environment variables.");
  }

  razorpaySingleton = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpaySingleton;
}
