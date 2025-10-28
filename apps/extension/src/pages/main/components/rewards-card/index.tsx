import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Box } from "../../../../components/box";
import { Body3, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { Skeleton } from "../../../../components/skeleton";
import { ColorPalette } from "../../../../styles";
import { YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";

export const RewardsCard: FunctionComponent<{
  isNotReady?: boolean;
}> = observer(({ isNotReady }) => {
  const intl = useIntl();
  const [isHover, setIsHover] = React.useState(false);

  return (
    <Box
      backgroundColor={isHover ? "rgba(21, 21, 23, 0.50)" : "transparent"}
      borderColor={ColorPalette["gray-550"]}
      borderWidth="1px"
      borderRadius="1.5rem"
      padding="1rem"
      width="100%"
      onHoverStateChange={(hovered) => {
        setIsHover(hovered);
      }}
      cursor="pointer"
    >
      <Skeleton isNotReady={isNotReady}>
        <Body3 color={ColorPalette["gray-200"]}>
          {intl.formatMessage({
            id: "page.main.components.rewards-card.title",
          })}
        </Body3>
      </Skeleton>
      <Gutter size="0.5rem" />
      <Skeleton isNotReady={isNotReady} verticalBleed="2px">
        <Subtitle2>$100,000</Subtitle2>
      </Skeleton>

      <div style={{ flex: 1 }} />

      <YAxis alignX="right">
        <Skeleton isNotReady={isNotReady}>
          <Subtitle3 color={ColorPalette["blue-300"]}>
            {intl.formatMessage({
              id: "page.main.components.rewards-card.claim-all-button",
            })}
          </Subtitle3>
        </Skeleton>
      </YAxis>
    </Box>
  );
});
