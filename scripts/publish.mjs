/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";

(async () => {
  const versions = (await $`git tag --points-at HEAD`).stdout
    .split(/\s/)
    .map((v) => v.trim())
    .filter((v) => !!v);

  for (const version of versions) {
    try {
      const sementic = semver.parse(version);

      if (sementic) {
        const isPrelease = sementic.prerelease.length > 0;

        await $`lerna publish from-git --yes ${
          isPrelease ? "--dist-tag next" : ""
        }`;

        break;
      }
    } catch (e) {
      console.log(e);
    }
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
