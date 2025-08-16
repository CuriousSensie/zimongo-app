import fs from "fs";
import path from "path";
import handlebars from "handlebars";

export class EmailTemplate {
  private static readTemplate(templateName: string): string {
    const filePath = path.join(__dirname, "templates", `${templateName}.hbs`);
    return fs.readFileSync(filePath, "utf-8");
  }

  // Register helper when class is loaded
  static {
    handlebars.registerHelper("currentYear", () => {
      return new Date().getFullYear();
    });
  }
  private static compileTemplate(
    templateName: string,
    data: Record<string, any>
  ): string {
    const templateString = this.readTemplate(templateName);
    const compiledTemplate = handlebars.compile(templateString);
    return compiledTemplate(data);
  }

  // Company Created For Admin Email
  static getCompanyCreatedForAdmin(data: {
    adminName: string;
    companyName: string;
  }): string {
    return this.compileTemplate("companyCreatedForAdmin", data);
  }

  // REset PassWord
  static getForgotPassword(data: {
    userName: string;
    resetLink: string;
  }): string {
    return this.compileTemplate("forgotPassword", data);
  }

  // User Signup Email
  static getUserSignup(data: {
    userName: string;
    redirectLink: string;
    message?: string;
  }): string {
    return this.compileTemplate("userSignup", data);
  }

  // User Activation/Deactivation Email
  static getUserDeactivationEmail(data: {
    userName: string;
    isDeactivated: boolean;
    loginLink: string;
    deactivationReason?: string;
  }): string {
    return this.compileTemplate("userDeactivation", data);
  }

  // email verification success
  static getEmailVerificationSucces(data: {
    redirectLink: string;
  }): string {
    return this.compileTemplate("emailVerificationSuccess", data);
  }
  
  //Resend OTP
  static getAuthOTP(data: { otp: number }): string {
    return this.compileTemplate("authOTP", data);
  }

  //login alert
  static getLoginAlert(data: {
    userName: string;
    ipAddress: string;
    location: string;
  }): string {
    return this.compileTemplate("newLoginAlert", data);
  }
}
