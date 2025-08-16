import { z } from "zod";

const email = z
  .string({ error: "Email is required" })
  .email("Invalid email format");
const password = z
  .string({ error: "Password is required" })
  .max(100, "Password must be at most 100 character long")
  .min(8, "Password must be at least 8 character long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[@$!%*?&]/,
    "Password must contain at least one special character (@$!%*?&)",
  );

const name = z
  .string()
  .max(20, "Username must be at most 20 character long")
  .min(3, "Username must be at least 3 character long");

const retypePassword = z.string();

const signinPassword = z
  .string({ error: "Password is required" })

export const userSignUpSchema = z.object({
  name,
  email,
  password,
  retypePassword,
});

export const userSignInSchema = z.object({
  email,
  signinPassword,
});
