import { z } from "zod";

import { zodUrl } from "./utlilityTypes.js";

import { Page } from "./content.js";

/* this could also be a z.enum but I believe this most closely matches the original .d.ts */
export const PLUGIN_TYPES = z.union([
  z.literal("adapter"),
  z.literal("context"),
  z.literal("copy"),
  z.literal("renderer"),
  z.literal("resource"),
  z.literal("rollup"),
  z.literal("server"),
  z.literal("source"),
]);
export type PLUGIN_TYPES = z.infer<typeof PLUGIN_TYPES>;

const Plugin = z.object({
  name: z.string(),
  type: PLUGIN_TYPES,
  provider: z
    .function()
    .returns(z.unknown())
    .args(/* once I define compilation, it goes here */),
});

export const AdapterPlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(z.promise(z.function())),
});
export type AdapterPlugin = z.infer<typeof AdapterPlugin>;

export const ContextPlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(
      z.object({
        layouts: z.array(zodUrl),
      }),
    ),
});
export type ContextPlugin = z.infer<typeof ContextPlugin>;

export const CopyPlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(
      z.promise(
        z.array(
          z.object({
            from: zodUrl,
            to: zodUrl,
          }),
        ),
      ),
    ),
});
export type CopyPlugin = z.infer<typeof CopyPlugin>;

export const RendererPlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(
      z.union([
        z.object({
          executeModuleUrl: zodUrl,
        }),
        z.object({
          customUrl: zodUrl,
        }),
      ]),
    ),
});
export type RendererPlugin = z.infer<typeof RendererPlugin>;

export const SERVE_PAGE_OPTIONS = z.union([
  z.literal("static"),
  z.literal("dynamic"),
]);
export type SERVE_PAGE_OPTIONS = z.infer<typeof SERVE_PAGE_OPTIONS>;

export const Resource = z.object({
  extensions: z.array(z.string()).optional(),
  servePage: SERVE_PAGE_OPTIONS.optional(),
  shouldResolve: z
    .function()
    .args(zodUrl)
    .returns(z.promise(z.boolean()))
    .optional(),
  resolve: z
    .function()
    .args(zodUrl)
    .returns(z.promise(z.instanceof(Request)))
    .optional(),
  shouldServe: z
    .function()
    .args(zodUrl)
    .returns(z.promise(z.boolean()))
    .optional(),
  serve: z
    .function()
    .args(zodUrl)
    .returns(z.promise(z.instanceof(Response)))
    .optional(),
  shouldPreIntercept: z
    .function()
    .args(zodUrl, z.instanceof(Request), z.instanceof(Response))
    .returns(z.promise(z.boolean()))
    .optional(),
  preIntercept: z
    .function()
    .args(zodUrl, z.instanceof(Request), z.instanceof(Response))
    .returns(z.promise(z.instanceof(Response)))
    .optional(),
  shouldIntercept: z
    .function()
    .args(zodUrl, z.instanceof(Request), z.instanceof(Response))
    .returns(z.promise(z.boolean()))
    .optional(),
  intercept: z
    .function()
    .args(zodUrl, z.instanceof(Request), z.instanceof(Response))
    .returns(z.promise(z.instanceof(Response)))
    .optional(),
  shouldOptimize: z
    .function()
    .args(zodUrl, z.instanceof(Response))
    .returns(z.promise(z.boolean()))
    .optional(),
  optimize: z
    .function()
    .args(zodUrl, z.instanceof(Response))
    .returns(z.promise(z.instanceof(Response)))
    .optional(),
});

export type Resource = z.infer<typeof Resource>;

export const ResourcePlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(Resource),
});
export type ResourcePlugin = z.infer<typeof ResourcePlugin>;

import { Plugin as rp } from "rollup";
export const RollupPlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(z.array(z.any())), //rp is an interface alias for some complicated thing that has an any in it. I cannot use z.instanceof() with an interface.
});
export type RollupPlugin = z.infer<typeof RollupPlugin>;

export const Server = z.object({
  start: z.function().returns(z.promise(z.any())),
  stop: z.function().returns(z.promise(z.any())).optional(),
});
export type Server = z.infer<typeof Server>;

export const ServerPlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(Server),
});
export type ServerPlugin = z.infer<typeof ServerPlugin>;

export const SourcePlugin = Plugin.extend({
  provider: z
    .function()
    .args(/* once I define compilation, it goes here */)
    .returns(z.array(Page)),
});
export type SourcePlugin = z.infer<typeof SourcePlugin>;

export const PLUGINS = z.union([
  AdapterPlugin,
  ContextPlugin,
  CopyPlugin,
  RendererPlugin,
  ResourcePlugin,
  RollupPlugin,
  ServerPlugin,
  SourcePlugin,
]);
export type PLUGINS = z.infer<typeof PLUGINS>;
