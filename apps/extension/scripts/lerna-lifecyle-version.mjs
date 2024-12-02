/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";

const version = require("../package.json").version;
(async () => {
  try {
    const semantic = semver.parse(version);
    const versionWithoutPrerelease = `${semantic.major}.${semantic.minor}.${semantic.patch}`;

    const manifestPaths = [
      path.join(__dirname, "../src/manifest.v2.json"),
      path.join(__dirname, "../src/manifest.v3.json"),
    ];
    for (const manifestPath of manifestPaths) {
      await $`sed 's/"version": "[0-9.]*",/"version": "${versionWithoutPrerelease}",/' ${manifestPath} > manifest.temp`;
      await $`mv manifest.temp ${manifestPath}`;

      await $`git add ${manifestPath}`;
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
