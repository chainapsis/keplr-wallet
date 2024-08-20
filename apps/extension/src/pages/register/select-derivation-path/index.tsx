import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRegisterHeader } from "../components/header";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { RegisterSceneBox } from "../components/register-scene-box";
import {
  Body1,
  Body2,
  H3,
  H5,
  Subtitle3,
} from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { Column, Columns } from "../../../components/column";
import { ChainImageFallback } from "../../../components/image";
import { Stack } from "../../../components/stack";
import { Box } from "../../../components/box";
import Color from "color";
import { Styles } from "./styles";
import { WalletIcon } from "../../../components/icon/wallet";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty } from "@keplr-wallet/unit";
import { dispatchGlobalEventExceptSelf } from "../../../utils/global-events";

export const SelectDerivationPathScene: FunctionComponent<{
  // 한 scene 당 하나의 chain id만 다룬다.
  // 첫번째 chain id를 처리하고나면 남은 chain ids를 다음 scene에 넘긴다.
  // 이런식으로 체이닝해서 처리한다.
  chainIds: string[];
  vaultId: string;

  // "Chains 2/4" 식으로 남은 갯수를 알려줘야하는데
  // 체이닝 기반이라 따로 prop을 안받으면 계산이 어려워진다.
  // 똑같은 prop을 체이닝할때 계속 넘겨준다.
  totalCount: number;

  skipWelcome?: boolean;
}> = observer(({ chainIds, vaultId, totalCount, skipWelcome }) => {
  const header = useRegisterHeader();
  const intl = useIntl();
  const theme = useTheme();

  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "step",
        title: intl.formatMessage({
          id: "pages.register.select-derivation-path.title",
        }),
        paragraphs: [
          <Body1 color={ColorPalette["gray-300"]} key="1">
            <FormattedMessage id="pages.register.select-derivation-path.paragraph" />
          </Body1>,
        ],
        stepCurrent: 0,
        stepTotal: 0,
      });
    },
  });

  const { chainStore, keyRingStore } = useStore();

  const navigate = useNavigate();

  const sceneTransition = useSceneTransition();

  const chainId = chainIds[0];
  const chainInfo = chainStore.getChain(chainId);

  const _goToNext = () => {
    if (chainIds.length > 1) {
      sceneTransition.replace("select-derivation-path", {
        vaultId,
        chainIds: chainIds.slice(1),

        totalCount,
      });
    } else {
      if (skipWelcome) {
        window.close();
      } else {
        navigate("/welcome", {
          replace: true,
        });
      }
    }
  };
  const goToNext = useRef(_goToNext);
  goToNext.current = _goToNext;

  const [selectedCoinType, setSelectedCoinType] = useState(-1);

  const [candidates, setCandidates] = useState<
    {
      coinType: number;
      bech32Address: string;
    }[]
  >([]);
  useEffect(() => {
    keyRingStore
      .computeNotFinalizedKeyAddresses(vaultId, chainId)
      .then((res) => {
        setCandidates(res);

        if (res.length > 1) {
          setSelectedCoinType(res[0].coinType);
        }

        if (res.length === 1) {
          (async () => {
            const chainInfo = chainStore.getChain(chainId);
            if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
              await keyRingStore.finalizeKeyCoinType(
                vaultId,
                chainId,
                res[0].coinType
              );
            }
            await chainStore.enableChainInfoInUIWithVaultId(vaultId, chainId);

            dispatchGlobalEventExceptSelf("keplr_derivation_path_changed", {
              chainId,
              keyId: vaultId,
            });

            goToNext.current();
          })();
        }

        if (res.length === 0) {
          goToNext.current();
        }
      });
  }, [chainId, chainStore, keyRingStore, vaultId]);

  const currency = chainInfo.stakeCurrency || chainInfo.currencies[0];

  return (
    <RegisterSceneBox>
      <YAxis alignX="center">
        <Subtitle3
          color={
            theme.mode === "light"
              ? ColorPalette["gray-300"]
              : ColorPalette["gray-200"]
          }
        >
          <FormattedMessage
            id="pages.register.select-derivation-path.chain-step"
            values={{
              currentStep: totalCount - chainIds.length + 1,
              totalStep: totalCount,
            }}
          />
        </Subtitle3>

        <Gutter size="0.75rem" />

        <Box
          padding="0.75rem 2rem 0.75rem 0.75rem"
          borderRadius="3.5rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : Color(ColorPalette["gray-500"]).alpha(0.5).toString()
          }
          borderWidth={theme.mode === "light" ? "1px" : undefined}
          borderColor={
            theme.mode === "light" ? ColorPalette["gray-100"] : undefined
          }
        >
          <Columns sum={1} gutter="0.5rem">
            <Box width="2.75rem" height="2.75rem">
              <ChainImageFallback chainInfo={chainInfo} size="2.75rem" />
            </Box>

            <Stack gutter="0.25rem">
              <H3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette.white
                }
              >
                {chainInfo.chainName}
              </H3>
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
              >
                {currency.coinDenom}
              </Body2>
            </Stack>
          </Columns>
        </Box>

        <Gutter size="1.5rem" />

        <Styles.PathItemList>
          {candidates.map((candidate) => (
            <PathItem
              key={candidate.coinType}
              chainId={chainId}
              coinType={candidate.coinType}
              bech32Address={candidate.bech32Address}
              currency={currency}
              isSelected={selectedCoinType === candidate.coinType}
              onClick={() => {
                setSelectedCoinType(candidate.coinType);
              }}
            />
          ))}
        </Styles.PathItemList>

        <Gutter size="3rem" />

        <Box width="22.5rem" marginX="auto">
          <Button
            text={intl.formatMessage({
              id: "pages.register.select-derivation-path.import-button",
            })}
            size="large"
            disabled={
              !keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo) ||
              selectedCoinType < 0
            }
            onClick={async () => {
              if (selectedCoinType > 0) {
                await keyRingStore.finalizeKeyCoinType(
                  vaultId,
                  chainId,
                  selectedCoinType
                );

                await chainStore.enableChainInfoInUIWithVaultId(
                  vaultId,
                  chainId
                );

                dispatchGlobalEventExceptSelf("keplr_derivation_path_changed", {
                  chainId,
                  keyId: vaultId,
                });

                goToNext.current();
              }
            }}
          />
        </Box>
      </YAxis>
    </RegisterSceneBox>
  );
});

