import { z } from "zod";
import destionations from "./destinations.json" assert { type: "json" };
import { TRANSPORT_TYPES } from "../services/transport-service";

const destinationItemSchema = z.object({
  name: z.string().trim(),
  transport: z.nativeEnum(TRANSPORT_TYPES),
  url: z.string().trim().url().optional(),
});

const destinationsSchema = destinationItemSchema
  .refine((schema) => {
    if (schema.transport.includes("http.") && !schema.url) {
      return false;
    } else {
      return true;
    }
  }, "If transport is 'http.*' please provide the 'url' field too!")
  .array();

export type DestinationItem = z.infer<typeof destinationItemSchema>;

let validDestionations: DestinationItem[] = [];

export const initDestiantions = () => {
  validDestionations = destinationsSchema.parse(destionations);
};

export const getDestinations = () => validDestionations;
