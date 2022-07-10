import { fetchMeta } from "./fetch-meta";

test("Cosmostation", async () => {
  const meta = await fetchMeta("https://cosmostation.io");
  expect(meta.title).toBe("Cosmostation");
  expectIconToBePng(meta.icon);
});

test("Osmosis", async () => {
  const meta = await fetchMeta("https://osmosis.zone");
  expect(meta.title).toEqual("Osmosis");
  expectIconToBePng(meta.icon);
});

function expectIconToBePng(icon: string | null) {
  expect(icon?.startsWith("https://")).toEqual(true);
  expect(icon?.endsWith(".png")).toEqual(true);
}
