import React, { FunctionComponent, useMemo, useState } from "react";
import { Box } from "../../../../components/box";
import {
  Button2,
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
import { Gutter } from "../../../../components/gutter";

export const TokenFoundModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { chainStore, keyRingStore } = useStore();

  const [checkedChainIdentifiers, setCheckedChainIdentifiers] = useState<
    string[]
  >([]);

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

  const buttonClicked = async () => {
    if (!keyRingStore.selectedKeyInfo) {
      throw new Error("Unexpected error: no selected key ring");
    }

    const enables = checkedChainIdentifiers
      .filter((identifier) => !chainStore.isEnabledChain(identifier))
      .filter((identifier) => {
        return (
          chainStore.tokenScans.find((tokenScan) => {
            return (
              ChainIdHelper.parse(tokenScan.chainId).identifier === identifier
            );
          }) != null
        );
      });

    const needBIP44Selects: string[] = [];

    // chainStore.tokenScans는 체인이 enable되고 나면 그 체인은 사라진다.
    // 근데 로직상 enable 이후에 추가 로직이 있다.
    // 그래서 일단 얇은 복사를 하고 이 값을 사용한다.
    const tokenScans = chainStore.tokenScans.slice();

    for (const enable of enables) {
      if (
        keyRingStore.needMnemonicKeyCoinTypeFinalize(
          keyRingStore.selectedKeyInfo.id,
          chainStore.getChain(enable)
        )
      ) {
        const tokenScan = tokenScans.find((tokenScan) => {
          return ChainIdHelper.parse(tokenScan.chainId).identifier === enable;
        });

        if (tokenScan && tokenScan.infos.length > 1) {
          needBIP44Selects.push(enable);
          enables.splice(enables.indexOf(enable), 1);
        }

        if (
          tokenScan &&
          tokenScan.infos.length === 1 &&
          tokenScan.infos[0].coinType != null
        ) {
          await keyRingStore.finalizeMnemonicKeyCoinType(
            keyRingStore.selectedKeyInfo.id,
            enable,
            tokenScan.infos[0].coinType
          );
        }
      }
    }

    if (enables.length > 0) {
      await chainStore.enableChainInfoInUI(...enables);
    }

    if (needBIP44Selects.length > 0) {
      browser.tabs
        .create({
          url: `/register.html#?route=select-derivation-path&vaultId=${
            keyRingStore.selectedKeyInfo.id
          }&chainIds=${needBIP44Selects.join(",")}`,
        })
        .then(() => {
          window.close();
        });
    }

    close();
  };

  return (
    <Box
      padding="0.75rem"
      paddingTop="0"
      backgroundColor={ColorPalette["gray-600"]}
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
              <FoundChainView
                key={tokenScan.chainId}
                tokenScan={tokenScan}
                checked={checkedChainIdentifiers.includes(
                  ChainIdHelper.parse(tokenScan.chainId).identifier
                )}
                onCheckbox={(checked) => {
                  if (checked) {
                    setCheckedChainIdentifiers((ids) => [
                      ...ids,
                      ChainIdHelper.parse(tokenScan.chainId).identifier,
                    ]);
                  } else {
                    setCheckedChainIdentifiers((ids) =>
                      ids.filter(
                        (id) =>
                          id !==
                          ChainIdHelper.parse(tokenScan.chainId).identifier
                      )
                    );
                  }
                }}
              />
            );
          })}
        </Stack>
      </Box>

      <Gutter size="0.75rem" />
      <Box alignX="center">
        <Box
          style={{
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.preventDefault();

            if (keyRingStore.selectedKeyInfo) {
              browser.tabs
                .create({
                  url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}`,
                })
                .then(() => {
                  window.close();
                });
            }
          }}
        >
          <Button2 color={ColorPalette["gray-300"]}>
            Are you finding Injective, Evmos token?
          </Button2>
        </Box>
      </Box>
      <Gutter size="1.25rem" />

      <Button text="Add Chains" size="large" onClick={buttonClicked} />
    </Box>
  );
});

const FoundChainView: FunctionComponent<{
  checked: boolean;
  onCheckbox: (checked: boolean) => void;

  tokenScan: TokenScan;
}> = observer(({ checked, onCheckbox, tokenScan }) => {
  const { chainStore } = useStore();

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

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

        <Checkbox checked={checked} onChange={onCheckbox} size="large" />

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
