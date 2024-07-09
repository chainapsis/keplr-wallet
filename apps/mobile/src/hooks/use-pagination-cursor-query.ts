import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {simpleFetch} from '@keplr-wallet/simple-fetch';

export const usePaginatedCursorQuery = <R>(
  baseURL: string,
  initialUriFn: () => string,
  nextCursorQueryString: (page: number, prev: R) => Record<string, string>,
  isEndedFn: (prev: R) => boolean,
  refreshKey?: string,
  isValidKey?: (key: string) => boolean,
): {
  isFetching: boolean;
  pages: {
    response: R | undefined;
    error?: Error;
  }[];
  next: () => void;
  refresh: () => void;
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

  const isValidKeyRef = useRef(isValidKey);
  isValidKeyRef.current = isValidKey;

  // refresh를 할때 이전에 쿼리가 진행 중이면
  // 두 쿼리 중에 뭐가 먼저 끝나느냐에 따라서 결과가 달라진다...
  // 쿼리는 cancel하는게 맞겠지만
  // 귀찮으니 그냥 seq를 이용해서 처리한다.
  const currentQuerySeq = useRef(0);
  useEffect(() => {
    currentQuerySeq.current++;
  }, [refreshKey]);

  // 어차피 바로 useEffect에 의해서 fetch되기 때문에 true로 시작...
  const [isFetching, setIsFetching] = useState(true);
  const _initialFetchIsDuringDeferred = useRef(false);
  const _initialFetch = () => {
    const fetch = () => {
      if (_initialFetchIsDuringDeferred.current) {
        return;
      }

      const querySeq = currentQuerySeq.current;
      simpleFetch<R>(baseURLRef.current, initialUriFnRef.current())
        .then(r => {
          if (querySeq === currentQuerySeq.current) {
            setPages([
              {
                response: r.data,
              },
            ]);
          }
        })
        .catch(e => {
          if (querySeq === currentQuerySeq.current) {
            setPages([
              {
                response: undefined,
                error: e,
              },
            ]);
          }
        })
        .finally(() => {
          if (querySeq === currentQuerySeq.current) {
            setIsFetching(false);
          }
        });
    };

    fetch();
  };
  const initialFetchRef = useRef(_initialFetch);
  initialFetchRef.current = _initialFetch;
  useEffect(() => {
    if (
      !isValidKeyRef.current ||
      !refreshKey ||
      isValidKeyRef.current(refreshKey)
    ) {
      initialFetchRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey);
  useEffect(() => {
    // 위에서 빈 deps의 useEffect에 의해서 처음에 쿼리가 발생한다.
    // prevRefreshKey 로직이 없으면 이 로직도 실행되면서 쿼리가 두번 발생한다.
    // 이 문제를 해결하려고 prevRefreshKey를 사용한다.
    if (prevRefreshKey !== refreshKey) {
      if (
        !isValidKeyRef.current ||
        !refreshKey ||
        isValidKeyRef.current(refreshKey)
      ) {
        setPages([]);
        setIsFetching(true);
        initialFetchRef.current();
      }

      setPrevRefreshKey(refreshKey);
    }
  }, [prevRefreshKey, refreshKey]);

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
    if (uri.length === 0 || uri === '/') {
      uri = `?${params.toString()}`;
    } else {
      uri += `&${params.toString()}`;
    }

    setIsFetching(true);
    const querySeq = currentQuerySeq.current;
    simpleFetch<R>(baseURLRef.current, uri)
      .then(r => {
        if (querySeq === currentQuerySeq.current) {
          setPages(prev => {
            const newPages = prev.slice();
            newPages.push({
              response: r.data,
            });
            return newPages;
          });
        }
      })
      .catch(e => {
        if (querySeq === currentQuerySeq.current) {
          setPages(prev => {
            const newPages = prev.slice();
            newPages.push({
              response: undefined,
              error: e,
            });
            return newPages;
          });
        }
      })
      .finally(() => {
        if (querySeq === currentQuerySeq.current) {
          setIsFetching(false);
        }
      });
  }, [isFetching, pages]);

  const refresh = useCallback(() => {
    if (isFetching) {
      return;
    }

    setPages([]);
    setIsFetching(true);

    initialFetchRef.current();
  }, [isFetching]);

  return useMemo(() => {
    return {
      isFetching,
      pages,
      next,
      refresh,
    };
  }, [isFetching, next, pages, refresh]);
};
