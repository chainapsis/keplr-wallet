/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";

(async () => {
  try {
    const targetPlatform = process.argv.find(
      (arg) => arg === "android" || arg === "ios"
    );
    if (!targetPlatform) {
      throw new Error("Please provide target platform");
    }

    console.log(`Deploy to ${targetPlatform}`);

    const versions = (await $`git tag --points-at HEAD`).stdout
      .split(/\s/)
      .map((v) => v.trim())
      .filter((v) => !!v);

    for (const version of versions) {
      if (!version.startsWith("mobile/v")) {
        continue;
      }

      const semantic = semver.parse(version.replace("mobile/v", ""));

      if (semantic) {
        if (process.env["TARGET_TAG"] !== semantic.raw) {
          console.log(
            `Found ${semantic.raw}. But it is not matched to target tag (${process.env["TARGET_TAG"]})`
          );
          continue;
        }

        if (semantic.prerelease.length > 0) {
          if (semantic.prerelease[0] !== "codepush") {
            throw new Error(`Invalid version: ${semantic.raw}`);
          }
        }

        const isCodepush =
          semantic.prerelease.length === 2 &&
          semantic.prerelease[0] === "codepush";

        console.log(`Found ${semantic.raw}. IsCodepush: ${isCodepush}`);

        const directory =
          targetPlatform === "android"
            ? `${__dirname}/../../packages/mobile/android/fastlane`
            : `${__dirname}/../../packages/mobile/ios/fastlane`;

        if (isCodepush) {
          await $`cd ${directory} && bundle exec fastlane deploy_codepush version:${semantic.raw}`;
        } else {
          await $`cd ${directory} && bundle exec fastlane deploy version:${semantic.raw}`;
        }
      }
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
