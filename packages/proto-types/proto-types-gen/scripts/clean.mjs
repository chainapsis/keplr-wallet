/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import glob from "glob";

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
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
