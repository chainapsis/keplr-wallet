/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import deepmerge from "deepmerge";
import fs from "fs";

const baseManifest = require("../src/manifest.json");
const firefoxManifestProperties = require("../src/manifest.firefox.json");

const firefoxManifest = deepmerge(baseManifest, firefoxManifestProperties, {
  arrayMerge: (_, source) => source,
});

(async () => {
  try {
    const chromePath = path.join(__dirname, "../build/chrome");
    const firefoxPath = path.join(__dirname, "../build/firefox");
    const firefoxManifestPath = path.join(firefoxPath, "manifest.json");

    await $`rm -rf ${firefoxPath}`;
    await $`cp -pfR ${chromePath}/ ${firefoxPath}/`;
    await $`rm ${firefoxManifestPath}`;

    fs.writeFileSync(
      firefoxManifestPath,
      JSON.stringify(firefoxManifest, null, 2),
      { mode: 0o644 }
    );
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
