import React, { FunctionComponent, useMemo } from "react";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Buffer } from "buffer/";
import { MsgRender } from "./details-tab";
import styleDetailsTab from "./details-tab.module.scss";
import { Label } from "reactstrap";
import { EthSignType } from "@keplr-wallet/types";
import { renderEvmTxn } from "./evm";
import { useIntl } from "react-intl";
import { UnsignedTransaction } from "@ethersproject/transactions";

export const ADR36SignDocDetailsTab: FunctionComponent<{
  signDocWrapper: SignDocWrapper;
  isADR36WithString?: boolean;
  ethSignType?: EthSignType;
  origin?: string;
}> = observer(({ signDocWrapper, isADR36WithString, ethSignType, origin }) => {
  const { chainStore, accountStore } = useStore();
  const intl = useIntl();

  const renderTitleText = () => {
    if (ethSignType && ethSignType === EthSignType.TRANSACTION) {
      return "Sign transaction for";
    }
    return "Prove account ownership to";
  };

  let evmRenderedMessage: React.ReactElement | undefined;

  const signValue = useMemo(() => {
    if (signDocWrapper.aminoSignDoc.msgs.length !== 1) {
      throw new Error("Sign doc is inproper ADR-36");
    }

    const msg = signDocWrapper.aminoSignDoc.msgs[0];
    if (msg.type !== "sign/MsgSignData") {
      throw new Error("Sign doc is inproper ADR-36");
    }

    if (isADR36WithString) {
      const str = Buffer.from(msg.value.data, "base64").toString();
      try {
        // In case of json, it is displayed more easily to read.
        return JSON.stringify(JSON.parse(str), null, 2);
      } catch {
        return str;
      }
    } else if (ethSignType === EthSignType.TRANSACTION) {
      try {
        const decoder = new TextDecoder();
        const str = decoder.decode(Buffer.from(msg.value.data, "base64"));
        const txnParams: UnsignedTransaction = JSON.parse(str);
        const msgContent = renderEvmTxn(
          txnParams,
          chainStore.current.feeCurrencies[0],
          chainStore.current.currencies,
          intl
        );

        evmRenderedMessage = (
          <React.Fragment>
            <MsgRender icon={msgContent.icon} title={msgContent.title}>
              {msgContent.content}
            </MsgRender>
            <hr />
            {txnParams.data &&
            accountStore.getAccount(chainStore.current.chainId).isNanoLedger ? (
              <div className={styleDetailsTab["ethLedgerBlindSigningWarning"]}>
                <div className={styleDetailsTab["title"]}>
                  Before you click ‘Approve’
                </div>
                <ul className={styleDetailsTab["list"]}>
                  <li>
                    Connect your Ledger device and select the Ethereum app
                  </li>
                  <li>Enable ‘blind signing’ on your Ledger device</li>
                </ul>
              </div>
            ) : null}
          </React.Fragment>
        );

        return JSON.stringify(JSON.parse(str), null, 2);
      } catch {
        return msg.value.data;
      }
    } else {
      return msg.value.data as string;
    }
  }, [signDocWrapper.aminoSignDoc.msgs, isADR36WithString, ethSignType]);

  // TODO: Add warning view to let users turn on blind signing option on ledger if EIP712

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <div className={styleDetailsTab["msgContainer"]} style={{ flex: "none" }}>
        {evmRenderedMessage ? (
          evmRenderedMessage
        ) : (
          <MsgRender icon="fas fa-pen-nib" title={renderTitleText()}>
            {origin ?? "Unknown"}
          </MsgRender>
        )}
      </div>
      {!evmRenderedMessage && (
        <div>
          <Label
            for="sign-value"
            className="form-control-label"
            style={{ marginTop: "8px" }}
          >
            Message
          </Label>
          <div
            id="sign-value"
            style={{
              marginBottom: "8px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <pre
              style={{
                flex: 1,
                padding: "20px",
                border: "1px solid #9092B6",
                borderRadius: "8px",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {signValue}
            </pre>
          </div>
          <Label for="chain-name" className="form-control-label">
            Requested Network
          </Label>
          <div id="chain-name">
            <div>{chainStore.current.chainName}</div>
          </div>
        </div>
      )}
    </div>
  );
});
