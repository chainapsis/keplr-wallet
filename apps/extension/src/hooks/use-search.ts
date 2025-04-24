import { useEffect, useState, useMemo, useCallback } from "react";
import throttle from "lodash.throttle";

const getNestedValue = (
  obj: any,
  path: string | ((item: any) => string)
): any => {
  if (typeof path === "function") {
    return path(obj);
  }
  return path.split(".").reduce((currentObject, key) => {
    return currentObject?.[key];
  }, obj);
};

const SCORE_EXACT = 5;
const SCORE_PREFIX = 2;
const SCORE_SUBSTRING = 1;
const SCORE_NONE = -Infinity;

const THROTTLE_DELAY = 500;

function performSearch<T>(
  data: T[],
  query: string,
  fields: (string | ((item: T) => string))[]
): T[] {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) {
    return data;
  }

  const matchedItems = data
    .map((item) => {
      const fieldMatchScores = fields.map((field, index) => {
        const rawValue = getNestedValue(item, field);
        const fieldValue =
          rawValue != null ? String(rawValue).toLowerCase() : "";

        if (!fieldValue) {
          return SCORE_NONE;
        }

        if (fieldValue === queryLower) {
          return SCORE_EXACT - index;
        }
        if (fieldValue.startsWith(queryLower)) {
          return SCORE_PREFIX - index;
        }
        if (fieldValue.includes(queryLower)) {
          return SCORE_SUBSTRING - index;
        }
        return SCORE_NONE;
      });

      const hasAnyMatch = fieldMatchScores.some((score) => score > SCORE_NONE);

      return {
        item,
        fieldMatchScores,
        hasAnyMatch,
      };
    })
    .filter(({ hasAnyMatch }) => hasAnyMatch);

  const sortedItems = matchedItems
    .sort((a, b) => {
      const maxScoreA = Math.max(...a.fieldMatchScores);
      const maxScoreB = Math.max(...b.fieldMatchScores);

      if (maxScoreA !== maxScoreB) {
        return maxScoreB - maxScoreA;
      }

      for (let i = 0; i < fields.length; i++) {
        const scoreA = a.fieldMatchScores[i] || SCORE_NONE;
        const scoreB = b.fieldMatchScores[i] || SCORE_NONE;

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
      }
      return 0;
    })
    .map(({ item }) => item);

  return sortedItems;
}

export function useSearch<T>(
  data: T[],
  query: string,
  fields: (string | ((item: T) => string))[]
) {
  const [searchResults, setSearchResults] = useState<T[]>(data);

  const updateSearchResults = useCallback(
    (
      currentData: T[],
      currentQuery: string,
      currentFields: (string | ((item: T) => string))[]
    ) => {
      const results = performSearch(currentData, currentQuery, currentFields);
      setSearchResults(results);
    },
    []
  );

  const throttledSearch = useMemo(() => {
    return throttle(updateSearchResults, THROTTLE_DELAY);
  }, [updateSearchResults]);

  const isFetchingCount = data.filter((d) => (d as any).isFetching).length;

  useEffect(() => {
    // data 변경은 throttle 적용
    // data 길이가 달라지거나 hugeQueriesStore.getAllBalances의 isFetching 개수가 달라지면 재검색
    throttledSearch(data, query, fields);

    return () => {
      throttledSearch.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [throttledSearch, isFetchingCount, data.length]);

  useEffect(() => {
    // query나 fields가 변경되면 즉시 재검색
    updateSearchResults(data, query, fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSearchResults, query, fields]);

  return searchResults;
}
