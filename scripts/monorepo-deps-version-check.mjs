/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import fs from "fs";

function getPackageJsons() {
  const res = [];

  const packageDirs = fs.readdirSync(`${__dirname}/../packages/`);
  for (const dir of packageDirs) {
    const stat = fs.statSync(`${__dirname}/../packages/${dir}`);
    if (
      stat.isDirectory() &&
      fs.existsSync(`${__dirname}/../packages/${dir}/package.json`)
    ) {
      const packageJson = JSON.parse(
        fs.readFileSync(`${__dirname}/../packages/${dir}/package.json`, "utf8")
      );

      res.push(packageJson);
    }
  }

  return res;
}

const version = require("../lerna.json").version;
(async () => {
  const packages = [];
  const privatePackages = [];

  try {
    const packageJsons = getPackageJsons();
    for (const packageJson of packageJsons) {
      const name = packageJson.name;

      if (packageJson.version !== version) {
        throw new Error(
          `${name} has different version (expected: ${version}, actual: ${packageJson.version})`
        );
      }

      if (packageJson.private === true) {
        privatePackages.push(name);
      } else {
        packages.push(name);
      }
    }

    for (const packageJson of packageJsons) {
      const name = packageJson.name;
      const isPrivate =
        privatePackages.find((p) => p === packageJson.name) != null;
      const dependencies = packageJson.dependencies ?? [];
      for (const depName of Object.keys(dependencies)) {
        const isPrivateDep = privatePackages.find((p) => p === depName) != null;
        if (!isPrivate && isPrivateDep) {
          throw new Error(
            `${name} is public package, but has private package (${depName})`
          );
        }

        const isPackage =
          isPrivateDep || packages.find((p) => p === depName) != null;
        if (isPackage) {
          if (dependencies[depName] !== version) {
            throw new Error(
              `${name} is different version of ${depName} (expected: ${version}, actual: ${dependencies[depName]})`
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
