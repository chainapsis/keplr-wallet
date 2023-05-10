import React, { FunctionComponent, useRef, useState } from "react";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { Body2, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { ViewToken } from "../../index";
import styled, { css } from "styled-components";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  WarningIcon,
} from "../../../../components/icon";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Dec, Int, PricePretty } from "@keplr-wallet/unit";
import {
  AminoSignResponse,
  BroadcastMode,
  StdSignDoc,
} from "@keplr-wallet/types";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  SendTxMsg,
} from "@keplr-wallet/background";
import { action, makeObservable, observable } from "mobx";
import { Tooltip } from "../../../../components/tooltip";
import { isSimpleFetchError } from "@keplr-wallet/simple-fetch";
import { useNotification } from "../../../../hooks/notification";
import { useNavigate } from "react-router";
import { Skeleton } from "../../../../components/skeleton";
import { YAxis } from "../../../../components/axis";
import Color from "color";

const Styles = {
  Container: styled.div`
    background-color: ${ColorPalette["gray-600"]};
    padding: 0.75rem 0 0 0;
    border-radius: 0.375rem;
  `,
  ExpandButton: styled(Box)<{ viewTokenCount: number }>`
    ${({ viewTokenCount }) => {
      if (viewTokenCount === 0) {
        return css`
          cursor: not-allowed;
        `;
      }

      return css`
        :hover {
          background-color: ${Color(ColorPalette["gray-500"])
            .alpha(0.5)
            .toString()};
        }

        :active {
          background-color: ${Color(ColorPalette["gray-500"])
            .alpha(0.2)
            .toString()};
        }
      `;
    }};
  `,
};

// XXX: 좀 이상하긴 한데 상위/하위 컴포넌트가 state를 공유하기 쉽게하려고 이렇게 한다...
class ClaimAllEachState {
  @observable
  isLoading: boolean = false;

  @observable
  failedReason: Error | undefined = undefined;

  constructor() {
    makeObservable(this);
  }

  @action
  setIsLoading(value: boolean): void {
    this.isLoading = value;
  }

  @action
  setFailedReason(value: Error | undefined): void {
    this.isLoading = false;
    this.failedReason = value;
  }
}

const zeroDec = new Dec(0);

