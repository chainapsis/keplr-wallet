import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { XAxis } from "../../../../components/axis";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface SettingListProps {
  sections: {
    key: string;
    title: string;
    items: ({ key: string; icon?: React.ComponentType; title: string } & (
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
  sections,
}) => {
  return (
    <React.Fragment>
      {sections.map((section) => {
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
                      <Subtitle3 color={ColorPalette["gray-10"]}>
                        {item.title}
                      </Subtitle3>
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
