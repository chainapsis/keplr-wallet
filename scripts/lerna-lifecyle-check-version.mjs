/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import semver from "semver";
import fs from "fs";

const version = require("../lerna.json").version;
(async () => {
  try {
    const semantic = semver.parse(version);
    if (semantic.prerelease.length === 0) {
      const packages = [];
      const _packages = fs.readdirSync(`${__dirname}/../packages/`);
      for (const dir of _packages) {
        packages.push({
          p: "packages",
          dir,
        });
      }
      const _apps = fs.readdirSync(`${__dirname}/../apps/`);
      for (const dir of _apps) {
        packages.push({
          p: "apps",
          dir,
        });
      }

      for (const pack of packages) {
        const stat = fs.statSync(`${__dirname}/../${pack.p}/${pack.dir}`);
        if (
          stat.isDirectory() &&
          fs.existsSync(`${__dirname}/../${pack.p}/${pack.dir}/package.json`)
        ) {
          const packageJson = JSON.parse(
            fs.readFileSync(
              `${__dirname}/../${pack.p}/${pack.dir}/package.json`,
              "utf8"
            )
          );
          const sem = semver.parse(packageJson.version);
          if (sem.prerelease.length !== 0) {
            throw new Error(
              `The root version doesn't have prelease, but some packages have a prelease. Suggest you to use "lerna version --conventional-commits --conventional-graduate --no-changelog": ${pack.dir}`
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