export const ClaimAll: FunctionComponent<{ isNotReady?: boolean }> = observer(
  ({ isNotReady }) => {
    const { chainStore, accountStore, queriesStore, priceStore, keyRingStore } =
      useStore();

    const [isExpanded, setIsExpanded] = useState(false);

    const statesRef = useRef(new Map<string, ClaimAllEachState>());
    const getClaimAllEachState = (chainId: string): ClaimAllEachState => {
      const chainIdentifier = chainStore.getChain(chainId).chainIdentifier;
      let state = statesRef.current.get(chainIdentifier);
      if (!state) {
        state = new ClaimAllEachState();
        statesRef.current.set(chainIdentifier, state);
      }

      return state;
    };

    const viewTokens: ViewToken[] = chainStore.chainInfosInUI
      .map((chainInfo) => {
        const chainId = chainInfo.chainId;
        const accountAddress = accountStore.getAccount(chainId).bech32Address;
        const queries = queriesStore.get(chainId);
        const queryRewards =
          queries.cosmos.queryRewards.getQueryBech32Address(accountAddress);

        return {
          token: queryRewards.stakableReward,
          chainInfo,
          isFetching: queryRewards.isFetching,
          error: queryRewards.error,
        };
      })
      .filter((viewToken) => viewToken.token.toDec().gt(zeroDec))
      .sort((a, b) => {
        const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
        const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

        if (aPrice.equals(bPrice)) {
          return 0;
        }
        return aPrice.gt(bPrice) ? -1 : 1;
      })
      .sort((a, b) => {
        const aHasError =
          getClaimAllEachState(a.chainInfo.chainId).failedReason != null;
        const bHasError =
          getClaimAllEachState(b.chainInfo.chainId).failedReason != null;

        if (aHasError || bHasError) {
          if (aHasError && bHasError) {
            return 0;
          } else if (aHasError) {
            return 1;
          } else {
            return -1;
          }
        }

        return 0;
      });

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

    const isLedger =
      keyRingStore.selectedKeyInfo &&
      keyRingStore.selectedKeyInfo.type === "ledger";

    const claimAll = () => {
      if (viewTokens.length > 0) {
        setIsExpanded(true);
      }

      if (isLedger) {
        // Ledger에서 현실적으로 이 기능을 처리해주기 난감하다.
        // disable하기보다는 일단 눌렀을때 expand를 시켜주고 아무것도 하지 않는다.
        return;
      }

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

        const state = getClaimAllEachState(chainId);

        state.setIsLoading(true);

        const tx =
          account.cosmos.makeWithdrawDelegationRewardTx(validatorAddresses);

        (async () => {
          // At present, only assume that user can pay the fee with the stake currency.
          // (Normally, user has stake currency because it is used for staking)
          const feeCurrency = chainInfo.feeCurrencies.find(
            (cur) =>
              cur.coinMinimalDenom === chainInfo.stakeCurrency.coinMinimalDenom
          );
          if (feeCurrency) {
            try {
              const simulated = await tx.simulate();

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

              const balance = queries.queryBalances
                .getQueryBech32Address(account.bech32Address)
                .balances.find(
                  (bal) =>
                    bal.currency.coinMinimalDenom ===
                    feeCurrency.coinMinimalDenom
                );

              if (!balance) {
                state.setFailedReason(
                  new Error("Can't find balance for fee currency")
                );
                return;
              }

              await balance.waitResponse();

              if (
                new Dec(balance.balance.toCoin().amount).lt(new Dec(fee.amount))
              ) {
                state.setFailedReason(
                  new Error("Not enough balance to pay fee")
                );
                return;
              }

              const stakableReward = queryRewards.stakableReward;
              if (
                new Dec(stakableReward.toCoin().amount).lte(new Dec(fee.amount))
              ) {
                console.log(
                  `(${chainId}) Skip claim rewards. Fee: ${fee.amount}${
                    fee.denom
                  } is greater than stakable reward: ${
                    stakableReward.toCoin().amount
                  }${stakableReward.toCoin().denom}`
                );
                state.setFailedReason(
                  new Error("TODO: 기대값보다 소모값이 더 높음")
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
                  sendTx: async (
                    chainId: string,
                    tx: Uint8Array,
                    mode: BroadcastMode
                  ): Promise<Uint8Array> => {
                    const requester = new InExtensionMessageRequester();

                    return await requester.sendMessage(
                      BACKGROUND_PORT,
                      new SendTxMsg(chainId, tx, mode, true)
                    );
                  },
                },
                {
                  onFulfill: (tx: any) => {
                    // Tx가 성공한 이후에 rewards가 다시 쿼리되면서 여기서 빠지는게 의도인데...
                    // 쿼리하는 동안 시간차가 있기 때문에 훼이크로 그냥 1초 더 기다린다.
                    setTimeout(() => {
                      state.setIsLoading(false);
                    }, 1000);

                    if (tx.code) {
                      state.setFailedReason(new Error(tx["raw_log"]));
                    }
                  },
                }
              );
            } catch (e) {
              if (isSimpleFetchError(e) && e.response) {
                const response = e.response;
                if (
                  response.status === 400 &&
                  response.data?.message &&
                  typeof response.data.message === "string" &&
                  response.data.message.includes("invalid empty tx")
                ) {
                  state.setFailedReason(
                    new Error("cosmos-sdk 버전이 오래되서 지원되지 않음")
                  );
                  return;
                }
              }

              state.setFailedReason(e);
              console.log(e);
              return;
            }
          } else {
            state.setFailedReason(
              new Error("Can't pay for fee by stake currency")
            );
            return;
          }
        })();
      }
    };

    const claimAllDisabled = (() => {
      if (viewTokens.length === 0) {
        return true;
      }

      for (const viewToken of viewTokens) {
        if (viewToken.token.toDec().gt(new Dec(0))) {
          return false;
        }
      }

      return true;
    })();

    return (
      <Styles.Container>
        <Box paddingX="1rem">
          <Columns sum={1} alignY="center">
            <Stack gutter="0.5rem">
              <YAxis alignX="left">
                <Skeleton layer={1} isNotReady={isNotReady}>
                  <Body2 style={{ color: ColorPalette["gray-300"] }}>
                    Pending Staking Reward
                  </Body2>
                </Skeleton>
              </YAxis>

              <YAxis alignX="left">
                <Skeleton
                  layer={1}
                  isNotReady={isNotReady}
                  dummyMinWidth="5.125rem"
                >
                  <Subtitle2 style={{ color: ColorPalette["gray-10"] }}>
                    {totalPrice ? totalPrice.separator(" ").toString() : "?"}
                  </Subtitle2>
                </Skeleton>
              </YAxis>
            </Stack>

            <Column weight={1} />

            <Skeleton type="button" layer={1} isNotReady={isNotReady}>
              <Button
                text="Claim All"
                size="small"
                disabled={claimAllDisabled}
                onClick={claimAll}
              />
            </Skeleton>
          </Columns>
        </Box>

        <Styles.ExpandButton
          paddingX="0.125rem"
          alignX="center"
          viewTokenCount={viewTokens.length}
          onClick={() => {
            if (viewTokens.length > 0) {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {!isExpanded ? (
            <ArrowDownIcon
              width="1.25rem"
              height="1.25rem"
              color={ColorPalette["gray-300"]}
            />
          ) : (
            <ArrowUpIcon
              width="1.25rem"
              height="1.25rem"
              color={ColorPalette["gray-300"]}
            />
          )}
        </Styles.ExpandButton>

        <VerticalCollapseTransition
          collapsed={!isExpanded}
          onTransitionEnd={() => {
            if (!isExpanded) {
              // Clear errors when collapsed.
              for (const state of statesRef.current.values()) {
                state.setFailedReason(undefined);
              }
            }
          }}
        >
          {viewTokens.map((viewToken) => {
            return (
              <ClaimTokenItem
                key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                viewToken={viewToken}
                state={getClaimAllEachState(viewToken.chainInfo.chainId)}
              />
            );
          })}
        </VerticalCollapseTransition>
      </Styles.Container>
    );
  }
);

const ClaimTokenItem: FunctionComponent<{
  viewToken: ViewToken;
  state: ClaimAllEachState;
}> = observer(({ viewToken, state }) => {
  const { accountStore, queriesStore } = useStore();

  const navigate = useNavigate();
  const notification = useNotification();

  // TODO: Add below property to config.ui.ts
  const defaultGasPerDelegation = 140000;

  const claim = async () => {
    if (state.failedReason) {
      state.setFailedReason(undefined);
      return;
    }
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

    try {
      await tx.send(
        {
          gas: gas.toString(),
          amount: [],
        },
        "",
        {},
        {
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              const log = tx.log ?? tx.raw_log;
              notification.show("failed", "Transaction Failed", log);
              return;
            }
            notification.show("success", "Transaction Success", "");
          },
        }
      );

      navigate("/", {
        replace: true,
      });
    } catch (e) {
      if (e?.message === "Request rejected") {
        return;
      }

      console.log(e);
      notification.show(
        "failed",
        "Transaction Failed",
        e.message || e.toString()
      );
      navigate("/", {
        replace: true,
      });
    }
  };

  const isLoading =
    accountStore.getAccount(viewToken.chainInfo.chainId).isSendingMsg ===
      "withdrawRewards" || state.isLoading;

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
              {viewToken.token
                .maxDecimals(6)
                .shrink(true)
                .inequalitySymbol(true)
                .hideDenom(true)
                .toString()}
            </Subtitle2>
          </Stack>
        </Column>

        <Tooltip
          enabled={!!state.failedReason}
          content={
            state.failedReason?.message || state.failedReason?.toString()
          }
        >
          <Button
            text="Claim"
            size="small"
            color="secondary"
            isLoading={isLoading}
            disabled={viewToken.token.toDec().lte(new Dec(0))}
            textOverrideIcon={
              state.failedReason ? (
                <WarningIcon
                  width="1rem"
                  height="1rem"
                  color={ColorPalette["gray-200"]}
                />
              ) : undefined
            }
            onClick={claim}
          />
        </Tooltip>
      </Columns>
    </Box>
  );
});
