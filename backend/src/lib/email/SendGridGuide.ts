// SendGridGuide.ts
import sgMail from "@sendgrid/mail";
import { EmailTemplate } from "./EmailTemplate";
import { IUser } from "../../models/User";
import { SENDGRID_API_KEY } from "../../constant/env";
import { SENDGRID_FROM_EMAIL } from "../../constant/env";
class SendGridGuide {
  private static instance: SendGridGuide;

  private constructor() {
    sgMail.setApiKey(SENDGRID_API_KEY as string);
  }

  public static getInstance(): SendGridGuide {
    if (!SendGridGuide.instance) {
      SendGridGuide.instance = new SendGridGuide();
    }
    return SendGridGuide.instance;
  }
  private async sendEmail(
    to: string | string[],
    subject: string,
    html: string
  ): Promise<void> {
    const msg = {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      html,
    };

    try {
      const res = await sgMail.send(msg);
      console.log(`✅ Email sent to ${Array.isArray(to) ? to.join(", ") : to}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}`, error);
      // throw error;
    }
  }

  
  public async sendUserDeactivationEmail(
    user: IUser,
    isDeactivated: boolean,
    loginLink: string,
    deactivationReason?: string
  ): Promise<void> {
    const html = EmailTemplate.getUserDeactivationEmail({
      userName: user.name,
      isDeactivated,
      deactivationReason,
      loginLink,
    });

    await this.sendEmail(
      user.email,
      `Your account has been ${isDeactivated ? "deactivated" : "reactivated"}`,
      html
    );
  }

  public async sendUserSignup(
    user: IUser,
    redirectLink: string,
    message?: string
  ): Promise<void> {
    const html = EmailTemplate.getUserSignup({
      userName: user.name,
      redirectLink,
      message,
    });

    await this.sendEmail(
      user.email,
      `Welcome to the Platform, ${user.name}!`,
      html
    );
  }

  public async sendForgotPassword(
    user: IUser,
    resetLink: string
  ): Promise<void> {
    const html = EmailTemplate.getForgotPassword({
      userName: user.name,
      resetLink,
    });

    await this.sendEmail(user.email, "Reset Your Password", html);
  }

  public async sendOTP(user: IUser): Promise<void> {
    const html = EmailTemplate.getAuthOTP({
      otp: user.otp ?? 0,
    });

    await this.sendEmail(user.email, "Resend OTP for Email verification", html);
  }

  public async emailVerificationSuccess(user: IUser, redirectLink: string): Promise<void> {
    const html = EmailTemplate.getEmailVerificationSucces({
      redirectLink,
    });

    await this.sendEmail(user.email, "Email Verification Success", html);
  }

  public async sendLoginAlert(
    user: IUser,
    loginDetails: { ip: string | null; location: string }
  ): Promise<void> {
    const html = EmailTemplate.getLoginAlert({
      userName: user.name,
      ipAddress: loginDetails.ip ?? "Unknown",
      location: loginDetails.location || "Unknown",
    });

    await this.sendEmail(
      user.email,
      "Security Alert: New Login Detected",
      html
    );
  }
}

export const sendGridGuide = SendGridGuide.getInstance();
