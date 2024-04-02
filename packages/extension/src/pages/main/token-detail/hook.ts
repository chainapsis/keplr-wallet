import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

export const usePaginatedCursorQuery = <R>(
  baseURL: string,
  initialUriFn: () => string,
  nextCursorQueryString: (page: number, prev: R) => Record<string, string>,
  isEndedFn: (prev: R) => boolean
): {
  isFetching: boolean;
  pages: {
    response: R | undefined;
    error?: Error;
  }[];
  next: () => void;
} => {
  const [pages, setPages] = useState<
    {
      response: R | undefined;
      error?: Error;
    }[]
  >([]);

  const baseURLRef = useRef(baseURL);
  baseURLRef.current = baseURL;
  const initialUriFnRef = useRef(initialUriFn);
  initialUriFnRef.current = initialUriFn;
  const nextCursorQueryStringRef = useRef(nextCursorQueryString);
  nextCursorQueryStringRef.current = nextCursorQueryString;
  const isEndedFnRef = useRef(isEndedFn);
  isEndedFnRef.current = isEndedFn;

  // 어차피 바로 useEffect에 의해서 fetch되기 때문에 true로 시작...
  const [isFetching, setIsFetching] = useState(true);
  useEffect(() => {
    simpleFetch<R>(baseURLRef.current, initialUriFnRef.current())
      .then((r) => {
        setPages([
          {
            response: r.data,
          },
        ]);
      })
      .catch((e) => {
        setPages([
          {
            response: undefined,
            error: e,
          },
        ]);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  const next = useCallback(() => {
    if (isFetching || pages.length === 0) {
      return;
    }

    const res = pages[pages.length - 1].response;
    if (!res) {
      return;
    }
    if (isEndedFnRef.current(res)) {
      return;
    }

    const nextPage = pages.length + 1;
    let uri = initialUriFnRef.current();
    const qs = nextCursorQueryStringRef.current(nextPage, res);
    const params = new URLSearchParams(qs);
    if (uri.length === 0 || uri === "/") {
      uri = `?${params.toString()}`;
    } else {
      uri += `&${params.toString()}`;
    }

    setIsFetching(true);
    simpleFetch<R>(baseURLRef.current, uri)
      .then((r) => {
        // TODO: 오류처리
        setPages((prev) => {
          const newPages = prev.slice();
          newPages.push({
            response: r.data,
          });
          return newPages;
        });
      })
      .catch((e) => {
        setPages((prev) => {
          const newPages = prev.slice();
          newPages.push({
            response: undefined,
            error: e,
          });
          return newPages;
        });
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [isFetching, pages]);

  return useMemo(() => {
    return {
      isFetching,
      pages,
      next,
    };
  }, [isFetching, next, pages]);
};
