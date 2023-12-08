import { SimpleFetchRequestOptions, SimpleFetchResponse } from "./types";
import { SimpleFetchError } from "./error";

export function makeURL(baseURL: string, url: string): string {
  const baseURLInstance = new URL(baseURL);
  baseURL = removeLastSlashIfIs(baseURLInstance.origin);
  url =
    removeLastSlashIfIs(baseURLInstance.pathname) +
    "/" +
    removeFirstSlashIfIs(url);

  return removeLastSlashIfIs(baseURL + "/" + removeFirstSlashIfIs(url));
}

function removeFirstSlashIfIs(str: string): string {
  if (str.length > 0 && str[0] === "/") {
    return str.slice(1);
  }

  return str;
}

function removeLastSlashIfIs(str: string): string {
  if (str.length > 0 && str[str.length - 1] === "/") {
    return str.slice(0, str.length - 1);
  }

  return str;
}

export async function simpleFetch<R>(
  baseURL: string,
  options?: SimpleFetchRequestOptions
): Promise<SimpleFetchResponse<R>>;

export async function simpleFetch<R>(
  baseURL: string,
  url?: string,
  options?: SimpleFetchRequestOptions
): Promise<SimpleFetchResponse<R>>;

export async function simpleFetch<R>(
  baseURL: string,
  url?: string | SimpleFetchRequestOptions,
  options?: SimpleFetchRequestOptions
): Promise<SimpleFetchResponse<R>> {
  if (typeof url !== "string") {
    if (url) {
      options = url;
    }

    url = "";
  }

  if (url === "/") {
    // If url is "/", probably its mean should be to use only base url.
    // However, `URL` with "/" url generate the root url with removing trailing url from base url.
    // To prevent this invalid case, just handle "/" as "".
    url = "";
  }
  const actualURL = makeURL(baseURL, url);
  const { headers: optionHeaders, ...otherOptions } = options || {};
  const fetched = await fetch(actualURL, {
    headers: {
      accept: "application/json, text/plain, */*",
      ...optionHeaders,
    },
    ...otherOptions,
  });

  let data: R;

  if (fetched.status === 204) {
    // 204 No Content
    data = undefined as any;
  } else {
    const contentType = fetched.headers.get("content-type") || "";
    if (contentType.startsWith("application/json")) {
      data = await fetched.json();
    } else {
      const r = await fetched.text();
      const trim = r.trim();
      if (trim.startsWith("{") && trim.endsWith("}")) {
        data = JSON.parse(trim);
      } else {
        data = r as any;
      }
    }
  }

  const res = {
    url: actualURL,
    data,
    headers: fetched.headers,
    status: fetched.status,
    statusText: fetched.statusText,
  };

  const validateStatusFn = options?.validateStatus || defaultValidateStatusFn;
  if (!validateStatusFn(fetched.status)) {
    throw new SimpleFetchError(baseURL, url, res);
  }

  return res;
}

function defaultValidateStatusFn(status: number): boolean {
  return status >= 200 && status < 300;
}
