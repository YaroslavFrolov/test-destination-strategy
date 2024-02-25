import { z } from "zod";

export const loginSchema = z.object({
  name: z.string().trim().min(3).max(20),
  password: z.string().trim().min(6),
});

export type LoginPayload = z.infer<typeof loginSchema>;
