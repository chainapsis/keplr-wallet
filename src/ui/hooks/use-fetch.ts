import Axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";

export const useFetch = <R = any>(
  url: string,
  type: "post" | "get",
  config?: AxiosRequestConfig
) => {
  const [refresh, setRefresh] = useState<() => Promise<void> | undefined>();
  const [data, setData] = useState<R | undefined>();
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let isMounted = true;
    const refresh = async () => {
      // If url is empty, do nothing.
      if (!url) {
        return;
      }

      if (isMounted) {
        setFetching(true);
      }

      const fetchFunction = type === "post" ? Axios.post : Axios.get;
      try {
        const result = await fetchFunction<R>(url, config);
        // If fetching succeeds.
        if (result.status === 200 || result.status === 202) {
          if (isMounted) {
            setData(result.data);
          }
        } else {
          // If fetching fails
          if (isMounted) {
            setError(new Error(result.statusText));
          }
        }
      } catch (e) {
        if (isMounted) {
          setError(e);
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    };

    refresh();

    setRefresh(() => refresh);
    return () => {
      isMounted = false;
    };
  }, [url, type, config]);

  return {
    url,
    type,
    config,
    refresh,
    data,
    fetching,
    error
  };
};
