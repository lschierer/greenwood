import { ServerInterface } from "../lib/server-interface.js";
import { getDevServer } from "../lifecycles/serve.js";

const runDevServer = async (compilation) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      const { basePath, devServer } = compilation.config;
      const { port } = devServer;
      const postfixSlash = basePath === "" ? "" : "/";

      (await getDevServer(compilation)).listen(port, () => {
        console.info(
          `Started local development server at http://localhost:${port}${basePath}${postfixSlash}`,
        );

        const servers = [
          ...compilation.config.plugins
            .filter((plugin) => {
              return plugin.type === "server";
            })
            .map((plugin) => {
              const provider = plugin.provider(compilation);

              if (!(provider instanceof ServerInterface)) {
                console.warn(
                  `WARNING: ${plugin.name}'s provider is not an instance of ServerInterface.`,
                );
              }

              return provider;
            }),
        ];

        return Promise.all(
          servers.map(async (server) => {
            return await server.start();
          }),
        );
      });
    } catch (err) {
      reject(err);
    }
  });
};

export { runDevServer };
