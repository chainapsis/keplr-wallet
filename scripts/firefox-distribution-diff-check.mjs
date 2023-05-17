/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import FolderHash from "folder-hash";

(async () => {
  try {
    const root = path.join(__dirname, "..");

    const path1 = path.join(root, "build/firefox");
    const path2 = path.join(root, "packages/extension/build/firefox");

    const dist1 = path1;
    const dist2 = path2;

    await $`cd ${path1} && find . -name .DS_Store -exec rm {} \\;`;
    await $`cd ${path2} && find . -name .DS_Store -exec rm {} \\;`;

    const hash1 = (await FolderHash.hashElement(dist1)).hash;
    const hash2 = (await FolderHash.hashElement(dist2)).hash;

    if (hash1 !== hash2) {
      console.log(`Hash1: ${hash1}`);
      console.log(`Hash2: ${hash2}`);

      console.log(`Path1: ${path1}`);
      await $`cd ${path1} && find . -type f -exec openssl dgst -sha256 {} \\;`;

      console.log(`Path2: ${path2}`);
      await $`cd ${path2} && find . -type f -exec openssl dgst -sha256 {} \\;`;

      throw new Error("Distributions not equal");
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
