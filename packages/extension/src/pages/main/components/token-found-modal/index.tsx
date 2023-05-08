import React, { FunctionComponent, useMemo } from "react";
import { Box } from "../../../../components/box";
import {
  Caption1,
  Subtitle1,
  Subtitle3,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Button } from "../../../../components/button";
import { Column, Columns } from "../../../../components/column";
import { ChainImageFallback } from "../../../../components/image";
import { Stack } from "../../../../components/stack";
import { Checkbox } from "../../../../components/checkbox";
import { ArrowDownIcon, ArrowUpIcon } from "../../../../components/icon";
import styled from "styled-components";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TokenScan } from "@keplr-wallet/background";
import { CoinPretty } from "@keplr-wallet/unit";

export const TokenFoundModal: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const numFoundToken = useMemo(() => {
    if (chainStore.tokenScans.length === 0) {
      return 0;
    }

    const set = new Set<string>();

    for (const tokenScan of chainStore.tokenScans) {
      for (const info of tokenScan.infos) {
        for (const asset of info.assets) {
          const key = `${ChainIdHelper.parse(tokenScan.chainId).identifier}/${
            asset.currency.coinMinimalDenom
          }`;
          set.add(key);
        }
      }
    }

    return Array.from(set).length;
  }, [chainStore.tokenScans]);

  return (
    <Box
      padding="0.75rem"
      backgroundColor={ColorPalette["gray-600"]}
      style={{ gap: "0.75rem" }}
    >
      <Box paddingTop="1.25rem" paddingBottom="0.75rem">
        <Subtitle1 style={{ textAlign: "center" }}>
          {numFoundToken} New Token(s) Found
        </Subtitle1>
      </Box>

      <Box maxHeight="22rem" style={{ overflowY: "scroll" }}>
        <Stack gutter="0.75rem">
          {chainStore.tokenScans.map((tokenScan) => {
            return (
              <FoundChainView key={tokenScan.chainId} tokenScan={tokenScan} />
            );
          })}
        </Stack>
      </Box>

      <Button text="Add Chains" size="large" />
    </Box>
  );
});

const FoundChainView: FunctionComponent<{
  tokenScan: TokenScan;
}> = observer(({ tokenScan }) => {
  const { chainStore } = useStore();

  const [isDetailOpen, setIsDetailOpen] = React.useState<boolean>(false);

  const numTokens = useMemo(() => {
    const set = new Set<string>();

    for (const info of tokenScan.infos) {
      for (const asset of info.assets) {
        const key = `${ChainIdHelper.parse(tokenScan.chainId).identifier}/${
          asset.currency.coinMinimalDenom
        }`;
        set.add(key);
      }
    }

    return Array.from(set).length;
  }, [tokenScan]);

  return (
    <Box
      padding="0.875rem"
      backgroundColor={ColorPalette["gray-500"]}
      borderRadius="0.375rem"
    >
      <Columns sum={1} gutter="0.5rem" alignY="center">
        <Box width="2.25rem" height="2.25rem">
          <ChainImageFallback
            alt="Token Found Modal Chain Image"
            src={chainStore.getChain(tokenScan.chainId).chainSymbolImageUrl}
          />
        </Box>

        <Stack gutter="0.25rem">
          <Subtitle1 color={ColorPalette["gray-10"]}>
            {chainStore.getChain(tokenScan.chainId).chainName}
          </Subtitle1>
          <Caption1 color={ColorPalette["gray-300"]}>
            {numTokens} Tokens
          </Caption1>
        </Stack>

        <Column weight={1} />

        <Checkbox checked={true} onChange={() => {}} size="large" />

        <IconButton onClick={() => setIsDetailOpen(!isDetailOpen)}>
          {isDetailOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </IconButton>
      </Columns>

      <VerticalCollapseTransition collapsed={!isDetailOpen}>
        <Box
          backgroundColor={ColorPalette["gray-400"]}
          borderRadius="0.375rem"
          paddingY="0.75rem"
          paddingX="1rem"
          marginTop="0.75rem"
        >
          <Stack gutter="0.5rem">
            {tokenScan.infos.length > 0 &&
            tokenScan.infos[0].assets.length > 0 ? (
              <React.Fragment>
                {tokenScan.infos[0].assets.map((asset) => {
                  return (
                    <FoundTokenView
                      key={asset.currency.coinMinimalDenom}
                      chainId={tokenScan.chainId}
                      asset={asset}
                    />
                  );
                })}
              </React.Fragment>
            ) : null}
          </Stack>
        </Box>
      </VerticalCollapseTransition>
    </Box>
  );
});

const FoundTokenView: FunctionComponent<{
  chainId: string;
  asset: TokenScan["infos"][0]["assets"][0];
}> = observer(({ chainId, asset }) => {
  const { chainStore } = useStore();

  return (
    <Columns sum={1} gutter="0.5rem" alignY="center">
      <Box width="1.75rem" height="1.75rem">
        <ChainImageFallback
          alt="Token Found Modal Token Image"
          src={undefined}
        />
      </Box>

      <Subtitle3 color={ColorPalette["gray-50"]}>
        {
          chainStore
            .getChain(chainId)
            .forceFindCurrency(asset.currency.coinMinimalDenom).coinDenom
        }
      </Subtitle3>

      <Column weight={1} />

      <Subtitle3 color={ColorPalette["gray-50"]}>
        {new CoinPretty(
          chainStore
            .getChain(chainId)
            .forceFindCurrency(asset.currency.coinMinimalDenom),
          asset.amount
        )
          .shrink(true)
          .trim(true)
          .maxDecimals(6)
          .inequalitySymbol(true)
          .toString()}
      </Subtitle3>
    </Columns>
  );
});

const IconButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 2.5rem;
  height: 2.5rem;

  cursor: pointer;

  border-radius: 50%;

  color: ${ColorPalette["gray-200"]};

  :hover {
    background-color: ${ColorPalette["gray-550"]};
  }
`;
