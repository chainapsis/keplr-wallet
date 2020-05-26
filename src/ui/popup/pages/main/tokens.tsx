import React, { FunctionComponent } from "react";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

import { CoinUtils } from "../../../../common/coin-utils";
import {
  getCurrency,
  getCurrencyFromMinimalDenom
} from "../../../../common/currency";
import { Coin } from "@everett-protocol/cosmosjs/common/coin";

import styleTokens from "./tokens.module.scss";
import { DecUtils } from "../../../../common/dec-utils";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import { EmbedIBCPathInfo } from "../../../../config";

export const TokenItem: FunctionComponent<{ token: Coin; chainId: string }> = ({
  token,
  chainId
}) => {
  const i = token.denom.lastIndexOf("/");
  let path = "";
  let actualDenom = token.denom;
  if (i >= 0) {
    path = token.denom.slice(0, i);
    actualDenom = token.denom.slice(i + 1);
  }

  let amount = new Dec(token.amount);
  let readableDenom = actualDenom;

  const currency = getCurrencyFromMinimalDenom(actualDenom);
  if (currency) {
    amount = amount.quoTruncate(
      DecUtils.getPrecisionDec(currency.coinDecimals)
    );

    readableDenom = currency.coinDenom;
  }

  let sourceChainId = "";

  if (EmbedIBCPathInfo[chainId]) {
    for (const destChainId in EmbedIBCPathInfo[chainId]) {
      const ibcPath = EmbedIBCPathInfo[chainId][destChainId];
      const prefix = `${ibcPath.src.portId}/${ibcPath.src.channelId}`;

      if (path === prefix || path.startsWith(prefix + "/")) {
        sourceChainId = destChainId;
      }
    }
  }

  return (
    <div className={styleTokens.tokenItem}>
      <div style={{ position: "relative", paddingLeft: "24px" }}>
        <div style={{ position: "absolute", fontSize: "20px", left: 0 }}>
          💰
        </div>
      </div>
      <div className={styleTokens.path} id={token.denom + "/path"}>{`from ${
        sourceChainId ? sourceChainId : "unknown"
      }`}</div>
      <div style={{ flex: 1 }} />
      <div
        className={styleTokens.amount}
      >{`${DecUtils.decToStrWithoutTrailingZeros(
        amount
      )} ${readableDenom}`}</div>
    </div>
  );
};

export const TokensView: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

  const tokens = CoinUtils.exclude(accountStore.assets, [
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getCurrency(chainStore.chainInfo.nativeCurrency)!.coinMinimalDenom
  ]);

  return (
    <div>
      <h2>IBC Tokens</h2>
      {tokens.map((asset, i) => {
        return (
          <React.Fragment key={asset.denom}>
            <TokenItem token={asset} chainId={chainStore.chainInfo.chainId} />
            {i !== tokens.length - 1 ? <hr className="my-2" /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
});