const PathItem: FunctionComponent<{
  chainId: string;

  isSelected: boolean;
  coinType: number;
  bech32Address: string;
  currency: AppCurrency;

  onClick: () => void;
}> = observer(
  ({ chainId, isSelected, coinType, bech32Address, currency, onClick }) => {
    const { queriesStore } = useStore();

    const queries = queriesStore.get(chainId);

    const theme = useTheme();

    return (
      <Styles.ItemContainer
        isSelected={isSelected}
        onClick={(e) => {
          e.preventDefault();

          onClick();
        }}
      >
        <Stack gutter="1rem">
          <Columns sum={1} alignY="center" gutter="1rem">
            <Box
              padding="0.5rem"
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-600"]
                    : ColorPalette["gray-10"],
              }}
            >
              <WalletIcon width="1.25rem" height="1.25rem" />
            </Box>

            <Stack gutter="0.25rem">
              <H5>m/44’/{coinType}’</H5>
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-400"]
                    : ColorPalette["gray-200"]
                }
              >
                {Bech32Address.shortenAddress(bech32Address, 24)}
              </Body2>
            </Stack>
          </Columns>

          <Box
            style={{
              border: `1px solid ${
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-400"]
              }`,
            }}
          />

          <Stack gutter="0.25rem">
            <Columns sum={1} alignY="center">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-50"]
                }
              >
                <FormattedMessage id="pages.register.select-derivation-path.path-item.balance" />
              </Subtitle3>
              <Column weight={1}>
                <YAxis alignX="right">
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-500"]
                        : ColorPalette["gray-50"]
                    }
                  >
                    {(() => {
                      const queryBal = queries.queryBalances
                        .getQueryBech32Address(bech32Address)
                        .getBalance(currency);

                      if (queryBal) {
                        return queryBal.balance;
                      }
                      return new CoinPretty(currency, "0");
                    })()
                      .trim(true)
                      .maxDecimals(6)
                      .inequalitySymbol(true)
                      .shrink(true)
                      .toString()}
                  </Subtitle3>
                </YAxis>
              </Column>
            </Columns>

            <Columns sum={1} alignY="center">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-50"]
                }
              >
                <FormattedMessage id="pages.register.select-derivation-path.path-item.previous-txs" />
              </Subtitle3>
              <Column weight={1}>
                <YAxis alignX="right">
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-500"]
                        : ColorPalette["gray-50"]
                    }
                  >
                    {
                      queries.cosmos.queryAccount.getQueryBech32Address(
                        bech32Address
                      ).sequence
                    }
                  </Subtitle3>
                </YAxis>
              </Column>
            </Columns>
          </Stack>
        </Stack>
      </Styles.ItemContainer>
    );
  }
);
