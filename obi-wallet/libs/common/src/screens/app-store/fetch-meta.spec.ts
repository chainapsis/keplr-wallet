import { fetchMeta } from "./fetch-meta";

test("Osmosis", async () => {
  const meta = await fetchMeta("https://osmosis.zone");
  expect(meta.title).toEqual("Osmosis");
  expectIconToBePng(meta.icon);
});

test("Kado", async () => {
  const meta = await fetchMeta("https://kado.money");
  expect(meta.title).toEqual("Kado");
  expectIconToBePng(meta.icon);
});

function expectIconToBePng(icon: string | null) {
  expect(icon?.startsWith("https://")).toEqual(true);
  expect(icon?.endsWith(".png")).toEqual(true);
}
