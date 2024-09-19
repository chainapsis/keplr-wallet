import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  AccountNotDeployed,
  ISenderConfig,
} from "@keplr-wallet/hooks-starknet";
import { GetStarknetKeyParamsMsg } from "@keplr-wallet/background";
import { useStore } from "../../../../stores";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { Buffer } from "buffer/";
import { Gutter } from "../../../../components/gutter";

export const AddressGenWarning: FunctionComponent<{
  upperGutter?: string;
  senderConfig: ISenderConfig;
}> = observer(({ upperGutter, senderConfig }) => {
  const { accountStore, starknetAccountStore } = useStore();

  const deployed =
    senderConfig.uiProperties.error instanceof AccountNotDeployed;

  return deployed ? (
    <React.Fragment>
      {upperGutter ? <Gutter size={upperGutter} /> : null}
      <div
        onClick={async (e) => {
          e.preventDefault();

          const msg = new GetStarknetKeyParamsMsg(senderConfig.chainId);
          const params = await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            msg
          );

          starknetAccountStore
            .getAccount(senderConfig.chainId)
            .deployAccount(
              accountStore.getAccount(senderConfig.chainId).starknetHexAddress,
              "0x" + Buffer.from(params.classHash).toString("hex"),
              [
                "0x" + Buffer.from(params.xLow).toString("hex"),
                "0x" + Buffer.from(params.xHigh).toString("hex"),
                "0x" + Buffer.from(params.yLow).toString("hex"),
                "0x" + Buffer.from(params.yHigh).toString("hex"),
              ],
              "0x" + Buffer.from(params.salt).toString("hex"),
              "ETH"
            )
            .then(console.log)
            .catch(console.log);
        }}
      >
        You need to deploy account first
      </div>
    </React.Fragment>
  ) : null;
});
