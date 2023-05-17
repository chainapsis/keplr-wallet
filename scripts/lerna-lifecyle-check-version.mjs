/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";
import fs from "fs";

const version = require("../lerna.json").version;
(async () => {
  try {
    const sementic = semver.parse(version);
    if (sementic.prerelease.length === 0) {
      const packages = fs.readdirSync(`${__dirname}/../packages/`);
      for (const pack of packages) {
        const stat = fs.statSync(`${__dirname}/../packages/${pack}`);
        if (
          stat.isDirectory() &&
          fs.existsSync(`${__dirname}/../packages/${pack}/package.json`)
        ) {
          const packageJson = JSON.parse(
            fs.readFileSync(
              `${__dirname}/../packages/${pack}/package.json`,
              "utf8"
            )
          );
          const sem = semver.parse(packageJson.version);
          if (sem.prerelease.length !== 0) {
            throw new Error(
              `The root version doesn't have prelease, but some packages have a prelease. Suggest you to use "lerna version --conventional-commits --conventional-graduate --no-changelog": ${pack}`
            );
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
