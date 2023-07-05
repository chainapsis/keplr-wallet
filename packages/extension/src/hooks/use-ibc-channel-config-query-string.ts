import { useEffectOnce } from "./use-effect-once";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { IIBCChannelConfig } from "@keplr-wallet/hooks";
import { toJS } from "mobx";

export const useIBCChannelConfigQueryString = (
  channelConfig: IIBCChannelConfig
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffectOnce(() => {
    const initialIBCChannels = searchParams.get("initialIBCChannels");
    if (initialIBCChannels) {
      const channels = JSON.parse(initialIBCChannels);
      channelConfig.setChannels(channels);
    }
  });

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (channelConfig.channels.length > 0) {
          prev.set(
            "initialIBCChannels",
            // toJS는 당장은 필요없기는 한데... 나중에 deep observable이 될 가능성이 있기도하고
            // 해서 나쁠께 없어서 해줌
            JSON.stringify(toJS(channelConfig.channels))
          );
        } else {
          prev.delete("initialIBCChannels");
        }

        return prev;
      },
      {
        replace: true,
      }
    );
  }, [channelConfig.channels, setSearchParams]);
};
