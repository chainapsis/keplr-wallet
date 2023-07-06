import React, { FunctionComponent, useEffect, useState } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { useTheme } from "styled-components";
import { SearchTextInput } from "../../../../components/input";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Gutter } from "../../../../components/gutter";
import SimpleBar from "simplebar-react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Subtitle2 } from "../../../../components/typography";
import { IIBCChannelConfig } from "@keplr-wallet/hooks";

async function testIBCChannels(chainId: string) {
  return new Promise<
    | {
        channels: {
          port: string;
          channelId: string;
          chainId: string;
        }[];
      }[]
    | undefined
  >((resolve) => {
    setTimeout(() => {
      if (chainId.startsWith("cosmoshub")) {
        resolve([
          {
            channels: [
              {
                port: "transfer",
                channelId: "channel-0",
                chainId: "osmosis-1",
              },
            ],
          },
        ]);
      } else {
        resolve(undefined);
      }
    }, 1000);
  });
}

export const IBCTransferSelectDestinationModal: FunctionComponent<{
  chainId: string;
  ibcChannelConfig: IIBCChannelConfig;
}> = observer(({ chainId, ibcChannelConfig }) => {
  const { chainStore } = useStore();

  const theme = useTheme();

  const [destinationChannelsMap, setDestinationChannelsMap] = useState<
    Map<
      string,
      {
        port: string;
        channelId: string;
        chainId: string;
      }[]
    >
  >(new Map());

  useEffect(() => {
    testIBCChannels(chainId).then((channels) => {
      if (!channels) {
        setDestinationChannelsMap(new Map());
        return;
      }

      const map = new Map<
        string,
        {
          port: string;
          channelId: string;
          chainId: string;
        }[]
      >();

      for (const c of channels) {
        if (c.channels.length > 0) {
          let allExist = true;
          for (const channel of c.channels) {
            if (!chainStore.hasChain(channel.chainId)) {
              allExist = false;
              break;
            }
          }

          if (allExist) {
            const destChainId = c.channels[c.channels.length - 1].chainId;
            if (!map.has(destChainId)) {
              map.set(destChainId, c.channels);
            }
          }
        }
      }

      setDestinationChannelsMap(map);
    });
  }, [chainId]);

  const [search, setSearch] = useState("");

  const searchRef = useFocusOnMount<HTMLInputElement>();

  return (
    <Box
      width="100%"
      paddingTop="1.25rem"
      paddingX="0.75rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["white"]
          : ColorPalette["gray-600"]
      }
      style={{
        overflowY: "auto",
      }}
    >
      <SearchTextInput
        ref={searchRef}
        value={search}
        onChange={(e) => {
          e.preventDefault();

          setSearch(e.target.value);
        }}
        placeholder="Search for a chain"
      />

      <Gutter size="0.75rem" />

      <SimpleBar
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          height: "21.5rem",
        }}
      >
        {Array.from(destinationChannelsMap.keys()).map((chainId) => {
          const chainInfo = chainStore.getChain(chainId);

          return (
            <Box
              key={chainInfo.chainId}
              height="4.125rem"
              alignY="center"
              paddingX="1rem"
              cursor="pointer"
              onClick={(e) => {
                e.preventDefault();

                const channels = destinationChannelsMap.get(chainId);
                if (channels) {
                  ibcChannelConfig.setChannels(
                    channels.map((c) => {
                      return {
                        portId: c.port,
                        channelId: c.channelId,
                        counterpartyChainId: c.chainId,
                      };
                    })
                  );
                } else {
                  console.log("No channels");
                  ibcChannelConfig.setChannels([]);
                }
              }}
            >
              <Subtitle2>{chainInfo.chainName}</Subtitle2>
            </Box>
          );
        })}
      </SimpleBar>
    </Box>
  );
});
