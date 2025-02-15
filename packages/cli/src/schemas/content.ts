import { z } from "zod";

export const Page = z.object({
  id: z.string(),
  title: z.string(),
  label: z.string(),
  route: z.string(),
  data: z.object({}).optional(),
});
export type Page = z.infer<typeof Page>;

export const Collection = z.array(Page);
export type Collection = z.infer<typeof Collection>;

export const Graph = z.array(Page);
export type Graph = z.infer<typeof Graph>;
