import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Card } from "@components-v2/card";
import { Dropdown } from "@components-v2/dropdown";
import { useStore } from "../../stores";
import { formatEthBalance } from "@utils/axl-bridge-utils";

interface TokenSelectProps {
  recieverChain: any;
  depositAddress: string | undefined;
  setTransferToken: any;
  transferToken: any;
  tokens: any[];
  setTokenBal: any;
  tokenBal: any;
}

export const TokenSelect = observer(
  ({
    recieverChain,
    depositAddress,
    setTransferToken,
    transferToken,
    tokens,
    tokenBal,
    setTokenBal,
  }: TokenSelectProps) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
          (transferToken &&
            transferToken.assetSymbol == bal.currency.coinDenom) ||
          (transferToken &&
            transferToken.ibcDenom == bal.currency.coinMinimalDenom)
      );
      const balance = queryBalance?.balance
        .trim(true)
        .maxDecimals(6)
        .toString();

      if (balance !== undefined && !isNaN(parseFloat(balance))) {
        if (balance.includes("-wei")) {
          setTokenBal(formatEthBalance(balance));
        } else {
          setTokenBal(balance);
        }
      } else {
        // Handle the case when the balance is zero
        setTokenBal(`0 ${transferToken ? transferToken.assetSymbol : ""}`);
      }
    }, [query, transferToken, setTokenBal]);

    const handleTokenSelect = (token: any) => {
      setTransferToken(token);
      setDropdownOpen(false);
    };

    return (
      <div>
        <Card
          onClick={() => {
            if (recieverChain || depositAddress) setDropdownOpen(!dropdownOpen);
          }}
          heading={"Asset"}
          style={{
            height: "72px",
            background: "rgba(255,255,255,0.1)",
            marginBottom: "16px",
          }}
          rightContent={require("@assets/svg/wireframe/chevron-down.svg")}
          subheading={
            <div>
              {transferToken ? transferToken.assetSymbol : ""}
              <div>
                {recieverChain && tokenBal && `available: ${tokenBal}`}
                {!recieverChain && "Select Transfer chain first"}
              </div>
            </div>
          }
        />
        <Dropdown
          title="Select Token"
          isOpen={dropdownOpen}
          setIsOpen={setDropdownOpen}
          closeClicked={() => setDropdownOpen(false)}
        >
          {tokens &&
            tokens
              .filter((token) =>
                recieverChain?.assets.find(
                  (asset: any) => asset.common_key === token.common_key
                )
              )
              .map((token) => (
                <Card
                  heading={token.assetSymbol}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  key={token.common_key}
                  onClick={() => handleTokenSelect(token)}
                />
              ))}
        </Dropdown>
      </div>
    );
  }
);
