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

export const TokenFoundModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const { chainStore, keyRingStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

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
      const modularChainInfo = chainStore.getModularChain(enable);
      if ("cosmos" in modularChainInfo) {
        if (
          keyRingStore.needKeyCoinTypeFinalize(
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
            await keyRingStore.finalizeKeyCoinType(
              keyRingStore.selectedKeyInfo.id,
              enable,
              tokenScan.infos[0].coinType
            );
          }
        }
      } else if ("starknet" in modularChainInfo) {
        const tokenScan = tokenScans.find((tokenScan) => {
          return ChainIdHelper.parse(tokenScan.chainId).identifier === enable;
        });

        if (tokenScan && tokenScan.infos.length > 1) {
          enables.splice(enables.indexOf(enable), 1);
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
      </SimpleBar>

      <Gutter size="0.75rem" />

      <YAxis alignX="center">
        <Box
          alignX="center"
          cursor="pointer"
          onClick={(e) => {
            e.preventDefault();

            if (
              chainStore.tokenScans.length === checkedChainIdentifiers.length
            ) {
              setCheckedChainIdentifiers([]);
            } else {
              setCheckedChainIdentifiers(
                chainStore.tokenScans.map((tokenScan) => {
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
              checked={
                chainStore.tokenScans.length === checkedChainIdentifiers.length
              }
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

  tokenScan: TokenScan;
}> = observer(({ checked, onCheckbox, tokenScan }) => {
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
        <Box width="2.25rem" height="2.25rem">
          <ChainImageFallback
            chainInfo={
              chainStore.hasChain(tokenScan.chainId)
                ? chainStore.getChain(tokenScan.chainId)
                : chainStore.getModularChain(tokenScan.chainId)
            }
            size="2rem"
            alt="Token Found Modal Chain Image"
          />
        </Box>

        <Stack gutter="0.25rem">
          <Subtitle3>
            {
              (chainStore.hasChain(tokenScan.chainId)
                ? chainStore.getChain(tokenScan.chainId)
                : chainStore.getModularChain(tokenScan.chainId)
              ).chainName
            }
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
  const { chainStore, uiConfigStore } = useStore();
  const theme = useTheme();

  return (
    <Columns sum={1} gutter="0.5rem" alignY="center">
      <Box width="1.75rem" height="1.75rem">
        <CurrencyImageFallback
          chainInfo={
            chainStore.hasChain(chainId)
              ? chainStore.getChain(chainId)
              : chainStore.getModularChain(chainId)
          }
          currency={asset.currency}
          size="1.75rem"
          alt="Token Found Modal Token Image"
        />
      </Box>

      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-400"]
            : ColorPalette["gray-50"]
        }
      >
        {(() => {
          if (chainStore.hasChain(chainId)) {
            return chainStore
              .getChain(chainId)
              .forceFindCurrency(asset.currency.coinMinimalDenom).coinDenom;
          } else {
            const modularChainInfo = chainStore.getModularChain(chainId);
            if ("starknet" in modularChainInfo) {
              return (
                chainStore
                  .getModularChainInfoImpl(chainId)
                  .getCurrencies("starknet")
                  .find(
                    (cur) =>
                      cur.coinMinimalDenom === asset.currency.coinMinimalDenom
                  )?.coinDenom ?? asset.currency.coinDenom
              );
            } else if ("cosmos" in modularChainInfo) {
              return (
                chainStore
                  .getModularChainInfoImpl(chainId)
                  .getCurrencies("cosmos")
                  .find(
                    (cur) =>
                      cur.coinMinimalDenom === asset.currency.coinMinimalDenom
                  )?.coinDenom ?? asset.currency.coinDenom
              );
            } else {
              return asset.currency.coinDenom;
            }
          }
        })()}
      </Subtitle3>

      <Column weight={1} />

      <Subtitle3
        color={
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"]
        }
      >
        {(() => {
          const currency = (() => {
            if (chainStore.hasChain(chainId)) {
              return chainStore
                .getChain(chainId)
                .forceFindCurrency(asset.currency.coinMinimalDenom);
            } else {
              const modularChainInfo = chainStore.getModularChain(chainId);
              if ("starknet" in modularChainInfo) {
                return (
                  chainStore
                    .getModularChainInfoImpl(chainId)
                    .getCurrencies("starknet")
                    .find(
                      (cur) =>
                        cur.coinMinimalDenom === asset.currency.coinMinimalDenom
                    ) ?? asset.currency
                );
              } else if ("cosmos" in modularChainInfo) {
                return (
                  chainStore
                    .getModularChainInfoImpl(chainId)
                    .getCurrencies("cosmos")
                    .find(
                      (cur) =>
                        cur.coinMinimalDenom === asset.currency.coinMinimalDenom
                    ) ?? asset.currency
                );
              } else {
                return asset.currency;
              }
            }
          })();
          return uiConfigStore.hideStringIfPrivacyMode(
            new CoinPretty(currency, asset.amount)
              .shrink(true)
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
