import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { Coin } from "@keplr-wallet/types";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { MsgExecuteContract } from "@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx";
import { MsgExecuteContract as MsgExecuteSecretContract } from "@keplr-wallet/proto-types/secret/compute/v1beta1/msg";
import { Buffer } from "buffer/";
import { WasmMessageView } from "./wasm-message-view";
import { Gutter } from "../../../../../components/gutter";
import { FormattedMessage } from "react-intl";
import { MessageExecuteContractIcon } from "../../../../../components/icon";
import { ItemLogo } from "../../../../main/token-detail/msg-items/logo";

export const ExecuteContractMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "wasm/MsgExecuteContract") {
        return {
          funds: msg.value.funds ?? msg.value.sent_funds ?? [],
          contract: msg.value.contract,
          sender: msg.value.sender,
          msg: msg.value.msg,
          callbackCodeHash: msg.value.callback_code_hash,
        };
      }

      if (
        "unpacked" in msg &&
        (msg.typeUrl === "/cosmwasm.wasm.v1.MsgExecuteContract" ||
          msg.typeUrl === "/secret.compute.v1beta1.MsgExecuteContract")
      ) {
        return {
          funds: (msg.unpacked as MsgExecuteContract).funds,
          contract: (msg.unpacked as MsgExecuteContract).contract,
          sender: (msg.unpacked as MsgExecuteContract).sender,
          msg: JSON.parse(
            Buffer.from((msg.unpacked as MsgExecuteContract).msg).toString()
          ),
          callbackCodeHash: (msg.unpacked as MsgExecuteSecretContract)
            .callbackCodeHash,
        };
      }
    })();

    if (d) {
      return {
        icon: (
          <ItemLogo
            width="2.5rem"
            height="2.5rem"
            center={
              <MessageExecuteContractIcon width="2.5rem" height="2.5rem" />
            }
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.execute-wasm-contract.title" />
        ),
        content: (
          <ExecuteContractMessagePretty
            chainId={chainId}
            funds={d.funds}
            contract={d.contract}
            sender={d.sender}
            msg={d.msg}
            callbackCodeHash={d.callbackCodeHash}
          />
        ),
      };
    }
  },
};

const ExecuteContractMessagePretty: FunctionComponent<{
  chainId: string;
  funds: Coin[];
  contract: string;
  sender: string;
  msg: object | string;
  callbackCodeHash: string | undefined;
}> = observer(({ chainId, funds, contract, msg }) => {
  const { chainStore } = useStore();

  const coins = funds.map((coin) => {
    const currency = chainStore.getChain(chainId).forceFindCurrency(coin.denom);

    return new CoinPretty(currency, coin.amount);
  });

  const isSecretWasm = chainStore.getChain(chainId).hasFeature("secretwasm");

  return (
    <React.Fragment>
      <FormattedMessage
        id="page.sign.components.messages.execute-wasm-contract.paragraph"
        values={{
          address: Bech32Address.shortenAddress(contract, 26),
          b: (...chunks: any) => <b>{chunks}</b>,
          ["only-sent-exist"]: (...chunks: any[]) =>
            coins.length > 0 ? chunks : "",
          sent: coins
            .map((coinPretty) => {
              return coinPretty.trim(true).toString();
            })
            .join(","),
        }}
      />
      <Gutter size="0.375rem" />
      <WasmMessageView
        chainId={chainId}
        msg={msg}
        isSecretWasm={isSecretWasm}
      />
    </React.Fragment>
  );
});
