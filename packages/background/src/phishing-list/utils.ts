export function parseDomain(param: string): string[] {
  let domain = param;

  if (domain.match(/^[a-zA-Z0-9-]+:\/\/.+$/)) {
    domain = domain.replace(/^[a-zA-Z0-9-]+:\/\//, "");
  }

  const slash = domain.indexOf("/");
  if (slash >= 0) {
    domain = domain.slice(0, slash);
  }
  const qMark = domain.indexOf("?");
  if (qMark >= 0) {
    domain = domain.slice(0, qMark);
  }

  const split = domain
    .split(".")
    .map((str) => str.trim())
    .filter((str) => str.length > 0);

  if (split.length < 2) {
    throw new Error(`Invalid domain: ${param}`);
  }

  const i = split[split.length - 1].indexOf(":");
  if (i >= 0) {
    split[split.length - 1] = split[split.length - 1].slice(0, i);
  }

  return split;
}
