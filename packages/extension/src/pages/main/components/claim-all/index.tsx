import React, { FunctionComponent, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Body2, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewToken } from "../../index";
import styled from "styled-components";
import { ArrowDownIcon, ArrowUpIcon } from "../../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Dec, Int, PricePretty } from "@keplr-wallet/unit";
import { AminoSignResponse, StdSignDoc } from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { PrivilegeCosmosSignAminoWithdrawRewardsMsg } from "@keplr-wallet/background";

const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 0.75rem 0 0 0;
    border-radius: 0.375rem;
  `,
  ExpandButton: styled(Box)`
    :hover {
      background-color: ${ColorPalette["gray-500"]};
      opacity: 0.5;
    }

    :active {
      background-color: ${ColorPalette["gray-500"]};
      opacity: 0.2;
    }
  `,
};

export const ClaimAll: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const viewTokens: ViewToken[] = chainStore.chainInfosInUI
    .map((chainInfo) => {
      const chainId = chainInfo.chainId;
      const accountAddress = accountStore.getAccount(chainId).bech32Address;
      const queries = queriesStore.get(chainId);

      return {
        token:
          queries.cosmos.queryRewards.getQueryBech32Address(accountAddress)
            .stakableReward,
        chainInfo,
      };
    })
    .filter((viewToken) => viewToken.token.toDec().gt(new Dec(0)));

  const [isExpanded, setIsExpanded] = useState(true);

  const totalPrice = (() => {
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    );
    if (!fiatCurrency) {
      return undefined;
    }

    let res = new PricePretty(fiatCurrency, 0);

    for (const viewToken of viewTokens) {
      const price = priceStore.calculatePrice(viewToken.token);
      if (price) {
        res = res.add(price);
      }
    }

    return res;
  })();

  // TODO: Add below property to config.ui.ts
  const defaultGasPerDelegation = 140000;

  const claimAll = () => {
    for (const viewToken of viewTokens) {
      const chainId = viewToken.chainInfo.chainId;
      const account = accountStore.getAccount(chainId);

      if (!account.bech32Address) {
        continue;
      }

      const chainInfo = chainStore.getChain(chainId);
      const queries = queriesStore.get(chainId);
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
      );

      const validatorAddresses =
        queryRewards.getDescendingPendingRewardValidatorAddresses(8);

      if (validatorAddresses.length === 0) {
        continue;
      }

      const tx =
        account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

      const defaultGas = validatorAddresses.length * defaultGasPerDelegation;

      (async () => {
        // At present, only assume that user can pay the fee with the stake currency.
        // (Normally, user has stake currency because it is used for staking)
        const feeCurrency = chainInfo.feeCurrencies.find(
          (cur) =>
            cur.coinMinimalDenom === chainInfo.stakeCurrency.coinMinimalDenom
        );
        if (feeCurrency) {
          try {
            const simulated = await tx.simulate({
              amount: [
                {
                  denom: feeCurrency.coinMinimalDenom,
                  amount: new Dec(feeCurrency.gasPriceStep?.average ?? 0.025)
                    .mul(new Dec(defaultGas))
                    .roundUp()
                    .toString(),
                },
              ],
            });

            // Gas adjustment is 1.5
            // Since there is currently no convenient way to adjust the gas adjustment on the UI,
            // Use high gas adjustment to prevent failure.
            const gasEstimated = new Dec(simulated.gasUsed * 1.5).truncate();
            const fee = {
              denom: feeCurrency.coinMinimalDenom,
              amount: new Dec(feeCurrency.gasPriceStep?.average ?? 0.025)
                .mul(new Dec(gasEstimated))
                .roundUp()
                .toString(),
            };

            const stakableReward = queryRewards.stakableReward;
            if (
              new Dec(stakableReward.toCoin().amount).lte(new Dec(fee.amount))
            ) {
              console.log(
                `Fee: ${fee.amount}${
                  fee.denom
                } is greater than stakable reward: ${
                  stakableReward.toCoin().amount
                }${stakableReward.toCoin().denom}`
              );
              return;
            }

            await tx.send(
              {
                gas: gasEstimated.toString(),
                amount: [fee],
              },
              "",
              {
                signAmino: async (
                  chainId: string,
                  signer: string,
                  signDoc: StdSignDoc
                ): Promise<AminoSignResponse> => {
                  const requester = new InExtensionMessageRequester();

                  return await requester.sendMessage(
                    BACKGROUND_PORT,
                    new PrivilegeCosmosSignAminoWithdrawRewardsMsg(
                      chainId,
                      signer,
                      signDoc
                    )
                  );
                },
              },
              {
                onFulfill: (tx: any) => {
                  console.log(tx.code, tx);
                },
              }
            );
          } catch (e) {
            console.log(e);
            return;
          }
        }
      })();
    }
  };

  // TODO: Add loading state.
  return (
    <Styles.Container>
      <Box paddingX="1rem">
        <Columns sum={1} alignY="center">
          <Column weight={1}>
            <Stack gutter="0.5rem">
              <Body2 style={{ color: ColorPalette["gray-300"] }}>
                Pending Staking Reward
              </Body2>
              <Subtitle2 style={{ color: ColorPalette["gray-10"] }}>
                {totalPrice ? totalPrice.separator(" ").toString() : "?"}
              </Subtitle2>
            </Stack>
          </Column>
          <Button text="Claim All" size="small" onClick={claimAll} />
        </Columns>
      </Box>

      <Styles.ExpandButton
        paddingX="0.125rem"
        alignX="center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ArrowDownIcon width="1.25rem" height="1.25rem" />
        ) : (
          <ArrowUpIcon width="1.25rem" height="1.25rem" />
        )}
      </Styles.ExpandButton>

      <VerticalCollapseTransition collapsed={isExpanded}>
        {viewTokens.map((viewToken) => {
          return (
            <ClaimTokenItem
              viewToken={viewToken}
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
            />
          );
        })}
      </VerticalCollapseTransition>
    </Styles.Container>
  );
});

const ClaimTokenItem: FunctionComponent<{ viewToken: ViewToken }> = observer(
  ({ viewToken }) => {
    const { accountStore, queriesStore } = useStore();

    // TODO: Add below property to config.ui.ts
    const defaultGasPerDelegation = 140000;

    const claim = async () => {
      const chainId = viewToken.chainInfo.chainId;
      const account = accountStore.getAccount(chainId);

      const queries = queriesStore.get(chainId);
      const queryRewards = queries.cosmos.queryRewards.getQueryBech32Address(
        account.bech32Address
      );

      const validatorAddresses =
        queryRewards.getDescendingPendingRewardValidatorAddresses(8);

      if (validatorAddresses.length === 0) {
        return;
      }

      const tx =
        account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

      let gas = new Int(validatorAddresses.length * defaultGasPerDelegation);

      try {
        const simulated = await tx.simulate();

        // Gas adjustment is 1.5
        // Since there is currently no convenient way to adjust the gas adjustment on the UI,
        // Use high gas adjustment to prevent failure.
        gas = new Dec(simulated.gasUsed * 1.5).truncate();
      } catch (e) {
        console.log(e);
      }

      await tx.send(
        {
          gas: gas.toString(),
          amount: [],
        },
        "",
        {},
        {
          onFulfill: (tx: any) => {
            console.log(tx.code, tx);
          },
        }
      );
    };

    // TODO: Add loading state.
    return (
      <Box padding="1rem">
        <Columns sum={1} alignY="center">
          {viewToken.token.currency.coinImageUrl && (
            <img
              width="32px"
              height="32px"
              src={viewToken.token.currency.coinImageUrl}
            />
          )}
          <Column weight={1}>
            <Stack gutter="0.375rem">
              <Subtitle3 style={{ color: ColorPalette["gray-300"] }}>
                {viewToken.token.currency.coinDenom}
              </Subtitle3>
              <Subtitle2 style={{ color: ColorPalette["gray-10"] }}>
                {viewToken.token.hideDenom(true).toString()}
              </Subtitle2>
            </Stack>
          </Column>

          <Button text="Claim" size="small" color="secondary" onClick={claim} />
        </Columns>
      </Box>
    );
  }
);
