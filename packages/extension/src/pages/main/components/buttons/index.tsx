import React, { FunctionComponent, useMemo } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { Skeleton } from "../../../../components/skeleton";

export const Buttons: FunctionComponent<{
  onClickDeposit: () => void;
  onClickBuy: () => void;
  isNotReady?: boolean;
}> = observer(({ onClickDeposit, onClickBuy, isNotReady }) => {
  const { hugeQueriesStore } = useStore();
  const navigate = useNavigate();

  const balances = hugeQueriesStore.getAllBalances(true);
  const hasBalance = useMemo(() => {
    return balances.find((bal) => bal.token.toDec().gt(new Dec(0))) != null;
  }, [balances]);

  return (
    <Box>
      <Columns sum={1} gutter="0.625rem">
        <Column weight={1}>
          <Skeleton type="button" isNotReady={isNotReady}>
            <Button text="Deposit" color="secondary" onClick={onClickDeposit} />
          </Skeleton>
        </Column>

        <Column weight={1}>
          <Skeleton type="button" isNotReady={isNotReady}>
            <Button text="Buy" color="secondary" onClick={onClickBuy} />
          </Skeleton>
        </Column>

        <Column weight={1}>
          <Skeleton type="button" isNotReady={isNotReady}>
            <Button
              text="Send"
              disabled={!hasBalance}
              onClick={() => navigate("/send/select-asset")}
            />
          </Skeleton>
        </Column>
      </Columns>
    </Box>
  );
});
