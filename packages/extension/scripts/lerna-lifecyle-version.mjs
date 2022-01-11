/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";

const version = require("../package.json").version;
(async () => {
  const sementic = semver.parse(version);
  const versionWithoutPrerelease = `${sementic.major}.${sementic.minor}.${sementic.patch}`;

  const manifestPath = path.join(__dirname, "../src/manifest.json");
  await $`sed 's/"version": "[0-9.]*",/"version": "${versionWithoutPrerelease}",/' ${manifestPath} > manifest.temp`;
  await $`mv manifest.temp ${manifestPath}`;

  await $`git add ${manifestPath}`;
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
