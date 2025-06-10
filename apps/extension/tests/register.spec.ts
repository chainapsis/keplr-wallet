import { test, register } from "./fixtures";

test("register page", async ({ page, extensionId }) => {
  await register(page, extensionId);
});
