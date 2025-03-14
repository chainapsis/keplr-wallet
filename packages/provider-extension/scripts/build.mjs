/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";

(async () => {
  const basePath = path.join(__dirname, "../");
  const srcPath = path.join(__dirname, "../src");
  const constantsPath = path.join(srcPath, "constants.ts");

  let error;

  try {
    await $`cp ${constantsPath} ${constantsPath}.backup`;

    const metaId = process.env["KEPLR_EXT_PROVIDER_META_ID"];
    if (metaId) {
      await $`sed 's/export const metaId: string | undefined = undefined;/export const metaId: string | undefined = "${metaId}";/' ${constantsPath} > ${constantsPath}.fix`;
      await $`mv ${constantsPath}.fix ${constantsPath}`;
    }

    await $`cd ${basePath} && npx tsc`;
  } catch (e) {
    console.log(e);
    error = e;
  } finally {
    // if backup exists, restore it.
    await $`mv -f ${constantsPath}.backup ${constantsPath}`;

    await $`rm -f ${constantsPath}.backup`;
    await $`rm -f ${constantsPath}.fix`;
  }

  if (error) {
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
