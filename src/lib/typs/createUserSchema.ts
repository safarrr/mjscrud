import z from "zod";

export const createUserSchema = z.object({
  username: z.string().max(150),
  firstname: z.string().max(255),
  lastname: z.string().max(255),
  password: z.string().min(6),
  birthdate: z.coerce.date().optional(),
  address: z
    .object({
      street: z.string().max(255),
      city: z.string().max(255),
      province: z.string().max(255),
      postalCode: z.string().max(20),
    })
    .optional(),
});
