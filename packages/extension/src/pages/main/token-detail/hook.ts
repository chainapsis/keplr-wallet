import { useCallback, useEffect, useRef, useState } from "react";
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
  }[];
  next: () => void;
} => {
  const [responses, setResponses] = useState<R[] | undefined>(undefined);

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
        // TODO: 오류처리
        setResponses([r.data]);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  const next = useCallback(() => {
    if (
      isFetching ||
      !responses ||
      responses.length === 0 ||
      isEndedFnRef.current(responses[responses.length - 1])
    ) {
      return;
    }

    const nextPage = responses.length + 1;
    let uri = initialUriFnRef.current();
    const qs = nextCursorQueryStringRef.current(
      nextPage,
      responses[responses.length - 1]
    );
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
        setResponses((res) => {
          const newRes = !res ? [] : [...res];
          newRes.push(r.data);
          return newRes;
        });
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [isFetching, responses]);

  return {
    isFetching,
    pages: !responses ? [] : responses.map((r) => ({ response: r })),
    next,
  };
};
