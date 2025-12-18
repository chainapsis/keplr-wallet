import React, { FunctionComponent, useMemo, useState } from "react";
import { Box } from "../../../../components/box";
import {
  Body2,
  Body3,
  Button2,
  Subtitle1,
  Subtitle3,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Button } from "../../../../components/button";
import { Column, Columns } from "../../../../components/column";
import {
  ChainImageFallback,
  CurrencyImageFallback,
} from "../../../../components/image";
import { Stack } from "../../../../components/stack";
import { Checkbox } from "../../../../components/checkbox";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  InformationPlainIcon,
  NativeChainMarkIcon,
} from "../../../../components/icon";
import styled, { useTheme } from "styled-components";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TokenScan } from "@keplr-wallet/background";
import { CoinPretty } from "@keplr-wallet/unit";
import { Gutter } from "../../../../components/gutter";
import { FormattedMessage, useIntl } from "react-intl";
import SimpleBar from "simplebar-react";
import { XAxis, YAxis } from "../../../../components/axis";
import { EmbedChainInfos } from "../../../../config";
import { DenomHelper } from "@keplr-wallet/common";
import { TokenTag } from "../../../register/enable-chains/components/chain-item";
import { SupportedPaymentType } from "@keplr-wallet/types";
import { useTokenTag } from "../../../../hooks/use-token-tag";

