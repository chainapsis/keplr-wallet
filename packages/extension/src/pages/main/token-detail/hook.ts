import { useEffect, useState } from "react";
import { simpleFetch } from "@keplr-wallet/simple-fetch";

export const usePaginatedCursorQuery = <R>(
  baseURL: string,
  uriFn: (page: number) => string
): {
  pages: {
    response: R | undefined;
  }[];
} => {
  const [response, setResponse] = useState<R | undefined>(undefined);

  useEffect(() => {
    simpleFetch<R>(baseURL, uriFn(1)).then((r) => {
      // TODO: 오류처리
      setResponse(r.data);
    });
  }, []);

  return {
    pages: [
      {
        response,
      },
    ],
  };
};
