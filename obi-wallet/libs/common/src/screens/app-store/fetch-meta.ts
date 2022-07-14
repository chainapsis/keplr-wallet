import "isomorphic-unfetch";
import { parse } from "node-html-parser";

export interface Meta {
  title: string | null;
  icon: string | null;
}

export async function fetchMeta(url: string): Promise<Meta> {
  const response = await fetch(url);
  const html = await response.text();
  const root = parse(html);

  return {
    title: getTitle(),
    icon: getIcon(),
  };

  function getTitle(): string | null {
    const title = root.querySelector("title");
    return title?.childNodes?.[0].text ?? null;
  }

  function getIcon(): string | null {
    const icon =
      root.querySelector("link[rel='apple-touch-icon']") ??
      root.querySelector("link[rel='icon']");
    const href = icon?.getAttribute("href") ?? null;

    const base = root.querySelector("base");
    const origin = base?.getAttribute("href") ?? url;

    return href && new URL(href, origin).href;
  }
}
