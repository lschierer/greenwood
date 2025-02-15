import { z } from "zod";
import { zodUrl } from "./utlilityTypes.js";
import { PLUGINS } from "./plugins.js";

export const Config = z.object({
  activeContent: z.boolean().optional(),
  basePath: z.string().optional(),
  devServer: z
    .object({
      extensions: z.array(z.string()).optional(),
      hud: z.boolean().optional(),
      port: z.number().optional(),
      host: z.string().optional(),
    })
    .optional(),
  isolation: z.boolean().optional(),
  layoutsDirectory: z.string().optional(),
  optimization: z
    .union([
      z.literal("default"),
      z.literal("inline"),
      z.literal("none"),
      z.literal("static"),
    ])
    .optional(),
  markdown: z
    .object({
      plugins: z.array(z.string()).optional(),
    })
    .optional(),
  pagesDirectory: z.string().optional(),
  plugins: z.array(z.union([PLUGINS, z.array(PLUGINS)])).optional(),
  polyfills: z
    .object({
      importAttributes: z
        .array(z.union([z.literal("css"), z.literal("json")]))
        .optional()
        .nullable(),
      importMaps: z.boolean().optional(),
    })
    .optional(),
  port: z.number().optional(),
  prerender: z.boolean().optional(),
  staticRouter: z.boolean().optional(),
  workspace: zodUrl.optional(),
});
export type Config = z.infer<typeof Config>;
