import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { TextInput } from "../../../../components/input";
import { useStore } from "../../../../stores";
import { DropDown } from "../../../../components/dropdown";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { useForm } from "react-hook-form";
import { CW20Currency } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { ColorPalette } from "../../../../styles";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;
  `,
  BottomButton: styled.div`
    padding: 0.75rem;

    height: 4.75rem;

    background-color: ${ColorPalette["gray-700"]};

    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
  `,
};

interface FormData {
  contractAddress: string;
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

  const tokensOf = tokensStore.getTokensOf(chainId);
  const accountInfo = accountStore.getAccount(chainId);

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
  const query = queries.cosmwasm.querycw20ContractInfo;
  const queryContractInfo = query.getQueryContract(contractAddress);

  const tokenInfo = queryContractInfo.tokenInfo;

  return (
    <HeaderLayout title="Add Token Manually" left={<BackButton />}>
      <form
        onSubmit={handleSubmit(async (data) => {
          if (
            tokenInfo?.decimals != null &&
            tokenInfo.name &&
            tokenInfo.symbol
          ) {
            const currency: CW20Currency = {
              type: "cw20",
              contractAddress: data.contractAddress,
              coinMinimalDenom: tokenInfo.name,
              coinDenom: tokenInfo.symbol,
              coinDecimals: tokenInfo.decimals,
            };

            if (tokensStore.waitingSuggestedToken) {
              await tokensStore.approveSuggestedToken(currency);
            } else {
              await tokensOf.addToken(currency);
            }

            navigate(-1);
          }
        })}
      >
        <Styles.Container gutter="1rem">
          <Box width="13rem">
            <DropDown
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
        </Styles.Container>

        <Styles.BottomButton>
          <Button
            text="Confirm"
            color="secondary"
            size="large"
            disabled={tokenInfo == null || !accountInfo.isReadyToSendMsgs}
          />
        </Styles.BottomButton>
      </form>
    </HeaderLayout>
  );
});
