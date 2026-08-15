import { z } from "zod";

/**
 * NOORE admin catalog validation (Phase 6). Inputs are validated before any
 * RPC call; the DB functions remain the final authority. No secrets are ever
 * accepted or stored.
 */

const slugSchema = z
  .string()
  .trim()
  .min(1, "Please enter a slug.")
  .max(120, "Slug is too long.")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes only.");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Please enter a name.")
  .max(120, "Name is too long.");

const uuidSchema = z.string().uuid("Invalid identifier.");

const optionalLongText = z
  .string()
  .trim()
  .max(2000, "Text is too long.")
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : null));

const priceSchema = z
  .coerce
  .number()
  .int("Price must be a whole number.")
  .min(0, "Price cannot be negative.")
  .max(100_000_000, "Price is too large.");

const sortOrderSchema = z
  .coerce
  .number()
  .int()
  .min(-100000, "Sort order is out of range.")
  .max(100000, "Sort order is out of range.");

const hexSchema = z
  .string()
  .trim()
  .max(7, "Hex code is too long.")
  .optional()
  .transform((value) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      throw new Error("Hex code must look like #A29688.");
    }
    return trimmed.toUpperCase();
  });

export const productFieldsSchema = z.object({
  slug: slugSchema,
  categoryId: uuidSchema,
  name: nameSchema,
  description: optionalLongText,
  fabric: optionalLongText,
  care: optionalLongText,
  shippingInfo: optionalLongText,
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isSignature: z.boolean(),
  sortOrder: sortOrderSchema,
});

export const productCreateSchema = productFieldsSchema.extend({
  price: priceSchema,
});

export const productUpdateSchema = productFieldsSchema.extend({
  productId: uuidSchema,
});

export const productPriceSchema = z.object({
  productId: uuidSchema,
  price: priceSchema,
});

export const productStatusSchema = z.object({
  productId: uuidSchema,
  isActive: z.boolean(),
});

export const inventoryAdjustSchema = z.object({
  variantId: uuidSchema,
  delta: z
    .coerce
    .number()
    .int("Delta must be a whole number.")
    .min(-1_000_000, "Delta is too large.")
    .max(1_000_000, "Delta is too large.")
    .refine((value) => value !== 0, "Delta cannot be zero."),
  reason: z
    .string()
    .trim()
    .min(1, "A reason is required.")
    .max(200, "Reason is too long."),
});

export const categorySchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  sortOrder: sortOrderSchema,
});

export const categoryUpdateSchema = categorySchema.extend({
  id: uuidSchema,
});

export const colorSchema = z.object({
  name: nameSchema,
  hex: hexSchema,
  sortOrder: sortOrderSchema,
});

export const colorUpdateSchema = colorSchema.extend({
  id: uuidSchema,
});

export const sizeSchema = z.object({
  name: nameSchema,
  sortOrder: sortOrderSchema,
});

export const sizeUpdateSchema = sizeSchema.extend({
  id: uuidSchema,
});

export const referenceEntitySchema = z.enum(["category", "color", "size"]);

export type ReferenceEntity = z.infer<typeof referenceEntitySchema>;

export const referenceMoveSchema = z.object({
  entity: referenceEntitySchema,
  id: uuidSchema,
  direction: z.enum(["up", "down"]),
});

const imageAltTextSchema = z
  .string()
  .trim()
  .max(300, "Alt text is too long.")
  .transform((value) => (value ? value.trim() : null));

export const productImageAltSchema = z.object({
  imageId: uuidSchema,
  altText: imageAltTextSchema,
});

export const productImageMoveSchema = z.object({
  imageId: uuidSchema,
  direction: z.enum(["up", "down"]),
});

export const productImageDeleteSchema = z.object({
  imageId: uuidSchema,
});
