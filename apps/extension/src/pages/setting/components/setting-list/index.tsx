import React, { FunctionComponent, useMemo } from "react";
import { Box } from "../../../../components/box";
import { Caption2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { XAxis, YAxis } from "../../../../components/axis";
import { performSearch } from "../../../../hooks/use-search";
import { useTheme } from "styled-components";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface SettingListProps {
  search?: string;
  sections: {
    key: string;
    title: string;
    items: ({
      key: string;
      icon?: React.ComponentType;
      title: string;
      subtitles?: string[];
      onClick?: () => void;
    } & (
      | {
          right?: undefined;
          rightProps?: undefined;
        }
      | {
          right: React.ComponentType<any>;
          rightProps: Record<string, any>;
        }
    ))[];
  }[];
}

export const SettingList: FunctionComponent<SettingListProps> = ({
  search,
  sections,
}) => {
  const theme = useTheme();

  const trimSearch = useMemo(() => {
    return search?.trim();
  }, [search]);
  const searchedKeys = useMemo<{
    sectionKeys: Map<string, number>;
    itemKeys: Map<string, number>;
  }>(() => {
    if (!trimSearch) {
      return {
        sectionKeys: new Map(),
        itemKeys: new Map(),
      };
    } else {
      const sectionKeys = new Map<string, number>();
      const itemKeys = new Map<string, number>();
      const searchedSections = performSearch(sections, trimSearch, [
        "items[].title",
        "items[].subtitles[]",
      ]);
      if (searchedSections.length > 0) {
        for (let i = 0; i < searchedSections.length; i++) {
          const searchedSection = searchedSections[i];
          // 밑의 쿼리는 위의 searchedSections을 위한 쿼리와 대응되어야한다.
          const searchedItems = performSearch(
            searchedSection.items,
            trimSearch,
            ["title", "subtitles[]"]
          );
          if (searchedItems.length > 0) {
            sectionKeys.set(searchedSection.key, i);
            for (let j = 0; j < searchedItems.length; j++) {
              const searchedItem = searchedItems[j];
              itemKeys.set(`${searchedSection.key}/${searchedItem.key}`, j);
            }
          }
        }
      }

      return {
        sectionKeys,
        itemKeys,
      };
    }
    // sections prop의 변화에 대해서는 반응하지 않는다.
    // sections가 array인데 deep equal을 하기엔 빡세다...
    // 근데 어차피 setting page에서 list에서 보여줄 용도인데
    // setting page에서 보이는 값에 대해서 sections가 자주 변할리가 없기 때문에 괜찮다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimSearch]);

  const renderSections = (() => {
    if (!trimSearch) {
      return sections;
    }

    return sections
      .filter((section) => searchedKeys.sectionKeys.get(section.key) != null)
      .sort((a, b) => {
        const aPriority = searchedKeys.sectionKeys.get(a.key);
        const bPriority = searchedKeys.sectionKeys.get(b.key);

        if (aPriority == null && bPriority == null) {
          return 0;
        }

        if (aPriority == null) {
          return 1;
        }

        if (bPriority == null) {
          return -1;
        }

        return aPriority - bPriority;
      })
      .map((section) => {
        return {
          ...section,
          items: section.items
            .filter(
              (item) =>
                searchedKeys.itemKeys.get(`${section.key}/${item.key}`) != null
            )
            .sort((a, b) => {
              const aPriority = searchedKeys.itemKeys.get(
                `${section.key}/${a.key}`
              );
              const bPriority = searchedKeys.itemKeys.get(
                `${section.key}/${b.key}`
              );

              if (aPriority == null && bPriority == null) {
                return 0;
              }

              if (aPriority == null) {
                return 1;
              }

              if (bPriority == null) {
                return -1;
              }

              return aPriority - bPriority;
            }),
        };
      });
  })();

  const isSearching = !!trimSearch;

  return (
    <React.Fragment>
      {renderSections.map((section, i) => {
        return (
          <React.Fragment key={section.key}>
            <Box paddingX="1rem" paddingY={isSearching ? "0" : "0.5rem"}>
              {/* search 중에는 section title을 보여주지 않는다. */}
              {isSearching ? null : (
                <React.Fragment>
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                    }
                  >
                    {section.title}
                  </Subtitle3>
                  <Gutter size="0.75rem" />
                </React.Fragment>
              )}
              {section.items.map((item) => {
                return (
                  <Box
                    key={item.key}
                    paddingX="0.5rem"
                    paddingY="0.75rem"
                    minHeight="3.25rem"
                    borderRadius="0.75rem"
                    alignY="center"
                    {...(() => {
                      if (item.onClick) {
                        return {
                          cursor: "pointer",
                          onClick: (e) => {
                            e.preventDefault();

                            item.onClick?.();
                          },
                          hover: {
                            backgroundColor:
                              theme.mode === "light"
                                ? ColorPalette["gray-10"]
                                : ColorPalette["gray-600"],
                          },
                        };
                      }

                      return {};
                    })()}
                    // icon color
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
                  >
                    <XAxis alignY="center">
                      {item.icon ? <item.icon /> : null}
                      <Gutter size="0.38rem" />

                      <YAxis>
                        <HighlightedSubtitle3
                          value={item.title}
                          searchText={trimSearch || ""}
                        />
                        {item.subtitles && item.subtitles.length > 0 ? (
                          <React.Fragment>
                            <Gutter size="0.38rem" />
                            <XAxis wrap="wrap" alignY="center">
                              {item.subtitles.map((subtitle, i) => {
                                return (
                                  <React.Fragment key={i.toString()}>
                                    <Caption2 color={ColorPalette["gray-300"]}>
                                      {subtitle}
                                    </Caption2>
                                    {i !== item.subtitles!.length - 1 ? (
                                      <div
                                        style={{
                                          width: "2px",
                                          height: "2px",
                                          borderRadius: "9999px",
                                          backgroundColor:
                                            theme.mode === "light"
                                              ? ColorPalette["gray-200"]
                                              : ColorPalette["gray-400"],
                                          marginLeft: "4px",
                                          marginRight: "4px",
                                        }}
                                      />
                                    ) : null}
                                  </React.Fragment>
                                );
                              })}
                            </XAxis>
                          </React.Fragment>
                        ) : null}
                      </YAxis>

                      <div style={{ flex: 1 }} />
                      {item.right ? <item.right {...item.rightProps} /> : null}
                    </XAxis>
                  </Box>
                );
              })}
            </Box>
            {i !== renderSections.length - 1 && !isSearching ? (
              <Box marginY="1rem">
                <div
                  style={{
                    height: "1px",
                    backgroundColor:
                      theme.mode === "light"
                        ? ColorPalette["gray-50"]
                        : ColorPalette["gray-550"],
                  }}
                />
              </Box>
            ) : null}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export const HighlightedSubtitle3: FunctionComponent<{
  value: string;
  searchText: string;
}> = ({ value, searchText }) => {
  const theme = useTheme();

  if (!searchText)
    return (
      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-700"]
            : ColorPalette["gray-10"]
        }
      >
        {value}
      </Subtitle3>
    );

  const regex = new RegExp(`(${searchText})`, "ig"); // 대소문자 무시
  const parts = value.split(regex);

  let firstOne = false;
  return (
    <span>
      {parts.map((part, index) => {
        const matched = part.toLowerCase() === searchText.toLowerCase();

        const res =
          matched && !firstOne ? (
            <Subtitle3
              key={index}
              as="span"
              style={{
                whiteSpace: "pre-wrap",
              }}
              color={ColorPalette["blue-300"]}
            >
              {part}
            </Subtitle3> // 파란색 강조
          ) : (
            <Subtitle3
              key={index}
              as="span"
              style={{
                whiteSpace: "pre-wrap",
              }}
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-10"]
              }
            >
              {part}
            </Subtitle3>
          );

        if (matched) {
          firstOne = true;
        }

        return res;
      })}
    </span>
  );
};
