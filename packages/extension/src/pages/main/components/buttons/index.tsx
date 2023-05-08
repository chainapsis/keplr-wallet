import React, { FunctionComponent, useMemo } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Dec } from "@keplr-wallet/unit";

export const Buttons: FunctionComponent<{
  onClickDeposit: () => void;
  onClickBuy: () => void;
}> = observer(({ onClickDeposit, onClickBuy }) => {
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
          <Button text="Deposit" color="secondary" onClick={onClickDeposit} />
        </Column>

        <Column weight={1}>
          <Button text="Buy" color="secondary" onClick={onClickBuy} />
        </Column>

        <Column weight={1}>
          <Button
            text="Send"
            disabled={!hasBalance}
            onClick={() => navigate("/send/select-asset")}
          />
        </Column>
      </Columns>
    </Box>
  );
});
