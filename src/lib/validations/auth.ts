import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();

export const passwordSchema = z
  .string()
  .min(8, "Şifrə ən azı 8 simvol olmalıdır")
  .max(100);

export const phoneRawSchema = z.string().trim().min(7).max(20);

export const otpCodeSchema = z.string().trim().regex(/^\d{6}$/, "6 rəqəmli kod daxil edin");

export const emailRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1).max(80).optional(),
});

export const emailLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const phoneRequestSchema = z.object({
  phone: phoneRawSchema,
});

export const phoneVerifySchema = z.object({
  phone: phoneRawSchema,
  code: otpCodeSchema,
});

export type EmailRegisterInput = z.infer<typeof emailRegisterSchema>;
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
