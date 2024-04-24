import dotEnv from "dotenv";
import { z } from "zod";

dotEnv.config();

const envSchema = z.object({
  PG_HOST: z.coerce.string(),
  PG_DATABASE: z.coerce.string(),
  PG_USER: z.coerce.string(),
  PG_PASSWORD: z.coerce.string(),
  PG_PORT: z.coerce.number(),
});


export const  env = envSchema.parse(process.env);