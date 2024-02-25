import { z } from "zod";

export const eventSchema = z.object({
  payload: z.custom((x) => x !== undefined, "Can't find payload field"),
  strategy: z.string().trim().optional(),
  possibleDestinations: z.record(z.boolean()).array().min(1),
});

export type EventBody = z.infer<typeof eventSchema>;
