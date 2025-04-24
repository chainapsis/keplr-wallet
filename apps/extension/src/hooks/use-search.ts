import { useEffect, useState, useMemo, useCallback } from "react";
import throttle from "lodash.throttle";

// fields가 동적일 경우 너무 잦은 rerender를 방지하기 위해 함수일 경우 key를 넣어주도록 강제
type SearchField<T> =
  | string
  | {
      key: string;
      function: (item: T) => string;
    };

const getNestedValue = (obj: any, path: SearchField<any>): any => {
  if (typeof path === "object") {
    return path.function(obj);
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
  fields: SearchField<T>[]
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
        if (typeof rawValue !== "string") {
          console.log(`[Warning] field ${field} is not a string: ${rawValue}`);
        }

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
  fields: SearchField<T>[]
) {
  const [searchResults, setSearchResults] = useState<T[]>(data.slice());

  const updateSearchResults = useCallback(
    (
      currentData: T[],
      currentQuery: string,
      currentFields: SearchField<T>[]
    ) => {
      const results = performSearch(currentData, currentQuery, currentFields);
      setSearchResults(results);
    },
    []
  );

  const throttledSearch = useMemo(() => {
    return throttle(updateSearchResults, THROTTLE_DELAY);
  }, [updateSearchResults]);

  const isFetchingCount = data.filter((d) => {
    if (
      d != null &&
      typeof d === "object" &&
      "isFetching" in d &&
      typeof d.isFetching === "boolean"
    ) {
      return d.isFetching;
    } else {
      return false;
    }
  }).length;

  const fieldKeysJoined = fields
    .map((field) => {
      if (typeof field === "string") {
        return field;
      }
      return field.key;
    })
    .join(",");

  useEffect(() => {
    // data 변경은 throttle 적용
    // data 길이가 달라지거나 hugeQueriesStore.getAllBalances의 isFetching 개수가 달라지면 재검색
    throttledSearch(data.slice(), query, fields);

    return () => {
      throttledSearch.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [throttledSearch, isFetchingCount, data.length]);

  useEffect(() => {
    // query나 fieldKeysJoined가 변경되면 즉시 재검색
    updateSearchResults(data.slice(), query, fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSearchResults, query, fieldKeysJoined]);

  return searchResults;
}
