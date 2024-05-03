import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { CoinInput, TokenSelectorDropdown } from "@components-v2/form";
import { DenomHelper } from "@keplr-wallet/common";
import { Dropdown } from "@components-v2/dropdown";
import { Card } from "@components-v2/card";
import { SetKeyRingPage } from "../keyring-dev";
import { useStore } from "../../stores";
import { ButtonV2 } from "@components-v2/buttons/button";
import { Label } from "reactstrap";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";

interface SendPhase1Props {
  sendConfigs: any;
  setIsNext: any;
  setFromPhase1: any;
}

export const SendPhase1: React.FC<SendPhase1Props> = observer(
  ({ setIsNext, sendConfigs, setFromPhase1 }) => {
    const [isChangeWalletOpen, setIsChangeWalletOpen] = useState(false);
    const { chainStore, accountStore } = useStore();
    const accountInfo = accountStore.getAccount(chainStore.current.chainId);
    const navigate = useNavigate();
    const intl = useIntl();
    useEffect(() => {
      setIsNext(false);
      setFromPhase1(true);
    }, []);

    return (
      <div>
        <CoinInput
          amountConfig={sendConfigs.amountConfig}
          label={intl.formatMessage({ id: "send.input.amount" })}
          balanceText={intl.formatMessage({
            id: "send.input-button.balance",
          })}
          disableAllBalance={(() => {
            if (
              // In the case of terra classic, tax is applied in proportion to the amount.
              // However, in this case, the tax itself changes the fee,
              // so if you use the max function, it will fall into infinite repetition.
              // We currently disable if chain is terra classic because we can't handle it properly.
              sendConfigs.feeConfig.chainInfo.features &&
              sendConfigs.feeConfig.chainInfo.features.includes(
                "terra-classic-fee"
              )
            ) {
              return true;
            }
            return false;
          })()}
          overrideSelectableCurrencies={(() => {
            if (
              chainStore.current.features &&
              chainStore.current.features.includes("terra-classic-fee")
            ) {
              // At present, can't handle stability tax well if it is not registered native token.
              // So, for terra classic, disable other tokens.
              const currencies = sendConfigs.amountConfig.sendableCurrencies;
              return currencies.filter((cur: any) => {
                const denom = new DenomHelper(cur.coinMinimalDenom);
                if (denom.type !== "native" || denom.denom.startsWith("ibc/")) {
                  return false;
                }
                return true;
              });
            }
            return undefined;
          })()}
        />
        <TokenSelectorDropdown amountConfig={sendConfigs.amountConfig} />
        <Label style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
          Wallet
        </Label>
        <Card
          style={{
            background: "rgba(255, 255, 255, 0.10)",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
          }}
          subheadingStyle={{
            fontSize: "14px",
            color: "white",
            fontWeight: "bold",
            opacity: "1",
          }}
          heading={""}
          subheading={accountInfo.name}
          rightContent={require("@assets/svg/wireframe/chevron-down.svg")}
          onClick={() => setIsChangeWalletOpen(!isChangeWalletOpen)}
        />
        <ButtonV2
          disabled={
            sendConfigs.amountConfig.amount === "" ||
            sendConfigs.amountConfig.error
          }
          text="Next"
          onClick={() => {
            setIsNext(true);
            navigate("/send", { state: { isFromPhase1: true } });
          }}
        />
        <Dropdown
          isOpen={isChangeWalletOpen}
          setIsOpen={setIsChangeWalletOpen}
          title="Select Wallet"
          closeClicked={() => setIsChangeWalletOpen(false)}
        >
          <SetKeyRingPage navigateTo={"/send"} />
        </Dropdown>
      </div>
    );
  }
);
