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

const DEBOUNCE_DELAY = 500;

export function useSearch<T>(
  data: T[],
  query: string,
  fields: (string | ((item: T) => string))[]
) {
  const [searchResults, setSearchResults] = useState<T[]>(data);

  const performSearch = useCallback(
    (
      currentData: T[],
      currentQuery: string,
      currentFields: (string | ((item: T) => string))[]
    ) => {
      const queryLower = currentQuery.toLowerCase().trim();
      if (!queryLower) {
        setSearchResults(currentData);
        return;
      }

      const matchedItems = currentData
        .map((item) => {
          const fieldMatchScores = currentFields.map((field, index) => {
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

          const hasAnyMatch = fieldMatchScores.some((score) => score > 0);

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

          for (let i = 0; i < currentFields.length; i++) {
            const scoreA = a.fieldMatchScores[i] || SCORE_NONE;
            const scoreB = b.fieldMatchScores[i] || SCORE_NONE;

            if (scoreA !== scoreB) {
              return scoreB - scoreA;
            }
          }
          return 0;
        })
        .map(({ item }) => item);

      setSearchResults(sortedItems);
    },
    []
  );

  const throttledSearch = useMemo(() => {
    return throttle(performSearch, DEBOUNCE_DELAY);
  }, [performSearch]);

  const isFetchingCount = data.filter((d) => (d as any).isFetching).length;

  useEffect(() => {
    throttledSearch(data, query, fields);

    return () => {
      throttledSearch.cancel();
    };
  }, [throttledSearch, isFetchingCount]);

  useEffect(() => {
    performSearch(data, query, fields);
  }, [query, fields, performSearch]);

  return searchResults;
}
