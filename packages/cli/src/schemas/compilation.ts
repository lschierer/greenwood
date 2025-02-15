import { z } from "zod";

import { zodUrl } from "./utlilityTypes.js";

import { Page } from "./content.js";
import { Config } from "./config.js";

export const Compilation = z.object({
  context: z.object({
    dataDir: zodUrl,
    outputDir: zodUrl,
    userWorkspace: zodUrl,
    apisDir: zodUrl,
    pagesDir: zodUrl,
    userLayoutsDir: zodUrl,
    scratchDir: zodUrl,
    projectDirectory: zodUrl,
    layoutsDir: zodUrl,
  }),
  graph: z.array(Page),
  config: Config,
});

/* I am not sure how best to represent the data in Frontmatter */
export const FrontMatter = z.object({
  collection: z.string().optional(),
  label: z.string().optional(),
  layout: z.string().optional(),
  title: z.string().optional(),
  imports: z.array(z.string()).optional(),
  data: z
    .union([z.record(z.string(), z.string()), z.map(z.string(), z.string())])
    .optional(),
});
