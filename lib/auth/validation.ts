import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Please enter your email address.")
  .email("Please enter a valid email address.")
  .max(254, "Email address is too long.");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(72, "Password must be at most 72 characters.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Please enter your full name.")
  .max(80, "Name must be at most 80 characters.");

export const profileSchema = z.object({
  fullName: displayNameSchema,
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long.")
    .refine(
      (value) =>
        value === "" || /^\+?[0-9][0-9\s\-()]{4,19}$/.test(value),
      "Please enter a valid phone number."
    )
    .transform((value) => (value.trim() === "" ? null : value.trim())),
});

export const addressSchema = z.object({
  fullName: displayNameSchema,
  phone: z
    .string()
    .trim()
    .min(6, "Please enter a phone number.")
    .max(20, "Phone number is too long."),
  address: z
    .string()
    .trim()
    .min(5, "Please enter your street address.")
    .max(160, "Address is too long."),
  city: z
    .string()
    .trim()
    .min(2, "Please enter your city.")
    .max(80, "City is too long."),
  state: z
    .string()
    .trim()
    .max(80, "State is too long.")
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  postalCode: z
    .string()
    .trim()
    .max(12, "Postal code is too long.")
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : null)),
  country: z
    .string()
    .trim()
    .min(2, "Please choose a country.")
    .max(2, "Invalid country code.")
    .toUpperCase(),
});
