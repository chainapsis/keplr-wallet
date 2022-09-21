const fs = require("fs");
const path = require("path");

const dist = path.join(
  __dirname,
  "../libs/injected-provider/dist/injected-provider.js"
);
const bundle = fs.readFileSync(dist, "utf8");
const content = `export const bundle = ${JSON.stringify(bundle)};
`;

const output = path.join(
  __dirname,
  "../apps/mobile/src/app/injected-provider/bundle.ts"
);
fs.writeFileSync(output, content, "utf8");
