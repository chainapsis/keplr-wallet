// eslint-disable-next-line import/no-extraneous-dependencies
import {
  test as base,
  chromium,
  type BrowserContext,
  Page,
} from "@playwright/test";
import path from "path";

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "../build/manifest-v3");
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});
export const expect = test.expect;

export const register = async (page: Page, extensionId: string) => {
  await page.goto(`chrome-extension://${extensionId}/register.html`);

  await page.waitForSelector(
    '[data-scene-name="intro"][data-scene-top="true"][data-scene-is-animating="false"]'
  );

  const button1 = page.locator("#import-wallet-button");
  await button1.click();

  await page.waitForSelector(
    '[data-scene-name="existing-user"][data-scene-top="true"][data-scene-is-animating="false"]'
  );

  const button2 = page.locator("#recovery-button");
  await button2.click();

  await page.waitForSelector(
    '[data-scene-name="recover-mnemonic"][data-scene-top="true"][data-scene-is-animating="false"]'
  );

  const input1 = page.locator("#input-mnemonic-0");
  await expect(input1).toBeFocused();

  const textToPaste = process.env["KEPLR_TEST_MNEMONIC"];
  if (!textToPaste) {
    throw new Error("You must set KEPLR_TEST_MNEMONIC env");
  }

  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text);
  }, textToPaste);

  const isMac = process.platform === "darwin";
  if (isMac) {
    await page.keyboard.press("Meta+V");
  } else {
    await page.keyboard.press("Control+V");
  }

  const button3 = page.locator("#import-button");
  await button3.click();

  await page.waitForSelector(
    '[data-scene-name="name-password"][data-scene-top="true"][data-scene-is-animating="false"]'
  );

  const inputName = page.locator("#input-name");
  await expect(inputName).toBeFocused();

  await inputName.fill("test-acc");

  const inputPassword = page.locator("#input-password");
  await inputPassword.fill("password");

  const inputPasswordConfirm = page.locator("#input-password-confirm");
  await inputPasswordConfirm.fill("password");

  const button4 = page.locator("#button-submit");
  await button4.click();

  await page.waitForSelector(
    '[data-scene-name="enable-chains"][data-scene-top="true"][data-scene-is-animating="false"]'
  );
};
