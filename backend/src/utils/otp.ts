import crypto from 'crypto';

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function getOtpExpiry(): Date {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '15', 10);
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
  return expiry;
}

export function isOtpExpired(expiry: Date): boolean {
  return new Date() > expiry;
}
