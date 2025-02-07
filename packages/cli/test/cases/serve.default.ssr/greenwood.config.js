import { ResourceInterface } from "@greenwood/cli/src/lib/resource-interface.js";

// here to test for https://github.com/ProjectEvergreen/greenwood/issues/1363
class BannerPluginResource extends ResourceInterface {
  constructor(compilation, options = {}) {
    super(compilation, options);

    this.contentType = ["text/html"];
  }

  async shouldOptimize(url, response) {
    return response.headers.get("Content-Type").indexOf(this.contentType[0]) >= 0;
  }

  async optimize(url, response) {
    let body = await response.text();

    body = body.replace(
      "<head>",
      `
      <head>
        <!-- banner plugin was here -->
    `,
    );

    return new Response(body);
  }
}

export default {
  port: 8181,
  plugins: [
    {
      type: "resource",
      name: "plugin-banner-content",
      provider: (compilation) => new BannerPluginResource(compilation),
    },
  ],
};
