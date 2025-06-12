import React, { FunctionComponent, useMemo } from "react";
import { Box } from "../../../../components/box";
import { Caption2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { XAxis, YAxis } from "../../../../components/axis";
import { performSearch } from "../../../../hooks/use-search";

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
        "title",
        "items[].title",
      ]);
      if (searchedSections.length > 0) {
        for (let i = 0; i < searchedSections.length; i++) {
          const searchedSection = searchedSections[i];
          // 밑의 쿼리는 위의 searchedSections을 위한 쿼리와 대응되어야한다.
          const searchedItems = performSearch(
            searchedSection.items,
            trimSearch,
            ["title"]
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

  return (
    <React.Fragment>
      {renderSections.map((section) => {
        return (
          <React.Fragment key={section.key}>
            <Box paddingY="0.5rem">
              <Subtitle3 color={ColorPalette["gray-200"]}>
                {section.title}
              </Subtitle3>
              <Gutter size="0.75rem" />
              {section.items.map((item) => {
                return (
                  <Box
                    key={item.key}
                    paddingX="0.5rem"
                    paddingY="0.75rem"
                    minHeight="1.75rem"
                    color={ColorPalette["gray-300"]}
                  >
                    <XAxis alignY="center">
                      {item.icon ? <item.icon /> : null}
                      <Gutter size="0.38rem" />

                      <YAxis>
                        <Subtitle3 color={ColorPalette["gray-10"]}>
                          {item.title}
                        </Subtitle3>
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
                                            ColorPalette["gray-400"],
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
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};
