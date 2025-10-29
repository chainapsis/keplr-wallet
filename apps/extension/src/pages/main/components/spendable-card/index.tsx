import React, { Fragment, FunctionComponent, useMemo } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { Box } from "../../../../components/box";
import { Body3, Subtitle2 } from "../../../../components/typography";
import { Skeleton } from "../../../../components/skeleton";
import { ColorPalette } from "../../../../styles";
import { useStore } from "../../../../stores";
import { XAxis, YAxis } from "../../../../components/axis";
import { useTheme } from "styled-components";
import { Gutter } from "../../../../components/gutter";
import { ArrowDownLeftIcon } from "../../../../components/icon/arrow-down-left";
import { ArrowUpRightIcon } from "../../../../components/icon/arrow-up-right";
import { ArrowSwapIcon } from "../../../../components/icon/arrow-swap";

export const SpendableCard: FunctionComponent<{
  spendableTotalPrice: PricePretty | undefined;
  isNotReady?: boolean;
  onClickDeposit: () => void;
}> = observer(({ spendableTotalPrice, isNotReady, onClickDeposit }) => {
  const { hugeQueriesStore, uiConfigStore } = useStore();
  const navigate = useNavigate();
  const intl = useIntl();

  const balances = hugeQueriesStore.getAllBalances({
    allowIBCToken: true,
  });
  const hasBalance = useMemo(() => {
    return balances.find((bal) => bal.token.toDec().gt(new Dec(0))) != null;
  }, [balances]);

  return (
    <Fragment>
      <Box
        backgroundColor="rgba(21, 21, 23, 0.8)"
        borderColor={ColorPalette["gray-600"]}
        borderWidth="1px"
        borderRadius="1.5rem"
        padding="1rem"
      >
        <Box>
          <Skeleton isNotReady={isNotReady} verticalBleed="2px">
            <Body3 color={ColorPalette["gray-200"]}>
              {intl.formatMessage({
                id: "page.main.components.spendable-card.title",
              })}
            </Body3>
          </Skeleton>
        </Box>

        <Gutter size="0.5rem" />

        <Box>
          <Skeleton isNotReady={isNotReady}>
            <Subtitle2 color={ColorPalette["white"]}>
              {spendableTotalPrice
                ? uiConfigStore.hideStringIfPrivacyMode(
                    spendableTotalPrice.toString(),
                    4
                  )
                : "-"}
            </Subtitle2>
          </Skeleton>
        </Box>

        <Gutter size="1.5rem" />

        <XAxis gap="0.375rem" alignY="center">
          <Skeleton type="button" isNotReady={isNotReady}>
            <EllipseButton
              text={intl.formatMessage({
                id: "page.main.components.buttons.deposit-button",
              })}
              icon={
                <ArrowDownLeftIcon
                  width="0.625rem"
                  height="0.625rem"
                  color={ColorPalette["blue-300"]}
                />
              }
              disabled={!hasBalance}
              onClick={onClickDeposit}
            />
          </Skeleton>

          <Skeleton type="button" isNotReady={isNotReady}>
            <EllipseButton
              text={intl.formatMessage({
                id: "page.main.components.buttons.send-button",
              })}
              icon={
                <ArrowUpRightIcon
                  width="0.625rem"
                  height="0.625rem"
                  color={ColorPalette["blue-300"]}
                />
              }
              disabled={!hasBalance}
              onClick={() => {
                navigate(
                  `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
                    "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
                  )}`
                );
              }}
            />
          </Skeleton>

          <Skeleton type="button" isNotReady={isNotReady} verticalBleed="2px">
            <EllipseButton
              text={intl.formatMessage({
                id: "page.main.components.buttons.swap-button",
              })}
              icon={
                <ArrowSwapIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["blue-300"]}
                />
              }
              disabled={!hasBalance}
              onClick={() => {
                navigate(`/ibc-swap`);
              }}
            />
          </Skeleton>
        </XAxis>
      </Box>
    </Fragment>
  );
});

const EllipseButton: FunctionComponent<{
  onClick: () => void;
  icon: React.ReactElement;
  text: string;
  disabled?: boolean;
}> = ({ onClick, icon, text, disabled }) => {
  const theme = useTheme();
  const isLightMode = theme.mode === "light";

  const [_isHover, setIsHover] = React.useState(false);
  const isHover = disabled ? false : _isHover;

  //TODO 화이트 모드 들어왔을때 색상 변경 필요 + hover 상태도 재 점검
  return (
    <Box
      style={{
        opacity: disabled ? 0.5 : isHover ? 0.8 : 1,
      }}
      cursor={!disabled ? "pointer" : "not-allowed"}
      onClick={(e) => {
        e.preventDefault();

        if (disabled) {
          return;
        }

        onClick();
      }}
      onHoverStateChange={(hovered) => {
        setIsHover(hovered);
      }}
    >
      <YAxis alignX="center">
        <Box
          paddingX="1.07rem"
          borderRadius="0.75rem"
          height="1.625rem"
          alignX="center"
          alignY="center"
          backgroundColor={ColorPalette["blue-800"]}
        >
          {icon}
        </Box>
        <Gutter size="0.25rem" />
        <Body3
          color={
            !isHover
              ? isLightMode
                ? ColorPalette["gray-300"]
                : ColorPalette["white"]
              : isLightMode
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-100"]
          }
        >
          {text}
        </Body3>
      </YAxis>
    </Box>
  );
};
