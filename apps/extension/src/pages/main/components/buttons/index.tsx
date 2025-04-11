import React, { FunctionComponent, useMemo } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { Skeleton } from "../../../../components/skeleton";
import { useIntl } from "react-intl";

export const Buttons: FunctionComponent<{
  onClickDeposit: () => void;
  onClickBuy: () => void;
  isNotReady?: boolean;
}> = observer(({ onClickDeposit, onClickBuy, isNotReady }) => {
  const { hugeQueriesStore } = useStore();
  const navigate = useNavigate();
  const intl = useIntl();

  const balances = hugeQueriesStore.getAllBalances({
    allowIBCToken: true,
  });
  const hasBalance = useMemo(() => {
    return balances.find((bal) => bal.token.toDec().gt(new Dec(0))) != null;
  }, [balances]);

  return (
    <Box>
      <Columns sum={1} gutter="0.625rem">
        <Column weight={1}>
          <Skeleton type="button" isNotReady={isNotReady}>
            <Button
              text={intl.formatMessage({
                id: "page.main.components.buttons.deposit-button",
              })}
              color="secondary"
              onClick={onClickDeposit}
            />
          </Skeleton>
        </Column>

        <Column weight={1}>
          <Skeleton type="button" isNotReady={isNotReady}>
            <Button
              text={intl.formatMessage({
                id: "page.main.components.buttons.buy-button",
              })}
              color="secondary"
              onClick={onClickBuy}
            />
          </Skeleton>
        </Column>

        <Column weight={1}>
          <Skeleton type="button" isNotReady={isNotReady}>
            <Button
              text={intl.formatMessage({
                id: "page.main.components.buttons.send-button",
              })}
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
        </Column>
      </Columns>
    </Box>
  );
});
