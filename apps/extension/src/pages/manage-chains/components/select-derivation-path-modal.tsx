import React, { FunctionComponent, useEffect, useState } from "react";
import { Modal } from "../../../components/modal";
import { YAxis, XAxis } from "../../../components/axis";
import { Box } from "../../../components/box";
import { Body2, H3, H5, Subtitle3 } from "../../../components/typography";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import { useStore } from "../../../stores";
import { observer } from "mobx-react-lite";
import { AppCurrency } from "@keplr-wallet/types";
import { FormattedMessage, useIntl } from "react-intl";
import { ColorPalette } from "../../../styles";
import { Styles as RegisterStyles } from "../../register/select-derivation-path/styles";
import styled from "styled-components";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CoinPretty } from "@keplr-wallet/unit";
import { useTheme } from "styled-components";
import { dispatchGlobalEventExceptSelf } from "../../../utils/global-events";
import { Gutter } from "../../../components/gutter";

export const SelectDerivationPathModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  chainIds: string[];
  vaultId: string;
}> = observer(({ isOpen, close, chainIds, vaultId }) => {
  const { chainStore, keyRingStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const chainId = chainIds[currentIndex];

  const chainInfo =
    chainId && chainStore.hasChain(chainId)
      ? chainStore.getChain(chainId)
      : undefined;

  const goToNext = () => {
    if (currentIndex < chainIds.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      close();
    }
  };

  const [selectedCoinType, setSelectedCoinType] = useState(-1);
  const [candidates, setCandidates] = useState<
    {
      coinType: number;
      bech32Address: string;
    }[]
  >([]);

  useEffect(() => {
    setSelectedCoinType(-1);

    if (!isOpen || !chainId || !chainInfo) return;

    keyRingStore
      .computeNotFinalizedKeyAddresses(vaultId, chainId)
      .then(async (res) => {
        setCandidates(res);

        if (res.length > 1) {
          setSelectedCoinType(res[0].coinType);
        }

        if (res.length === 1) {
          const [single] = res;
          if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
            await keyRingStore.finalizeKeyCoinType(
              vaultId,
              chainId,
              single.coinType
            );
          }
          await chainStore.enableChainInfoInUIWithVaultId(vaultId, chainId);

          dispatchGlobalEventExceptSelf("keplr_derivation_path_changed", {
            chainId,
            keyId: vaultId,
          });

          goToNext();
        }

        if (res.length === 0) {
          goToNext();
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chainId, chainStore, keyRingStore, vaultId]);

  useEffect(() => {
    if (isOpen && (!chainId || !chainInfo)) {
      close();
    }
  }, [isOpen, chainId, chainInfo, close]);

  if (!chainId || !chainInfo) {
    return null;
  }

  const currency = chainInfo.stakeCurrency || chainInfo.currencies[0];

  return (
    <Modal isOpen={isOpen} align="bottom" close={close} maxHeight="95vh">
      <Styles.Container>
        <YAxis alignX="center">
          <Box
            width="2.5rem"
            height="0.3125rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["gray-100"]
                : ColorPalette["gray-400"]
            }
            borderRadius="1.4375rem"
          />
          <Gutter size="1.5rem" />
          <YAxis alignX="center">
            <XAxis alignY="center" gap="0.5rem">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  d="M10 7.6875V10.8125M17.5 10.1875C17.5 14.3296 14.1421 17.6875 10 17.6875C5.85786 17.6875 2.5 14.3296 2.5 10.1875C2.5 6.04536 5.85786 2.6875 10 2.6875C14.1421 2.6875 17.5 6.04536 17.5 10.1875ZM10 13.3125H10.0063V13.3188H10V13.3125Z"
                  stroke={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette.white
                  }
                  strokeWidth="2.08333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <H3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette["white"]
                }
              >
                {intl.formatMessage({
                  id: "pages.manage-chains.select-derivation-path-modal.title",
                })}
              </H3>
            </XAxis>
            <Gutter size="0.75rem" />
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-300"]
                  : ColorPalette["gray-200"]
              }
              style={{
                textAlign: "center",
                lineHeight: "140%",
                marginBottom: "0.25rem",
              }}
            >
              {intl.formatMessage(
                {
                  id: "pages.manage-chains.select-derivation-path-modal.paragraph",
                },
                {
                  br: <br />,
                }
              )}
            </Body2>
            <Gutter size="1rem" />
            <XAxis alignY="center" gap="0.5rem">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-700"]
                    : ColorPalette.white
                }
                style={{ fontWeight: 500 }}
              >
                {chainInfo.chainName}
              </Subtitle3>
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              >
                {currentIndex + 1}/{chainIds.length}
              </Body2>
            </XAxis>
          </YAxis>
          <Gutter size="1rem" />
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
          <Gutter size="1.5rem" />
          <Box width="21rem" marginX="auto">
            <Button
              text={intl.formatMessage({
                id: "pages.manage-chains.select-derivation-path-modal.import-button",
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

                  dispatchGlobalEventExceptSelf(
                    "keplr_derivation_path_changed",
                    {
                      chainId,
                      keyId: vaultId,
                    }
                  );

                  goToNext();
                }
              }}
            />
          </Box>
        </YAxis>
      </Styles.Container>
    </Modal>
  );
});

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 0.75rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
  PathItemList: styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;

    gap: 0.75rem;
  `,
};

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

    const fillColor =
      theme.mode === "light"
        ? ColorPalette["gray-600"]
        : ColorPalette["gray-10"];

    return (
      <RegisterStyles.ItemContainer
        isSelected={isSelected}
        onClick={(e) => {
          e.preventDefault();

          onClick();
        }}
      >
        <Stack gutter="1rem">
          <XAxis alignY="center" gap="1rem">
            <Box
              padding="0.5rem"
              style={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-600"]
                    : ColorPalette["gray-10"],
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  d="M1.89423 5.1877C2.55532 4.60411 3.42376 4.25 4.37491 4.25H15.6249C16.5761 4.25 17.4445 4.60412 18.1056 5.1877C17.9519 3.95438 16.8999 3 15.6249 3H4.37491C3.09996 3 2.04792 3.95438 1.89423 5.1877Z"
                  fill={fillColor}
                />
                <path
                  d="M1.89423 7.6877C2.55532 7.10411 3.42376 6.75 4.37491 6.75H15.6249C16.5761 6.75 17.4445 7.10412 18.1056 7.6877C17.9519 6.45438 16.8999 5.5 15.6249 5.5H4.37491C3.09996 5.5 2.04792 6.45438 1.89423 7.6877Z"
                  fill={fillColor}
                />
                <path
                  d="M4.375 8C2.99429 8 1.875 9.11929 1.875 10.5V15.5C1.875 16.8807 2.99429 18 4.375 18H15.625C17.0057 18 18.125 16.8807 18.125 15.5V10.5C18.125 9.11929 17.0057 8 15.625 8H12.5C12.1548 8 11.875 8.27982 11.875 8.625C11.875 9.66053 11.0355 10.5 10 10.5C8.96447 10.5 8.125 9.66053 8.125 8.625C8.125 8.27982 7.84518 8 7.5 8H4.375Z"
                  fill={fillColor}
                />
              </svg>
            </Box>

            <Stack gutter="0.25rem">
              <H5>{`m/44’/${coinType}’`}</H5>
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
          </XAxis>

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
            <XAxis alignY="center">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-200"]
                }
              >
                <FormattedMessage id="pages.register.select-derivation-path.path-item.balance" />
              </Subtitle3>
              <div style={{ flex: 1 }} />
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
            </XAxis>

            <XAxis alignY="center">
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-200"]
                }
              >
                <FormattedMessage id="pages.register.select-derivation-path.path-item.previous-txs" />
              </Subtitle3>
              <div style={{ flex: 1 }} />
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
            </XAxis>
          </Stack>
        </Stack>
      </RegisterStyles.ItemContainer>
    );
  }
);
