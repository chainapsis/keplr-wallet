/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";
import fs from "fs";

const lernaFile = fs.readFileSync("./lerna.json", "utf8");
const lerna = JSON.parse(lernaFile);

(async () => {
  const versions = (await $`git tag --points-at HEAD`).stdout
    .split(/\s/)
    .map((v) => v.trim())
    .filter((v) => !!v);

  let foundedVersion = "";

  for (const version of versions) {
    // semver.parse will check that the version has the major, minor, patch version (with optional prerelease version).
    const sementic = semver.parse(version);

    if (sementic) {
      if (lerna.version !== sementic.version) {
        console.log(
          `WARNING: ${sementic.version} founded. But, it is different with lerna's package versions.`
        );
        continue;
      }

      if (foundedVersion) {
        console.log(
          `WARNING: ${foundedVersion} already published. Only one tag can be published at once.`
        );
        continue;
      }

      foundedVersion = version;

      const isPrelease = sementic.prerelease.length > 0;

      if (isPrelease) {
        await $`lerna publish from-package --yes --dist-tag next`;
      } else {
        await $`lerna publish from-package --yes`;
      }
    }
  }

  if (foundedVersion) {
    console.log(`${foundedVersion} published to NPM`);
  } else {
    throw new Error("No version tag found");
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
