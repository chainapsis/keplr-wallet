import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { TextInput } from "../../../../components/input";
import { useStore } from "../../../../stores";
import { Dropdown } from "../../../../components/dropdown";
import { Box } from "../../../../components/box";
import { autorun } from "mobx";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { AppCurrency } from "@keplr-wallet/types";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useInteractionInfo } from "../../../../hooks";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;
  `,
};

export const SettingTokenAddPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, tokensStore } = useStore();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramChainId = searchParams.get("chainId");
  const [inputContractAddress, setInputContractAddress] = useState(
    searchParams.get("contractAddress") || ""
  );

  const supportedChainInfos = useMemo(() => {
    return chainStore.chainInfos.filter((chainInfo) => {
      return (
        chainInfo.features?.includes("cosmwasm") ||
        chainInfo.features?.includes("secretwasm")
      );
    });
  }, [chainStore.chainInfos]);

  const [chainId, setChainId] = useState<string>(() => {
    if (paramChainId) {
      return paramChainId;
    }

    if (supportedChainInfos.length > 0) {
      return supportedChainInfos[0].chainId;
    } else {
      return chainStore.chainInfos[0].chainId;
    }
  });

  const interactionInfo = useInteractionInfo();

  useLayoutEffect(() => {
    if (interactionInfo.interaction) {
      if (tokensStore.waitingSuggestedToken) {
        setChainId(tokensStore.waitingSuggestedToken.data.chainId);
        setInputContractAddress(
          tokensStore.waitingSuggestedToken.data.contractAddress
        );
      }
    }
  }, [interactionInfo, tokensStore.waitingSuggestedToken]);

  useEffect(() => {
    // secret20은 계정에 귀속되기 때문에 추가/삭제 등을 할때 먼저 초기화가 되어있어야만 가능하다.
    // 이를 보장하기 위해서 이 로직이 추가됨...
    const disposal = autorun(() => {
      const account = accountStore.getAccount(chainId);
      if (account.bech32Address === "") {
        account.init();
      }
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [accountStore, chainId]);

  const isSecretWasm = chainStore.getChain(chainId).hasFeature("secretwasm");

  const items = supportedChainInfos.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  const contractAddress = inputContractAddress.trim();
  const queryContract = (() => {
    if (isSecretWasm) {
      return queriesStore
        .get(chainId)
        .secret.querySecret20ContractInfo.getQueryContract(contractAddress);
    } else {
      return queriesStore
        .get(chainId)
        .cosmwasm.querycw20ContractInfo.getQueryContract(contractAddress);
    }
  })();

  return (
    <HeaderLayout
      title="Add Token Manually"
      left={<BackButton />}
      bottomButton={{
        text: "Confirm",
        color: "secondary",
        size: "large",
        disabled: contractAddress.length === 0 || !queryContract.tokenInfo,
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        if (queryContract.tokenInfo) {
          const currency: AppCurrency = (() => {
            if (isSecretWasm) {
              throw new Error("TODO");
            } else {
              return {
                type: "cw20",
                contractAddress: contractAddress,
                coinMinimalDenom: queryContract.tokenInfo.name,
                coinDenom: queryContract.tokenInfo.symbol,
                coinDecimals: queryContract.tokenInfo.decimals,
              };
            }
          })();

          if (
            interactionInfo.interaction &&
            tokensStore.waitingSuggestedToken
          ) {
            await tokensStore.approveSuggestedTokenWithProceedNext(
              tokensStore.waitingSuggestedToken.id,
              currency,
              (proceedNext) => {
                if (!proceedNext) {
                  if (
                    interactionInfo.interaction &&
                    !interactionInfo.interactionInternal
                  ) {
                    window.close();
                  }
                }
              }
            );
          } else {
            await tokensStore.addToken(chainId, currency);

            navigate("/");
          }
        }
      }}
    >
      <Styles.Container gutter="1rem">
        {!interactionInfo.interaction ? (
          <Box width="13rem">
            <Dropdown
              items={items}
              selectedItemKey={chainId}
              onSelect={setChainId}
            />
          </Box>
        ) : null}

        <TextInput
          label="Contract Address"
          isLoading={queryContract.isFetching}
          value={inputContractAddress}
          readOnly={interactionInfo.interaction}
          onChange={(e) => {
            e.preventDefault();

            setInputContractAddress(e.target.value);
          }}
          error={(() => {
            if (contractAddress === "") {
              return;
            }

            try {
              const chainInfo = chainStore.getChain(chainId);
              Bech32Address.validate(
                contractAddress,
                chainInfo.bech32Config.bech32PrefixAccAddr
              );
              return (queryContract.error?.data as any)?.message;
            } catch (e) {
              return e.message || e.toString();
            }
          })()}
        />
        <TextInput
          label="Name"
          value={queryContract.tokenInfo?.name || "-"}
          disabled
        />
        <TextInput
          label="Symbol"
          value={queryContract.tokenInfo?.symbol || "-"}
          disabled
        />
        <TextInput
          label="Decimals"
          value={queryContract.tokenInfo?.decimals || "-"}
          disabled
        />
      </Styles.Container>
    </HeaderLayout>
  );
});
