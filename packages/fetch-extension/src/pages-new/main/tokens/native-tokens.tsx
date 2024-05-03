import { Card } from "@components-v2/card";
import React, { useEffect, useState } from "react";
import { useStore } from "../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";
import { useLanguage } from "../../../languages";
import { useNavigate } from "react-router";
import { separateNumericAndDenom } from "@utils/format";
import { getTokenIcon } from "@utils/get-token-icon";
import { observer } from "mobx-react-lite";
export const NativeTokens = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const [nativeToken, setNativeToken] = useState<any>("");
  const [tokenIcon, setTokenIcon] = useState<string>("");

  useEffect(() => {
    if (nativeToken) {
      const fetchTokenImage = async () => {
        const tokenImage = await getTokenIcon(
          nativeToken.currency?.coinGeckoId
        );
        setTokenIcon(tokenImage);
      };
      fetchTokenImage();
    }
  }, [nativeToken.currency?.coinGeckoId]);

  const navigate = useNavigate();

  const current = chainStore.current;
  const queries = queriesStore.get(current.chainId);

  useEffect(() => {
    setNativeToken(balanceQuery.balances[0]);
  }, []);
  const isEvm = chainStore.current.features?.includes("evm") ?? false;
  const accountInfo = accountStore.getAccount(current.chainId);

  const balanceQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  );
  const balanceStakableQuery = balanceQuery.stakable;
  const isNoble =
    ChainIdHelper.parse(chainStore.current.chainId).identifier === "noble";
  const hasUSDC = chainStore.current.currencies.find(
    (currency: AppCurrency) => currency.coinMinimalDenom === "uusdc"
  );
  const stakable = (() => {
    if (isNoble && hasUSDC) {
      return balanceQuery.getBalanceFromCurrency(hasUSDC);
    }

    return balanceStakableQuery.balance;
  })();
  const delegated = queries.cosmos.queryDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);

  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakableReward = rewards.stakableReward;
  const stakedSum = delegated.add(unbonding);
  const total = stakable.add(stakedSum).add(stakableReward);
  const language = useLanguage();
  const fiatCurrency = language.fiatCurrency;

  const { numericPart: _totalNumber, denomPart: totalDenom } =
    separateNumericAndDenom(
      total.shrink(true).trim(true).maxDecimals(6).toString()
    );
  const totalPrice = priceStore.calculatePrice(total, fiatCurrency);

  const NativeTokenDetailsString = encodeURIComponent(
    JSON.stringify(nativeToken.balance?.currency)
  );
  const NativeTokenBalance = {
    balance: total.shrink(true).trim(true).maxDecimals(6).toString(),
    balanceInUsd: totalPrice && totalPrice.toString(),
  };
  const NativeTokenBalanceString = encodeURIComponent(
    JSON.stringify(NativeTokenBalance)
  );
  return (
    <React.Fragment>
      {isEvm ? (
        <Card
          subheadingStyle={{
            fontSize: "14px",
            color: "rgb(128, 141, 160)",
          }}
          style={{
            background: "rgba(255,255,255,0.1)",
            marginBottom: "8px",
          }}
          leftImage={tokenIcon ? tokenIcon : totalDenom.toUpperCase()[0]}
          heading={totalDenom}
          subheading={total.shrink(true).trim(true).maxDecimals(6).toString()}
          rightContent={totalPrice && <div>{totalPrice.toString()}</div>}
          onClick={() => {
            navigate({
              pathname: "/asset",
              search: `?tokenDetails=${NativeTokenDetailsString}&balance=${NativeTokenBalanceString}`,
            });
          }}
        />
      ) : (
        <Card
          subheadingStyle={{ fontSize: "14px", color: "rgb(128, 141, 160)" }}
          style={{ background: "rgba(255,255,255,0.1)", marginBottom: "8px" }}
          leftImage={tokenIcon ? tokenIcon : totalDenom.toUpperCase()[0]}
          heading={totalDenom}
          subheading={total.shrink(true).trim(true).maxDecimals(6).toString()}
          onClick={() => {
            navigate({
              pathname: "/asset",
              search: `?tokenDetails=${NativeTokenDetailsString}&balance=${NativeTokenBalanceString}`,
            });
          }}
          rightContent={totalPrice && <div>{totalPrice.toString()}</div>}
        />
      )}
    </React.Fragment>
  );
});
