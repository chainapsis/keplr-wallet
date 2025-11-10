import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Box } from "../../../../components/box";
import {
  Body3,
  Caption1,
  Subtitle2,
  Subtitle3,
} from "../../../../components/typography";
import { Skeleton } from "../../../../components/skeleton";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { useRewards } from "../../../../hooks/use-rewards";
import { useNavigate } from "react-router";
import { LoadingIcon } from "../../../../components/icon";
import { IconProps } from "../../../../components/icon/types";
import styled from "styled-components";

export const RewardsCard: FunctionComponent<{
  isNotReady?: boolean;
}> = observer(({ isNotReady }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const [isHover, setIsHover] = React.useState(false);

  const {
    totalPrice,
    claimAll,
    claimAllDisabled,
    claimAllIsLoading,
    isLedger,
    isKeystone,
    claimAllIsCompleted,
    count,
    claimCountText,
  } = useRewards();

  return (
    <Box
      position="relative"
      backgroundColor={isHover ? "rgba(21, 21, 23, 0.50)" : "transparent"}
      borderColor={ColorPalette["gray-550"]}
      borderWidth="1px"
      borderRadius="1.5rem"
      padding="1rem"
      width="100%"
      onHoverStateChange={(hovered) => {
        if (claimAllDisabled) {
          return;
        }
        setIsHover(hovered);
      }}
      cursor={claimAllDisabled ? "not-allowed" : "pointer"}
      onClick={
        claimAllDisabled
          ? undefined
          : isLedger ||
            isKeystone ||
            claimAllIsLoading ||
            (claimAllIsCompleted && count >= 1)
          ? () => navigate("/stake?intitialExpand=true")
          : claimAll
      }
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
        <Subtitle2>{totalPrice?.toString()}</Subtitle2>
      </Skeleton>

      <div style={{ flex: 1 }} />

      <YAxis alignX="right">
        <Skeleton isNotReady={isNotReady}>
          {isLedger || isKeystone ? (
            <Subtitle3 color={ColorPalette.white}>
              {intl.formatMessage({
                id: "page.main.components.rewards-card.claim-button",
              })}
            </Subtitle3>
          ) : claimAllIsLoading || claimAllIsCompleted ? (
            <YAxis alignX="right">
              <XAxis alignY="center">
                <Body3 color={ColorPalette["gray-200"]}>{claimCountText}</Body3>
                <Gutter size="0.25rem" />
                {claimAllIsLoading ? (
                  <LoadingIcon
                    width="0.75rem"
                    height="0.75rem"
                    color={ColorPalette["gray-200"]}
                  />
                ) : (
                  <CheckIcon
                    color={ColorPalette["green-400"]}
                    width="0.75rem"
                    height="0.75rem"
                  />
                )}
              </XAxis>
              <Gutter size="0.5rem" />
              <XAxis alignY="center">
                <Body3 color={ColorPalette.white}>
                  {intl.formatMessage({
                    id: "page.main.components.rewards-card.review-claim-button",
                  })}
                </Body3>
                <Gutter size="0.125rem" />
                <ArrowRightIcon
                  color={ColorPalette.white}
                  width="1rem"
                  height="1rem"
                />
              </XAxis>
            </YAxis>
          ) : (
            <Subtitle3
              color={
                claimAllDisabled
                  ? ColorPalette["gray-300"]
                  : ColorPalette["blue-300"]
              }
            >
              {claimAllIsLoading
                ? claimCountText
                : intl.formatMessage({
                    id: "page.main.components.rewards-card.claim-all-button",
                  })}
            </Subtitle3>
          )}
        </Skeleton>
      </YAxis>

      {count >= 1 && count <= 5 && <CountdownCircle>{count}</CountdownCircle>}
    </Box>
  );
});

const CountdownCircle = styled(Caption1)`
  width: 1.0625rem;
  height: 1.1875rem;
  border-radius: 0.75rem;
  background-color: ${ColorPalette["gray-600"]};
  color: ${ColorPalette["gray-300"]};
  text-align: center;
  line-height: 1.1875rem;

  position: absolute;
  top: 1rem;
  right: 1rem;
`;

const CheckIcon: FunctionComponent<IconProps> = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
    >
      <g clipPath="url(#clip0_1217_20759)">
        <path
          d="M4.19706 10.4205L0.00112915 6.22455L1.05011 5.17557L4.19706 8.32251L10.951 1.56854L12 2.61752L4.19706 10.4205Z"
          fill={color || "currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_1217_20759">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

const ArrowRightIcon: FunctionComponent<IconProps> = ({
  width,
  height,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.39999 7.99999C2.39999 7.66862 2.66862 7.39999 2.99999 7.39999L11.5103 7.39999L8.18413 4.23249C7.94527 4.00281 7.93782 3.62298 8.16749 3.38412C8.39717 3.14526 8.777 3.13781 9.01586 3.36749L13.4159 7.56749C13.5335 7.68061 13.6 7.83678 13.6 7.99999C13.6 8.1632 13.5335 8.31936 13.4159 8.43249L9.01586 12.6325C8.777 12.8622 8.39717 12.8547 8.16749 12.6159C7.93782 12.377 7.94527 11.9972 8.18413 11.7675L11.5103 8.59999L2.99999 8.59999C2.66862 8.59999 2.39999 8.33136 2.39999 7.99999Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
