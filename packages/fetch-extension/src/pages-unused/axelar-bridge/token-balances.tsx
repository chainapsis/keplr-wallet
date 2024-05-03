import React, { useEffect } from "react";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import style from "./style.module.scss";
import {
  extractNumberFromBalance,
  formatEthBalance,
  shortenBalance,
} from "@utils/axl-bridge-utils";

interface BalanceProps {
  fromToken: any;
  tokenBal: any;
  setTokenBal: any;
  relayerFee: string;
}

export const TokenBalances: React.FC<BalanceProps> = observer(
  ({ fromToken, tokenBal, setTokenBal, relayerFee }) => {
    const { queriesStore, chainStore, accountStore } = useStore();
    const current = chainStore.current;
    const accountInfo = accountStore.getAccount(current.chainId);
    const query = queriesStore
      .get(current.chainId)
      .queryBalances.getQueryBech32Address(accountInfo.bech32Address);

    useEffect(() => {
      const { balances, nonNativeBalances } = query;
      const queryBalances = balances.concat(nonNativeBalances);
      const queryBalance = queryBalances.find(
        (bal) =>
          fromToken.assetSymbol == bal.currency.coinDenom ||
          fromToken.ibcDenom == bal.currency.coinMinimalDenom
      );
      const balance = queryBalance?.balance
        .trim(true)
        .maxDecimals(6)
        .toString();
      if (balance) {
        balance.includes("-wei")
          ? setTokenBal(formatEthBalance(balance))
          : setTokenBal(balance);
      }
    }, [query, fromToken, setTokenBal]);
    const minDepositAmt = extractNumberFromBalance(
      fromToken.minDepositAmt.toString()
    );
    const relayerFeeAmt = extractNumberFromBalance(relayerFee);
    const minAmount =
      minDepositAmt > relayerFeeAmt ? minDepositAmt : relayerFeeAmt;

    return (
      <div
        style={{ float: "right", fontSize: "small" }}
        className={style["label"]}
      >
        Min Amount :{`${minAmount} ${fromToken.assetSymbol}`}
        <div>Token Bal : {tokenBal ? shortenBalance(tokenBal) : "0.0"}</div>
      </div>
    );
  }
);
