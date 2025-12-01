import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useIntl, IntlShape } from "react-intl";
import { Box } from "../../../../components/box";
import {
  Body3,
  Caption1,
  Subtitle2,
  Subtitle3,
} from "../../../../components/typography";
import { Skeleton } from "../../../../components/skeleton";
import { ColorPalette } from "../../../../styles";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";
import { XAxis, YAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { useRewards } from "../../../../hooks/use-rewards";
import { useNavigate } from "react-router";
import { LoadingIcon } from "../../../../components/icon";
import { IconProps } from "../../../../components/icon/types";
import styled, { useTheme } from "styled-components";
import { useStore } from "../../../../stores";

export const RewardsCard: FunctionComponent<{
  isNotReady?: boolean;
}> = observer(({ isNotReady }) => {
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();
  const { mainHeaderAnimationStore } = useStore();

  const [isCardHover, setIsCardHover] = React.useState(false);
  const [isClaimAllHover, setIsClaimAllHover] = React.useState(false);

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

  const navigateToStake = React.useCallback(() => {
    mainHeaderAnimationStore.triggerShowForMainHeaderPrice();
    navigate("/stake?intitialExpand=true");
  }, [mainHeaderAnimationStore, navigate]);

  return (
    <Box
      position="relative"
      style={{ flex: 13 }}
      backgroundColor={
        isCardHover && !isClaimAllHover
          ? theme.mode === "light"
            ? ColorPalette["gray-50"]
            : "rgba(21, 21, 23, 0.50)"
          : "transparent"
      }
      borderColor={
        theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-550"]
      }
      borderWidth="1px"
      minWidth="8rem"
      borderRadius="1.5rem"
      padding="1rem"
      onHoverStateChange={(hovered) => {
        setIsCardHover(hovered);
      }}
      cursor="pointer"
      onClick={navigateToStake}
    >
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "0.75rem",
          opacity: isCardHover && !isClaimAllHover ? COMMON_HOVER_OPACITY : 1,
        }}
      >
        <CarouelArrowRightIcon
          color={ColorPalette["gray-300"]}
          width="1rem"
          height="1rem"
        />
      </div>

      <Box opacity={isCardHover && !isClaimAllHover ? COMMON_HOVER_OPACITY : 1}>
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
      </Box>

      <div style={{ flex: 1 }} />

      <YAxis alignX="right">
        <Skeleton isNotReady={isNotReady}>
          {isLedger || isKeystone ? (
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette.white
              }
            >
              {intl.formatMessage({
                id: "page.main.components.rewards-card.view-button",
              })}
            </Body3>
          ) : claimAllIsLoading || claimAllIsCompleted ? (
            <YAxis alignX="right">
              <XAxis alignY="center">
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-200"]
                  }
                >
                  {claimCountText}
                </Body3>
                <Gutter size="0.25rem" />
                {claimAllIsLoading ? (
                  <LoadingIcon
                    width="0.75rem"
                    height="0.75rem"
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-200"]
                        : ColorPalette["gray-300"]
                    }
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
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette.white
                  }
                >
                  {intl.formatMessage({
                    id: "page.main.components.rewards-card.review-claim-button",
                  })}
                </Body3>
                <Gutter size="0.125rem" />
                <ArrowRightIcon
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette.white
                  }
                  width="1rem"
                  height="1rem"
                />
              </XAxis>
            </YAxis>
          ) : (
            <ClaimAllButton
              intl={intl}
              claimAllDisabled={claimAllDisabled}
              claimAllIsLoading={claimAllIsLoading}
              claimAllIsCompleted={claimAllIsCompleted}
              claimCountText={claimCountText}
              count={count}
              isLedger={!!isLedger}
              isKeystone={!!isKeystone}
              onClaimAll={claimAll}
              onNavigateToStake={navigateToStake}
              isHover={isClaimAllHover}
              setIsHover={setIsClaimAllHover}
            />
          )}
        </Skeleton>
      </YAxis>

      {count >= 1 && count <= 5 && <CountdownCircle>{count}</CountdownCircle>}
    </Box>
  );
});

type ClaimAllButtonProps = {
  intl: IntlShape;
  claimAllDisabled: boolean;
  claimAllIsLoading: boolean;
  claimAllIsCompleted: boolean;
  claimCountText: string;
  count: number;
  isLedger: boolean;
  isKeystone: boolean;
  onClaimAll: () => void;
  onNavigateToStake: () => void;
  isHover: boolean;
  setIsHover: (hovered: boolean) => void;
};

