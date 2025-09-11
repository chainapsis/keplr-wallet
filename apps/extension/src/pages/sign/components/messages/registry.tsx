import React, { FunctionComponent } from "react";
import { IMessageRenderer, IMessageRenderRegistry } from "./types";
import { Msg } from "@keplr-wallet/types";
import {
  AnyWithUnpacked,
  ChainIdHelper,
  defaultProtoCodec,
  ProtoCodec,
} from "@keplr-wallet/cosmos";
import yaml from "js-yaml";
import {
  AgoricProvisionMessage,
  AgoricWalletSpendActionMessage,
  ClaimRewardsMessage,
  CustomIcon,
  DelegateMessage,
  ExecuteContractMessage,
  RedelegateMessage,
  SendMessage,
  TransferMessage,
  UndelegateMessage,
  VoteMessage,
  PayPacketFeeMessage,
  CreateBtcDelegationMessage,
} from "./render";
import { FormattedMessage } from "react-intl";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { ClaimBtcDelegationRewardMessage } from "./render/claim-btc-delegation-reward";
import { AtomoneMintPhotonMessage } from "./render/atomone-mint-photon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";

export class MessageRenderRegistry implements IMessageRenderRegistry {
  protected renderers: IMessageRenderer[] = [];

  register(renderer: IMessageRenderer): void {
    this.renderers.push(renderer);
  }

  render(
    chainId: string,
    protoCodec: ProtoCodec,
    msg: Msg | AnyWithUnpacked
  ): {
    icon: React.ReactElement;
    title: string | React.ReactElement;
    content: string | React.ReactElement;
  } {
    try {
      for (const renderer of this.renderers) {
        const res = renderer.process(chainId, msg, protoCodec);
        if (res) {
          return res;
        }
      }
    } catch (e) {
      console.log(e);
      // Fallback to unknown message
    }

    return {
      icon: <CustomIcon />,
      title: (
        <FormattedMessage id="page.sign.components.messages.custom.title" />
      ),
      content: <UnknownMessageContent msg={msg} chainId={chainId} />,
    };
  }
}

const UnknownMessageContent: FunctionComponent<{
  msg: Msg | AnyWithUnpacked;
  chainId: string;
}> = observer(({ msg, chainId }) => {
  const theme = useTheme();
  const { queriesStore } = useStore();

  const prettyMsg: string | null = (() => {
    try {
      if ("type" in msg) {
        return yaml.dump(msg);
      }

      if ("typeUrl" in msg) {
        const chainIdentifier = ChainIdHelper.parse(chainId).identifier;
        const keplrETCQueries = queriesStore.get(chainId).keplrETC;

        const decoded = keplrETCQueries.queryTxMsgDecoder.protoToAmino(
          chainIdentifier,
          [
            {
              typeUrl: msg.typeUrl,
              value: Buffer.from(msg.value).toString("base64"),
            },
          ]
        ).response?.data?.result;

        if (decoded?.messages?.length) {
          return yaml.dump(
            {
              typeUrl: msg.typeUrl,
              value: decoded.messages[0]["value"],
            },
            {
              indent: 2,
              sortKeys: true,
            }
          );
        }

        return yaml.dump(defaultProtoCodec.unpackedAnyToJSONRecursive(msg));
      }

      return yaml.dump(msg);
    } catch (e) {
      console.log(e);
      return "Failed to decode the msg";
    }
  })();

  return (
    <pre
      style={{
        margin: 0,
        color:
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"],
      }}
    >
      {prettyMsg}
    </pre>
  );
});

export const defaultRegistry = new MessageRenderRegistry();
defaultRegistry.register(AgoricProvisionMessage);
defaultRegistry.register(AgoricWalletSpendActionMessage);
defaultRegistry.register(ClaimRewardsMessage);
defaultRegistry.register(DelegateMessage);
defaultRegistry.register(ExecuteContractMessage);
defaultRegistry.register(RedelegateMessage);
defaultRegistry.register(SendMessage);
defaultRegistry.register(TransferMessage);
defaultRegistry.register(UndelegateMessage);
defaultRegistry.register(VoteMessage);
defaultRegistry.register(PayPacketFeeMessage);
defaultRegistry.register(CreateBtcDelegationMessage);
defaultRegistry.register(ClaimBtcDelegationRewardMessage);
defaultRegistry.register(AtomoneMintPhotonMessage);
