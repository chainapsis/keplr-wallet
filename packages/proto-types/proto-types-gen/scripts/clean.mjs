/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import glob from "glob";
import fs from "fs";
import path from "path";

function cleanEmptyDirectory(dir) {
  if (!fs.statSync(dir).isDirectory()) {
    return;
  }

  const name = path.basename(dir);
  if (name === "node_modules" || name === "proto-types-gen") {
    return;
  }

  const dirCandidates = fs.readdirSync(dir);
  if (dirCandidates.length === 0) {
    fs.rmdirSync(dir);
    return;
  }

  for (const candidate of dirCandidates) {
    cleanEmptyDirectory(path.join(dir, candidate));
  }

  // Re-evaluate
  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

(async () => {
  try {
    const rootDir = path.join(__dirname, "..");
    const targetDir = path.join(rootDir, "..");

    // Remove previous output if exist
    const previous = glob.sync(`${targetDir}/**/*.+(ts|js|cjs|mjs|map)`);
    for (const path of previous) {
      if (
        !path.includes("/proto-types-gen/") &&
        !path.includes("/node_modules/")
      ) {
        await $`rm -f ${path}`;
      }
    }

    cleanEmptyDirectory(targetDir);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
