import { SimpleFetchRequestOptions, SimpleFetchResponse } from "./types";
import { SimpleFetchError } from "./error";

export async function simpleFetch<R>(
  baseURL: string,
  url: string,
  options?: SimpleFetchRequestOptions
): Promise<SimpleFetchResponse<R>> {
  if (url === "/") {
    // If url is "/", probably its mean should be to use only base url.
    // However, `URL` with "/" url generate the root url with removing trailing url from base url.
    // To prevent this invalid case, just handle "/" as "".
    url = "";
  }
  const fetched = await fetch(new URL(url, baseURL).toString(), options);

  let data: R;

  const contentType = fetched.headers.get("content-type") || "";
  if (contentType.startsWith("application/json")) {
    data = await fetched.json();
  } else if (contentType.startsWith("text/plain")) {
    data = (await fetched.text()) as any;
  } else {
    const r = await fetched.text();
    const trim = r.trim();
    if (trim.startsWith("{") && trim.endsWith("}")) {
      data = JSON.parse(trim);
    } else {
      data = r as any;
    }
  }

  const res = {
    data,
    headers: fetched.headers,
    status: fetched.status,
    statusText: fetched.statusText,
  };

  const validateStatusFn = options?.validateStatus || defaultValidateStatusFn;
  if (validateStatusFn(fetched.status)) {
    throw new SimpleFetchError(baseURL, url, res);
  }

  return res;
}

function defaultValidateStatusFn(status: number): boolean {
  return status === 200;
}
