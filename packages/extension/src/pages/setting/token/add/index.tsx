import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { TextInput } from "../../../../components/input";
import { useStore } from "../../../../stores";
import { Box } from "../../../../components/box";
import { useForm } from "react-hook-form";
import { CW20Currency, Secret20Currency } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ColorPalette } from "../../../../styles";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { Column, Columns } from "../../../../components/column";
import { Body3, Subtitle2 } from "../../../../components/typography";
import { Toggle } from "../../../../components/toggle";
import { useInteractionInfo } from "../../../../hooks";
import { Dropdown } from "../../../../components/dropdown";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;

    margin-bottom: 4.75rem;
  `,
};

interface FormData {
  contractAddress: string;
  viewingKey: string;
}

export const SettingTokenAddPage: FunctionComponent = observer(() => {
  const { accountStore, chainStore, tokensStore, queriesStore } = useStore();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [chainId, setChainId] = useState<string>(
    searchParams.get("chainId") ?? chainStore.chainInfos[0].chainId
  );

  const chainInfo = chainStore.chainInfos.find(
    (chainInfo) => chainInfo.chainId === chainId
  );

  const isSecret20 =
    chainInfo?.features && chainInfo.features.includes("secretwasm");

  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const tokensOf = tokensStore.getTokensOf(chainId);
  const accountInfo = accountStore.getAccount(chainId);

  const interactionInfo = useInteractionInfo(() => {
    // When creating the secret20 viewing key, this page will be moved to "/sign" page to generate the signature.
    // So, if it is creating phase, don't reject the waiting datas.
    if (accountInfo.isSendingMsg !== "createSecret20ViewingKey") {
      tokensStore.rejectAllSuggestedTokens();
    }
  });

  const items = chainStore.chainInfosInUI.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      contractAddress: "",
      viewingKey: "",
    },
  });

  const contractAddress = watch("contractAddress");

  useEffect(() => {
    if (tokensStore.waitingSuggestedToken) {
      if (
        contractAddress !==
        tokensStore.waitingSuggestedToken.data.contractAddress
      ) {
        setValue(
          "contractAddress",
          tokensStore.waitingSuggestedToken.data.contractAddress
        );
      }
    }
  }, [contractAddress, tokensStore.waitingSuggestedToken, setValue]);

  const queries = queriesStore.get(chainId);
  const query = isSecret20
    ? queries.secret.querySecret20ContractInfo
    : queries.cosmwasm.querycw20ContractInfo;
  const queryContractInfo = query.getQueryContract(contractAddress);

  const tokenInfo = queryContractInfo.tokenInfo;

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      accountInfo.secret
        .createSecret20ViewingKey(
          contractAddress,
          "",
          {},
          {},
          (_, viewingKey) => {
            setIsLoading(false);

            resolve(viewingKey);
          }
        )
        .then(() => {
          setIsLoading(true);
        })
        .catch(reject);
    });
  };

  return (
    <HeaderLayout
      title="Add Token Manually"
      left={<BackButton />}
      bottomButton={{
        text: "Confirm",
        color: "secondary",
        size: "large",
        isLoading,
        disabled: tokenInfo == null || !accountInfo.isReadyToSendMsgs,
      }}
      onSubmit={handleSubmit(async (data) => {
        if (tokenInfo?.decimals != null && tokenInfo.name && tokenInfo.symbol) {
          if (!isSecret20) {
            const currency: CW20Currency = {
              type: "cw20",
              contractAddress: data.contractAddress,
              coinMinimalDenom: tokenInfo.name,
              coinDenom: tokenInfo.symbol,
              coinDecimals: tokenInfo.decimals,
            };

            if (tokensStore.waitingSuggestedToken) {
              // await tokensStore.approveSuggestedToken(currency);
            } else {
              await tokensOf.addToken(currency);
            }

            navigate(-1);
          } else {
            let viewingKey = data.viewingKey;

            if (!viewingKey && !isOpenSecret20ViewingKey) {
              try {
                viewingKey = await createViewingKey();
              } catch (e) {
                if (
                  interactionInfo.interaction &&
                  tokensStore.waitingSuggestedToken
                ) {
                  await tokensStore.rejectAllSuggestedTokens();
                }

                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  window.close();
                } else {
                  navigate(-1);
                }

                return;
              }
            }
            if (viewingKey) {
              const currency: Secret20Currency = {
                type: "secret20",
                contractAddress: data.contractAddress,
                viewingKey,
                coinMinimalDenom: tokenInfo.name,
                coinDenom: tokenInfo.symbol,
                coinDecimals: tokenInfo.decimals,
              };

              if (
                interactionInfo.interaction &&
                tokensStore.waitingSuggestedToken
              ) {
                // await tokensStore.approveSuggestedToken(currency);
              } else {
                await tokensOf.addToken(currency);
              }
            }
          }

          if (
            interactionInfo.interaction &&
            !interactionInfo.interactionInternal
          ) {
            window.close();
          } else {
            navigate(-1);
          }
        }
      })}
    >
      <Styles.Container gutter="1rem">
        <Box width="13rem">
          <Dropdown
            items={items}
            selectedItemKey={chainId}
            onSelect={setChainId}
          />
        </Box>

        <TextInput
          label="Contract Address"
          error={
            errors.contractAddress
              ? errors.contractAddress.message
              : tokenInfo == null
              ? (queryContractInfo.error?.data as any)?.error ||
                queryContractInfo.error?.message
              : undefined
          }
          {...register("contractAddress", {
            required: "Contract address is required",
            validate: (value: string): string | undefined => {
              try {
                Bech32Address.validate(
                  value,
                  chainInfo?.bech32Config.bech32PrefixAccAddr
                );
              } catch {
                return "Invalid address";
              }
            },
          })}
        />
        <TextInput label="Name" value={tokenInfo?.name ?? "-"} disabled />
        <TextInput label="Symbol" value={tokenInfo?.symbol ?? "-"} disabled />
        <TextInput
          label="Decimals"
          value={tokenInfo?.decimals ?? "-"}
          disabled
        />

        {isSecret20 ? (
          <Stack gutter="0.75rem">
            <Box
              backgroundColor={ColorPalette["gray-600"]}
              borderRadius="0.375rem"
              padding="1rem"
            >
              <Columns sum={1} alignY="center" gutter="0.25rem">
                <Column weight={1}>
                  <Stack>
                    <Subtitle2 color={ColorPalette["gray-50"]}>
                      I have my own viewing key
                    </Subtitle2>
                    <Body3 color={ColorPalette["gray-200"]}>
                      By enabling this toggle, you confirm that you have your
                      viewing key and use it for adding this token.
                    </Body3>
                  </Stack>
                </Column>

                <Toggle
                  isOpen={isOpenSecret20ViewingKey}
                  setIsOpen={setIsOpenSecret20ViewingKey}
                />
              </Columns>
            </Box>

            {isOpenSecret20ViewingKey ? (
              <TextInput
                label="Viewing Key"
                {...register("viewingKey", { required: true })}
              />
            ) : null}
          </Stack>
        ) : null}
      </Styles.Container>
    </HeaderLayout>
  );
});
