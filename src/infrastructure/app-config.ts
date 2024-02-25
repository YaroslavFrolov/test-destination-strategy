import dotenv from "dotenv";
import { z } from "zod";

export const STRATEGY_PRESETS = {
  ALL: "ALL",
  ANY: "ANY",
} as const;

const configSchema = z.object({
  PORT: z.coerce.number(),
  JWT_SECRET: z.string().min(5),
  DEFAULT_STRATEGY: z
    .nativeEnum(STRATEGY_PRESETS)
    .default(STRATEGY_PRESETS.ALL),
});

type AppConfig = z.infer<typeof configSchema>;

let appConfig: AppConfig;

export const initAppConfig = () => {
  dotenv.config();
  appConfig = configSchema.parse(process.env);
};

export const getAppConfig = () => appConfig;