export const TokenFoundModal: FunctionComponent<{
  close: () => void;
  tokenScans: TokenScan[];
}> = observer(({ close, tokenScans }) => {
  const { chainStore, keyRingStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const [checkedChainIdentifiers, setCheckedChainIdentifiers] = useState<
    string[]
  >([]);

  const numFoundToken = useMemo(() => {
    if (tokenScans.length === 0) {
      return 0;
    }

    const set = new Set<string>();

    for (const tokenScan of tokenScans) {
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
  }, [tokenScans]);

  const buttonClicked = async () => {
    if (!keyRingStore.selectedKeyInfo) {
      throw new Error("Unexpected error: no selected key ring");
    }

    const enables = checkedChainIdentifiers
      .filter((identifier) => !chainStore.isEnabledChain(identifier))
      .filter((identifier) => {
        return (
          tokenScans.find((tokenScan) => {
            return (
              ChainIdHelper.parse(tokenScan.chainId).identifier === identifier
            );
          }) != null
        );
      });

    const needBIP44Selects: string[] = [];

    const linkedEnables = new Set<string>();

    for (const enable of enables.slice()) {
      const modularChainInfo = chainStore.getModularChain(enable);
      const tokenScan = tokenScans.find(
        (tokenScan) =>
          ChainIdHelper.parse(tokenScan.chainId).identifier === enable
      );

      if (!tokenScan) continue;

      if ("cosmos" in modularChainInfo || "evm" in modularChainInfo) {
        if (
          keyRingStore.needKeyCoinTypeFinalize(
            keyRingStore.selectedKeyInfo.id,
            chainStore.getModularChain(enable).chainId
          )
        ) {
          if (tokenScan.infos.length > 1) {
            needBIP44Selects.push(enable);
            enables.splice(enables.indexOf(enable), 1);
          }

          if (
            tokenScan.infos.length === 1 &&
            tokenScan.infos[0].coinType != null
          ) {
            await keyRingStore.finalizeKeyCoinType(
              keyRingStore.selectedKeyInfo.id,
              enable,
              tokenScan.infos[0].coinType
            );
          }
        }
      } else if ("starknet" in modularChainInfo) {
        if (tokenScan.infos.length > 1) {
          enables.splice(enables.indexOf(enable), 1);
        }
      } else if ("bitcoin" in modularChainInfo) {
        // 비트코인은 최대 2개의 info (taproot, native segwit)만 가질 수 있다.
        if (tokenScan.infos.length > 2) {
          enables.splice(enables.indexOf(enable), 1);
          continue;
        }

        const linkedChainKey = tokenScan.linkedChainKey;
        if (linkedChainKey) {
          const groupedModularChainInfo =
            chainStore.groupedModularChainInfos.find(
              (group) =>
                "linkedChainKey" in group &&
                group.linkedChainKey === linkedChainKey
            );

          if (groupedModularChainInfo?.linkedModularChainInfos) {
            const chainIdsToAdd = new Set([
              groupedModularChainInfo.chainId,
              ...groupedModularChainInfo.linkedModularChainInfos.map(
                (info) => info.chainId
              ),
            ]);

            for (const chainId of chainIdsToAdd) {
              const identifier = ChainIdHelper.parse(chainId).identifier;

              if (!linkedEnables.has(identifier)) {
                linkedEnables.add(identifier);
              }
            }
          }
        }
      }
    }

    const finalEnables = Array.from(new Set([...enables, ...linkedEnables]));

    if (finalEnables.length > 0) {
      await chainStore.enableChainInfoInUI(...finalEnables);
    }

    if (needBIP44Selects.length > 0) {
      browser.tabs
        .create({
          url: `/register.html#?route=select-derivation-path&vaultId=${
            keyRingStore.selectedKeyInfo.id
          }&chainIds=${needBIP44Selects.join(",")}&skipWelcome=true`,
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
      backgroundColor={
        theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
      }
    >
      <Box paddingTop="1.25rem" paddingBottom="0.75rem">
        <XAxis alignY="center">
          <div style={{ flex: 1 }} />
          <InformationPlainIcon width={16} height={16} />
          <Gutter size="0.5rem" />
          <Subtitle1 style={{ textAlign: "center" }}>
            <FormattedMessage
              id="page.main.components.token-found-modal.title"
              values={{
                numFoundToken,
              }}
            />
          </Subtitle1>
          <div style={{ flex: 1 }} />
        </XAxis>
      </Box>
      <Box paddingBottom="1.5rem" paddingX="1rem">
        <Body2
          style={{
            textAlign: "center",
            color:
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"],
          }}
        >
          <FormattedMessage id="page.main.components.token-found-modal.description" />
        </Body2>
      </Box>
      <SimpleBar
        style={{
          display: "flex",
          flexDirection: "column",
          // 이 크기보다 커지면 아이템 갯수가 5개 넘어갔을 때 전체 스크롤이 생겨서 전체 스크롤이 생기지 않을 크기로 조절했습니다.
          maxHeight: "19.5rem",
          overflowY: "auto",
        }}
      >
        <Stack gutter="0.75rem">
          {tokenScans.map((tokenScan) => {
            return (
              <FoundChainView
                key={tokenScan.chainId}
                tokenScan={tokenScan}
                checked={checkedChainIdentifiers.includes(
                  ChainIdHelper.parse(tokenScan.chainId).identifier
                )}
                isNativeChain={EmbedChainInfos.some(
                  (chain) => chain.chainId === tokenScan.chainId
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
      </SimpleBar>

      <Gutter size="0.75rem" />

      <YAxis alignX="center">
        <Box
          alignX="center"
          cursor="pointer"
          onClick={(e) => {
            e.preventDefault();

            if (tokenScans.length === checkedChainIdentifiers.length) {
              setCheckedChainIdentifiers([]);
            } else {
              setCheckedChainIdentifiers(
                tokenScans.map((tokenScan) => {
                  return ChainIdHelper.parse(tokenScan.chainId).identifier;
                })
              );
            }
          }}
        >
          <XAxis alignY="center">
            <Body2 color={ColorPalette["gray-300"]}>
              <FormattedMessage id="text-button.select-all" />
            </Body2>

            <Gutter size="0.25rem" />

            <Checkbox
              size="small"
              checked={tokenScans.length === checkedChainIdentifiers.length}
              onChange={() => {}}
            />
          </XAxis>
        </Box>
      </YAxis>

      {keyRingStore.selectedKeyInfo?.type === "ledger" ? (
        <React.Fragment>
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
                      url: `/register.html#?route=enable-chains&vaultId=${keyRingStore.selectedKeyInfo.id}&skipWelcome=true`,
                    })
                    .then(() => {
                      window.close();
                    });
                }
              }}
            >
              <Button2 color={ColorPalette["gray-300"]}>
                <FormattedMessage id="page.main.components.token-found-modal.add-token-on-injective-and-evmos" />
              </Button2>
            </Box>
          </Box>
          <Gutter size="1.25rem" />
        </React.Fragment>
      ) : (
        <Gutter size="0.75rem" />
      )}

      <Button
        text={intl.formatMessage({
          id: "page.main.components.token-found-modal.add-chains",
        })}
        size="large"
        disabled={checkedChainIdentifiers.length === 0}
        onClick={buttonClicked}
      />
    </Box>
  );
});

const FoundChainView: FunctionComponent<{
  checked: boolean;
  onCheckbox: (checked: boolean) => void;
  isNativeChain?: boolean;
  tokenScan: TokenScan;
}> = observer(({ checked, onCheckbox, isNativeChain, tokenScan }) => {
  const { chainStore } = useStore();
  const theme = useTheme();

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

  const tokenInfos = tokenScan.infos.reduce((acc, cur) => {
    return [
      ...acc,
      ...cur.assets.map((asset) => ({
        ...asset,
        paymentType: cur.bitcoinAddress?.paymentType,
      })),
    ];
  }, [] as (TokenScan["infos"][0]["assets"][0] & { paymentType?: SupportedPaymentType })[]);

  return (
    <Box
      paddingY="0.875rem"
      paddingX="1rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-650"]
      }
      borderRadius="0.375rem"
    >
      <Columns sum={1} gutter="0.5rem" alignY="center">
        <Box width="2.25rem" height="2.25rem" position="relative">
          <ChainImageFallback
            chainInfo={chainStore.getModularChain(tokenScan.chainId)}
            size="2rem"
            alt="Token Found Modal Chain Image"
          />
          {isNativeChain && (
            <Box
              position="absolute"
              style={{
                bottom: "0.125rem",
                right: "0rem",
              }}
            >
              <NativeChainMarkIcon
                width="1rem"
                height="1rem"
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-10"]
                    : ColorPalette["gray-650"]
                }
              />
            </Box>
          )}
        </Box>

        <Stack gutter="0.25rem">
          <Subtitle3>
            {chainStore.getModularChain(tokenScan.chainId).chainName}
          </Subtitle3>
          <Body3 color={ColorPalette["gray-300"]}>{numTokens} Tokens</Body3>
        </Stack>

        <Column weight={1} />

        <Checkbox checked={checked} onChange={onCheckbox} size="large" />

        <IconButton onClick={() => setIsDetailOpen(!isDetailOpen)}>
          {isDetailOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </IconButton>
      </Columns>

      <VerticalCollapseTransition collapsed={!isDetailOpen}>
        <Box
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["gray-100"]
              : ColorPalette["gray-700"]
          }
          borderRadius="0.375rem"
          paddingY="0.75rem"
          paddingX="1rem"
          marginTop="0.625rem"
        >
          <Stack gutter="0.5rem">
            {tokenInfos.length > 0 ? (
              <React.Fragment>
                {tokenInfos.map((asset) => {
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
  asset: TokenScan["infos"][0]["assets"][0] & {
    paymentType?: SupportedPaymentType;
  };
}> = observer(({ chainId, asset }) => {
  const { chainStore, uiConfigStore } = useStore();
  const theme = useTheme();

  const addressTag = useMemo(() => {
    const currency = asset.currency;
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    if (denomHelper.type === "native") {
      if (chainId.startsWith("bip122:")) {
        const paymentType = asset.paymentType;
        if (paymentType) {
          return {
            text: paymentType
              .split("-")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(" "),
          };
        }
      }
    }
  }, [asset.currency, chainId, asset.paymentType]);

  const tokenTag = useTokenTag({
    token: new CoinPretty(asset.currency, asset.amount),
    chainInfo: chainStore.getModularChain(chainId),
    isFetching: false,
    error: undefined,
  });

  return (
    <Columns sum={1} gutter="0.5rem" alignY="center">
      <Box width="1.5rem" height="1.5rem">
        <CurrencyImageFallback
          chainInfo={chainStore.getModularChain(chainId)}
          currency={asset.currency}
          size="1.5rem"
          alt="Token Found Modal Token Image"
        />
      </Box>
      <Box
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "0.25rem",
        }}
      >
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-400"]
              : ColorPalette["gray-50"]
          }
        >
          {chainStore
            .getModularChainInfoImpl(chainId)
            .forceFindCurrency(asset.currency.coinMinimalDenom).coinDenom ||
            asset.currency.coinDenom}
          {(() => {
            const coinDenom =
              chainStore
                .getModularChainInfoImpl(chainId)
                .forceFindCurrency(asset.currency.coinMinimalDenom).coinDenom ||
              asset.currency.coinDenom;

            if (
              asset.currency.coinMinimalDenom.startsWith("ibc/") &&
              coinDenom
            ) {
              const cut = coinDenom.indexOf(" (");
              return cut > 0 ? coinDenom.slice(0, cut) : coinDenom;
            }
            return coinDenom;
          })()}
        </Subtitle3>
        {addressTag ? <TokenTag text={addressTag.text} /> : null}
        {tokenTag && tokenTag.text === "IBC" ? (
          <TokenTag text={tokenTag.text} tooltip={tokenTag.tooltip} />
        ) : null}
      </Box>

      <Column weight={1} />

      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        {(() => {
          const currency =
            chainStore
              .getModularChainInfoImpl(chainId)
              .forceFindCurrency(asset.currency.coinMinimalDenom) ||
            asset.currency;
          return uiConfigStore.hideStringIfPrivacyMode(
            new CoinPretty(currency, asset.amount)
              .shrink(true)
              .hideIBCMetadata(true)
              .trim(true)
              .maxDecimals(6)
              .inequalitySymbol(true)
              .toString(),
            2
          );
        })()}
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
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-550"]};
  }
`;
