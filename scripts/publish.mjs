/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";
import { version as lernaVersion } from "../lerna.json";

(async () => {
  const versions = (await $`git tag --points-at HEAD`).stdout
    .split(/\s/)
    .map((v) => v.trim())
    .filter((v) => !!v);

  let foundedVersion = "";

  for (const version of versions) {
    try {
      // semver.parse will check that the version has the major, minor, patch version (with optional prerelease version).
      const sementic = semver.parse(version);

      if (sementic) {
        if (lernaVersion !== sementic.version) {
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

        await $`lerna publish from-git --yes ${
          isPrelease ? "--dist-tag next" : ""
        }`;
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (foundedVersion) {
    console.log(`${foundedVersion} published`);
  } else {
    console.log("No version tag found");
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
