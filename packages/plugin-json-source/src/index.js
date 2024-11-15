/*
 *
 * Enables using JavaScript to import TypeScript files, using ESM syntax.
 *
 */
import fs from "fs/promises";
import * as path from "path";
import { ResourceInterface } from "@greenwood/cli/src/lib/resource-interface.js";

class TypeScriptResource extends ResourceInterface {
  constructor(compilation, options) {
    super(compilation, options);
    this.extensions = [".json"];
    this.servePage = options.servePage;
    this.contentType = "application/json";
  }

  async shouldServe(url) {
    const { pathname, protocol } = url;
    const isJsonFile =
      protocol === "file:" && pathname.split(".").pop() === this.extensions[0];

    return (
      isJsonFile ||
      (isJsonFile &&
        url.searchParams.has("type") &&
        url.searchParams.get("type") === this.extensions[0])
    );
  }

  async serve(url) {
    const { projectDirectory } = this.compilation.context;
    const URLObject = new URL(url);
    const absPath = URLObject.pathname;
    const relativePath = path.relative(projectDirectory, relativePath);
    const data = await import(absPath, { with: { type: "JSON" } });
    const pageKeys = Object.keys(data);

    const title = pageKeys.includes("title")
      ? data["title"]
      : relativePath.replaceAll("/", " ");
    const label = pageKeys.includes("label") ? data["label"] : title;
    const id = pageKeys.includes("id")
      ? data["id"]
      : relativePath.replaceAll("/", "-");
    const route = url;
    const body = pageKeys.includes("body") ? data["body"] : "";

    // not quite sure where to put the front matter in the return object, is it in the headers, or in the body?
    // if in the body, what key does the actual body reside under?
    if (pageKeys)
      return new Response(body, {
        headers: new Headers({
          "Content-Type": this.contentType,
        }),
      });
  }
}

const greenwoodPluginJSONSource = (options = {}) => {
  return [
    {
      type: "resource",
      name: "plugin-import-typescript:resource",
      provider: (compilation) =>
        new TypeScriptResource(compilation, {
          servePage: "dynamic",
          ...options,
        }),
    },
  ];
};

export { greenwoodPluginJSONSource };
