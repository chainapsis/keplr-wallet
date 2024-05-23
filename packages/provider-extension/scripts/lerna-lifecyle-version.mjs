/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";

const version = require("../package.json").version;
(async () => {
  try {
    const sementic = semver.parse(version);
    const versionWithoutPrerelease = `${sementic.major}.${sementic.minor}.${sementic.patch}`;

    const versionPath = path.join(__dirname, "../src/version.ts");
    //export const BUILD_VERSION = "0.12.90";
    await $`sed 's/export const BUILD_VERSION = "[0-9.]*";/export const BUILD_VERSION = "${versionWithoutPrerelease}";/' ${versionPath} > version.ts.temp`;
    await $`mv version.ts.temp ${versionPath}`;

    await $`git add ${versionPath}`;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