const ClaimAllButton: FunctionComponent<ClaimAllButtonProps> = ({
  intl,
  claimAllDisabled,
  claimAllIsLoading,
  claimAllIsCompleted,
  claimCountText,
  count,
  isLedger,
  isKeystone,
  onClaimAll,
  onNavigateToStake,
  isHover,
  setIsHover,
}) => {
  const theme = useTheme();

  const [isPressed, setIsPressed] = React.useState(false);
  const [labelWidth, setLabelWidth] = React.useState<number>();
  const claimTextRef = React.useRef<HTMLSpanElement | null>(null);
  const approveTextRef = React.useRef<HTMLSpanElement | null>(null);
  const claimLabel = intl.formatMessage({
    id: "page.main.components.rewards-card.claim-all-button",
  });
  const approveLabel = intl.formatMessage({
    id: "button.approve",
  });

  const shouldDimClaimAllButton =
    !claimAllDisabled && !claimAllIsLoading && isPressed;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (claimAllDisabled) {
      return;
    }

    if (
      isLedger ||
      isKeystone ||
      claimAllIsLoading ||
      (claimAllIsCompleted && count >= 1)
    ) {
      onNavigateToStake();
      return;
    }

    onClaimAll();
  };

  const updateLabelWidth = React.useCallback(() => {
    if (claimAllIsLoading) {
      setLabelWidth(undefined);
      return;
    }
    const target = isHover ? approveTextRef.current : claimTextRef.current;
    if (target) {
      setLabelWidth(target.offsetWidth);
    }
  }, [isHover, claimAllIsLoading]);

  React.useLayoutEffect(() => {
    updateLabelWidth();
  }, [updateLabelWidth, claimLabel, approveLabel]);

  useEffect(() => {
    return () => {
      setIsPressed(false);
      setIsHover(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      onHoverStateChange={(hovered) => {
        if (claimAllDisabled || claimAllIsLoading) {
          return;
        }
        if (!hovered) {
          setIsPressed(false);
        }
        setIsHover(hovered);
      }}
      cursor={claimAllDisabled ? "not-allowed" : "pointer"}
      opacity={shouldDimClaimAllButton ? COMMON_HOVER_OPACITY : undefined}
      onMouseDown={() => {
        if (claimAllDisabled || claimAllIsLoading) {
          return;
        }
        setIsPressed(true);
      }}
      onClick={handleClick}
    >
      <XAxis alignY="center">
        <SlidingIconContainer $isActive={!claimAllDisabled && isHover}>
          <Box padding="0.125rem">
            <CheckIcon
              width="0.75rem"
              height="0.75rem"
              color={
                claimAllDisabled
                  ? ColorPalette["gray-300"]
                  : theme.mode === "light"
                  ? ColorPalette["blue-400"]
                  : ColorPalette["blue-300"]
              }
            />
          </Box>
        </SlidingIconContainer>
        <Gutter size="0.25rem" />
        <Subtitle3
          color={
            claimAllDisabled
              ? ColorPalette["gray-300"]
              : theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["blue-300"]
          }
        >
          {claimAllIsLoading ? (
            claimCountText
          ) : (
            <ClaimTextWrapper $width={labelWidth}>
              <ClaimAllText ref={claimTextRef} $visible={!isHover}>
                {claimLabel}
              </ClaimAllText>
              <ApproveText ref={approveTextRef} $visible={isHover}>
                {approveLabel}
              </ApproveText>
            </ClaimTextWrapper>
          )}
        </Subtitle3>
      </XAxis>
    </Box>
  );
};

const SlidingIconContainer = styled.div<{ $isActive: boolean }>`
  width: fit-content;
  height: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
  transform: translateX(${({ $isActive }) => ($isActive ? "0" : "-0.25rem")});
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

const ClaimTextWrapper = styled.span<{ $width?: number }>`
  position: relative;
  display: inline-flex;
  justify-content: flex-end;
  min-height: 1em;
  width: ${({ $width }) => ($width !== undefined ? `${$width}px` : "auto")};
  transition: width 0.2s ease;
`;

const ClaimAllText = styled.span<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  white-space: nowrap;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const ApproveText = styled.span<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  white-space: nowrap;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
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

const CountdownCircle = styled(Caption1)`
  width: 1.0625rem;
  height: 1.1875rem;
  border-radius: 0.75rem;
  background-color: ${({ theme }) =>
    theme.mode === "light"
      ? ColorPalette["gray-50"]
      : ColorPalette["gray-600"]};
  color: ${({ theme }) =>
    theme.mode === "light"
      ? ColorPalette["gray-200"]
      : ColorPalette["gray-300"]};
  text-align: center;
  line-height: 1.1875rem;

  position: absolute;
  top: 1rem;
  right: 1rem;
`;

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

const CarouelArrowRightIcon: FunctionComponent<IconProps> = ({
  width,
  height,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
    >
      <mask
        id="mask0_2415_10267"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="-1"
        width="14"
        height="15"
      >
        <rect y="-0.00012207" width="13.3733" height="13.3733" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_2415_10267)">
        <path
          d="M8.06573 6.68654L3.97016 2.59097C3.83086 2.45166 3.76353 2.28682 3.76817 2.09644C3.77281 1.90605 3.84479 1.74121 3.98409 1.6019C4.1234 1.4626 4.28824 1.39294 4.47863 1.39294C4.66901 1.39294 4.83385 1.4626 4.97316 1.6019L9.24983 5.8925C9.36127 6.00394 9.44485 6.12932 9.50057 6.26862C9.5563 6.40793 9.58416 6.54723 9.58416 6.68654C9.58416 6.82584 9.5563 6.96515 9.50057 7.10445C9.44485 7.24376 9.36127 7.36913 9.24983 7.48058L4.95923 11.7712C4.81992 11.9105 4.6574 11.9778 4.47166 11.9732C4.28592 11.9685 4.1234 11.8966 3.98409 11.7572C3.84479 11.6179 3.77513 11.4531 3.77513 11.2627C3.77513 11.0723 3.84479 10.9075 3.98409 10.7682L8.06573 6.68654Z"
          fill={color || "currentColor"}
        />
      </g>
    </svg>
  );
};
