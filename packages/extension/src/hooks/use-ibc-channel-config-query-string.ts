import { useEffectOnce } from "./use-effect-once";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { IIBCChannelConfig } from "@keplr-wallet/hooks";

export const useIBCChannelConfigQueryString = (
  channelConfig: IIBCChannelConfig
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffectOnce(() => {
    const initialCounterpartyChainId = searchParams.get(
      "initialCounterpartyChainId"
    );
    const initialPortId = searchParams.get("initialPortId");
    const initialChannelId = searchParams.get("initialChannelId");
    if (initialCounterpartyChainId && initialPortId && initialChannelId) {
      channelConfig.setChannel({
        counterpartyChainId: initialCounterpartyChainId,
        portId: initialPortId,
        channelId: initialChannelId,
      });
    }
  });

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (channelConfig.channel) {
          prev.set(
            "initialCounterpartyChainId",
            channelConfig.channel.counterpartyChainId
          );
          prev.set("initialPortId", channelConfig.channel.portId);
          prev.set("initialChannelId", channelConfig.channel.channelId);
        } else {
          prev.delete("initialCounterpartyChainId");
          prev.delete("initialPortId");
          prev.delete("initialChannelId");
        }

        return prev;
      },
      {
        replace: true,
      }
    );
  }, [channelConfig.channel, setSearchParams]);
};
