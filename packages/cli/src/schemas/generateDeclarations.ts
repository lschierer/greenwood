import { createTypeAlias, printNode, zodToTs } from "zod-to-ts";

import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);

/* I tried to be smart dynamic about it, but I can't figure otu the types
const files = ["compilation"];
files.forEach(async (file) => {
  const fileImport = await import(`./${file}.ts`);
  const exports = Object.keys(fileImport);
  const fileName = `../types/${file}.d.ts`;
  exports.map((e, index) => {
    console.log(`attempting declaration for ${e}`);
    const schema = fileImport["e"];
    const { node } = zodToTs(schema, e);
    console.log(`node is \n${printNode(node)}`);
    const typeAlias = createTypeAlias(node, e);
    const nodeString = printNode(typeAlias);
    if (index == 0) {
      fs.writeFileSync(
        fileName,
        `
        export ${nodeString}
      `,
        "utf-8",
      );
    } else {
      fs.appendFileSync(
        fileName,
        `
      export ${nodeString}
    `,
        "utf-8",
      );
    }
  });
});
*/
import { Compilation, FrontMatter } from "./compilation";

let fileName = path.resolve(currentDir, `../types/compilation.d.ts`);

let { node } = zodToTs(Compilation, "Compilation");
let typeAlias = createTypeAlias(node, "Compilation");
let nodeString = printNode(typeAlias);
fs.writeFileSync(
  fileName,
  `
export ${nodeString}
`,
  {
    encoding: "utf-8",
    mode: 0o660,
    flag: "w",
  },
);

node = zodToTs(FrontMatter, "FrontMatter").node;
typeAlias = createTypeAlias(node, "FrontMatter");
nodeString = printNode(typeAlias);
fs.appendFileSync(
  fileName,
  `
export ${nodeString}
`,
  {
    encoding: "utf-8",
    mode: 0o660,
  },
);
