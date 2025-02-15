import { z } from "zod";

export const zodUrl = z.union([z.string().url(), z.instanceof(URL)]);
export type zodUrl = z.infer<typeof zodUrl>;
