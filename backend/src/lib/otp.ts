interface OtpDetails {
    otp: number;
    expiry: Date;
}

export function generateOtp(expiryDurationInMinutes: number = 10): OtpDetails {
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    const expiry = new Date(Date.now() + expiryDurationInMinutes * 60 * 1000); // Set expiry time
    return { otp, expiry };
}