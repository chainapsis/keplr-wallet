import { useEffect, useState, useMemo, useCallback } from "react";
import throttle from "lodash.throttle";

// fields가 동적일 경우 너무 잦은 rerender를 방지하기 위해 함수일 경우 key를 넣어주도록 강제
type SearchField<T> =
  | string
  | {
      field: string;
      minLength: number;
    }
  | {
      key: string;
      function: (item: T) => string | string[];
    };

/*
  const data = {
    title: "test",
    items: [
      { title: "item1" },
      { title: "item2" },
      { title: "item3", subtitles: ["sub1", "sub2"] }
    ]
  };

  console.log(getNestedValue(data, "title")); // "test"
  console.log(getNestedValue(data, "items[].title")); // ["item1", "item2", "item3"]
  console.log(getNestedValue(data, "items[].subtitles[]")); // ["sub1", "sub2"]
 */
const getNestedValue = (obj: any, path: SearchField<any>): any => {
  if (typeof path === "object" && "key" in path) {
    return path.function(obj);
  }
  if (typeof path === "object" && "field" in path) {
    path = path.field;
  }

  const segments = path.split(".");

  const extract = (current: any, pathSegments: string[]): any => {
    if (current == null) return undefined;
    if (pathSegments.length === 0) return current;

    const [head, ...tail] = pathSegments;

    if (head.endsWith("[]")) {
      const key = head.slice(0, -2);
      const arr = current?.[key];

      if (!Array.isArray(arr)) return undefined;

      const results = arr.map((item) => extract(item, tail));

      // flatten if next segment is also an array (e.g. "items[].subtitles[]")
      return results.flat();
    } else {
      return extract(current?.[head], tail);
    }
  };

  return extract(obj, segments);
};

const SCORE_EXACT = 5;
const SCORE_PREFIX = 2;
const SCORE_SUBSTRING = 1;
const SCORE_NONE = -Infinity;

const getScore = (
  fieldValue: string,
  queryLower: string,
  index: number
): number => {
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
};

const THROTTLE_DELAY = 500;

export function performSearch<T>(
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
        if (
          typeof field === "object" &&
          "minLength" in field &&
          queryLower.length < field.minLength
        ) {
          return SCORE_NONE;
        }

        const rawValue = getNestedValue(item, field);
        if (Array.isArray(rawValue)) {
          let highestScore = SCORE_NONE;
          for (let i = 0; i < rawValue.length; i++) {
            const fieldValue = String(rawValue[i]).toLowerCase();
            if (typeof rawValue[i] !== "string") {
              console.log(
                `[Warning] field ${field} is not a string: ${rawValue[i]}`
              );
            }

            const score = getScore(fieldValue, queryLower, index);
            if (score > highestScore) {
              highestScore = score;
            }
          }

          return highestScore;
        } else {
          const fieldValue =
            rawValue != null ? String(rawValue).toLowerCase() : "";
          if (typeof rawValue !== "string") {
            console.log(
              `[Warning] field ${field} is not a string: ${rawValue}`
            );
          }

          return getScore(fieldValue, queryLower, index);
        }
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
      if ("field" in field) {
        return `${field.field}/${field.minLength}`;
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
