import React, { FunctionComponent, useState } from "react";
import { SignStarknetTxInteractionStore } from "@keplr-wallet/stores-core";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { useIntl } from "react-intl";
import { FeeControl } from "../../components/input/fee-control";
import {
  useFeeConfig,
  useGasConfig,
  useGasSimulator,
  useNoopAmountConfig,
  useSenderConfig,
} from "@keplr-wallet/hooks-starknet";
import { MemoryKVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { num, InvocationsSignerDetails } from "starknet";

export const SignStarknetTxView: FunctionComponent<{
  interactionData: NonNullable<SignStarknetTxInteractionStore["waitingData"]>;
}> = observer(({ interactionData }) => {
  const {
    signStarknetTxInteractionStore,
    starknetAccountStore,
    starknetQueriesStore,
  } = useStore();

  const { chainStore } = useStore();

  const intl = useIntl();
  const interactionInfo = useInteractionInfo();

  const chainId = interactionData.data.chainId;

  const modularChainInfo = chainStore.getModularChain(chainId);
  if (!("starknet" in modularChainInfo)) {
    throw new Error(`${modularChainInfo.chainId} is not starknet chain`);
  }
  const starknet = modularChainInfo.starknet;

  const senderConfig = useSenderConfig(
    chainStore,
    chainId,
    interactionData.data.signer
  );
  const amountConfig = useNoopAmountConfig(chainStore, chainId, senderConfig);
  const gasConfig = useGasConfig(
    chainStore,
    chainId,
    (() => {
      if ("resourceBounds" in interactionData.data.details) {
        return parseInt(
          interactionData.data.details.resourceBounds.l1_gas.max_amount
        );
      }
    })()
  );
  const feeConfig = useFeeConfig(
    chainStore,
    starknetQueriesStore,
    chainId,
    senderConfig,
    amountConfig,
    gasConfig
  );

  const gasSimulator = useGasSimulator(
    new MemoryKVStore("starknet.sign"),
    chainStore,
    chainId,
    gasConfig,
    feeConfig,
    // fee type이 바뀔때마다 refresh 시켜야한다...
    feeConfig.type,
    () => {
      if (!amountConfig.currency) {
        throw new Error("Send currency not set");
      }

      // Prefer not to use the gas config or fee config,
      // because gas simulator can change the gas config and fee config from the result of reaction,
      // and it can make repeated reaction.
      if (
        amountConfig.uiProperties.loadingState === "loading-block" ||
        amountConfig.uiProperties.error != null
      ) {
        throw new Error("Not ready to simulate tx");
      }

      // observed되어야 하므로 꼭 여기서 참조 해야함.
      const type = feeConfig.type;
      const feeContractAddress =
        type === "ETH"
          ? starknet.ethContractAddress
          : starknet.strkContractAddress;
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("starknet")
        .find((cur) => cur.coinMinimalDenom === `erc20:${feeContractAddress}`);
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      const sender = senderConfig.sender;

      return {
        simulate: async (): Promise<{
          gasUsed: number;
        }> => {
          const res = await starknetAccountStore
            .getAccount(chainId)
            .estimateInvokeFee(
              sender,
              interactionData.data.transactions,
              type === "ETH" ? "0x2" : "0x3"
            );

          const fee = new CoinPretty(feeCurrency, res.overall_fee);
          const maxFee = new CoinPretty(feeCurrency, res.suggestedMaxFee);
          feeConfig.setFee({
            fee,
            maxFee,
          });

          return {
            gasUsed: parseInt(res.gas_consumed.toString()),
          };
        },
      };
    }
  );

  const [unmountPromise] = useState(() => {
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    return {
      promise,
      resolver: resolver!,
    };
  });

  useUnmount(() => {
    unmountPromise.resolver();
  });

  const approve = async () => {
    try {
      const type = feeConfig.type;
      const feeContractAddress =
        type === "ETH"
          ? starknet.ethContractAddress
          : starknet.strkContractAddress;
      const feeCurrency = chainStore
        .getModularChainInfoImpl(chainId)
        .getCurrencies("starknet")
        .find((cur) => cur.coinMinimalDenom === `erc20:${feeContractAddress}`);
      if (!feeCurrency) {
        throw new Error("Can't find fee currency");
      }

      const details: InvocationsSignerDetails = (() => {
        if (type === "ETH") {
          return {
            version: "0x2",
            walletAddress: interactionData.data.details.walletAddress,
            nonce: interactionData.data.details.nonce,
            chainId: interactionData.data.details.chainId,
            cairoVersion: interactionData.data.details.cairoVersion,
            skipValidate: false,

            maxFee: feeConfig.maxFee
              ? num.toHex(feeConfig.maxFee.toCoin().amount)
              : "0x0",
          };
        } else {
          return {
            version: "0x3",
            walletAddress: interactionData.data.details.walletAddress,
            nonce: interactionData.data.details.nonce,
            chainId: interactionData.data.details.chainId,
            cairoVersion: interactionData.data.details.cairoVersion,
            skipValidate: false,

            resourceBounds: {
              l1_gas: {
                max_amount: num.toHex(gasConfig.gas.toString()),
                max_price_per_unit: (() => {
                  if (!feeConfig.maxFee) {
                    return "0x0";
                  }

                  return num.toHex(
                    new Dec(feeConfig.maxFee.toCoin().amount)
                      .quo(new Dec(gasConfig.gas))
                      .truncate()
                      .toString()
                  );
                })(),
              },
              l2_gas: {
                max_amount: "0x0",
                max_price_per_unit: "0x0",
              },
            },
            tip: "0x0",
            paymasterData: ["0x0"],
            accountDeploymentData: ["0x0"],
            nonceDataAvailabilityMode: "L1",
            feeDataAvailabilityMode: "L1",
          };
        }
      })();

      await signStarknetTxInteractionStore.approveWithProceedNext(
        interactionData.id,
        interactionData.data.transactions,
        details,
        async (proceedNext) => {
          if (!proceedNext) {
            if (
              interactionInfo.interaction &&
              !interactionInfo.interactionInternal
            ) {
              handleExternalInteractionWithNoProceedNext();
            }
          }

          if (
            interactionInfo.interaction &&
            interactionInfo.interactionInternal
          ) {
            // XXX: 약간 난해한 부분인데
            //      내부의 tx의 경우에는 tx 이후의 routing을 요청한 쪽에서 처리한다.
            //      하지만 tx를 처리할때 tx broadcast 등의 과정이 있고
            //      서명 페이지에서는 이러한 과정이 끝났는지 아닌지를 파악하기 힘들다.
            //      만약에 밑과같은 처리를 하지 않으면 interaction data가 먼저 지워지면서
            //      화면이 깜빡거리는 문제가 발생한다.
            //      이 문제를 해결하기 위해서 내부의 tx는 보내는 쪽에서 routing을 잘 처리한다고 가정하고
            //      페이지를 벗어나고 나서야 data를 지우도록한다.
            await unmountPromise.promise;
          }
        },
        {
          // XXX: 단지 special button의 애니메이션을 보여주기 위해서 delay를 넣음...ㅋ;
          preDelay: 200,
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.sign.cosmos.tx.title" })}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      // 유저가 enter를 눌러서 우발적으로(?) approve를 누르지 않도록 onSubmit을 의도적으로 사용하지 않았음.
      bottomButton={{
        isSpecial: true,
        text: intl.formatMessage({ id: "button.approve" }),
        size: "large",
        // TODO
        // disabled: buttonDisabled,
        isLoading: signStarknetTxInteractionStore.isObsoleteInteraction(
          interactionData.id
        ),
        onClick: approve,
      }}
    >
      <div>TODO</div>
      <FeeControl
        senderConfig={senderConfig}
        feeConfig={feeConfig}
        gasConfig={gasConfig}
        gasSimulator={gasSimulator}
      />
    </HeaderLayout>
  );
});
