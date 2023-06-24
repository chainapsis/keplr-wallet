import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
import { AppCurrency, Permission, Permit } from "@keplr-wallet/types";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { useInteractionInfo } from "../../../../hooks";
import { ColorPalette } from "../../../../styles";
import { Column, Columns } from "../../../../components/column";
import { Body3, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { Toggle } from "../../../../components/toggle";
import { useForm } from "react-hook-form";
import { useNotification } from "../../../../hooks/notification";
import {
  PermitQueryAuthorization,
  QueryAuthorization,
  ViewingKeyAuthorization,
} from "@keplr-wallet/background/build/secret-wasm/query-authorization";
import { Skeleton } from "../../../../components/skeleton";
import { Button } from "../../../../components/button";
import { Buffer } from "buffer";
import { IObservableQueryBalanceImpl } from "@keplr-wallet/stores";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;
  `,
};

interface FormData {
  contractAddress: string;
  // For the secret20
  viewingKey: string;
}

export const SettingTokenAddPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, tokensStore } = useStore();

  const navigate = useNavigate();
  const notification = useNotification();
  const [searchParams] = useSearchParams();
  const paramChainId = searchParams.get("chainId");

  const { setValue, handleSubmit, register, formState, watch } =
    useForm<FormData>({
      defaultValues: {
        contractAddress: searchParams.get("contractAddress") || "",
        viewingKey: "",
      },
    });

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

  // secret20은 서명 페이지로 넘어가야하기 때문에 막아야함...
  const blockRejectAll = useRef(false);
  const interactionInfo = useInteractionInfo(() => {
    if (!blockRejectAll.current) {
      tokensStore.rejectAllSuggestedTokens();
    }
  });

  useLayoutEffect(() => {
    if (interactionInfo.interaction) {
      if (tokensStore.waitingSuggestedToken) {
        setChainId(tokensStore.waitingSuggestedToken.data.chainId);
        setValue(
          "contractAddress",
          tokensStore.waitingSuggestedToken.data.contractAddress
        );
        setValue(
          "viewingKey",
          tokensStore.waitingSuggestedToken.data.queryAuthorization?.toString() ??
            ""
        );
        setUseSecret20Permit(
          tokensStore.waitingSuggestedToken.data
            .suggestedQueryAuthorizationType === "permit"
        );
      }
    }
  }, [interactionInfo, setValue, tokensStore.waitingSuggestedToken]);

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
  const [useSecret20Permit, setUseSecret20Permit] = useState(
    !(searchParams.get("suggestedQueryAuthorizationType") === "viewing_key")
  );
  const [secret20PermitPermissions, onChangeSecret20PermitPermissions] =
    useState("allowance, balance, history");
  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] =
    useState(false);
  const [secret20TestPermitQuery, setSecret20TestPermitQuery] = useState<
    IObservableQueryBalanceImpl | undefined
  >(undefined);

  const items = supportedChainInfos.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  const contractAddress = watch("contractAddress").trim();
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

  useEffect(() => {
    if (isSecretWasm && queryContract.tokenInfo) {
      const getBalance = queriesStore
        .get(chainId)
        .secret.querySecret20ContractBalance(
          accountStore.getAccount(chainId).bech32Address,
          {
            type: "secret20",
            contractAddress,
            queryAuthorizationStr: new PermitQueryAuthorization({
              params: {
                permit_name: "fake",
                allowed_tokens: ["fake"],
                chain_id: "fake",
                permissions: [],
              },
              signature: {
                pub_key: {
                  type: "fake",
                  value: "fake",
                },
                signature: "fake",
              },
            }).toString(),
            coinMinimalDenom: `secret20:${contractAddress}:${queryContract.tokenInfo.name}`,
            coinDenom: queryContract.tokenInfo.symbol,
            coinDecimals: queryContract.tokenInfo.decimals,
          }
        );
      setSecret20TestPermitQuery(getBalance);
    }
  }, [
    accountStore,
    chainId,
    contractAddress,
    isSecretWasm,
    queriesStore,
    queryContract.tokenInfo,
  ]);

  const isSecret20PermitSupported = useMemo(() => {
    const supported = !(
      secret20TestPermitQuery?.error?.message?.includes("parse_err") === true
    );
    if (!supported) {
      setUseSecret20Permit(false);
    }
    return supported;
  }, [secret20TestPermitQuery?.error]);

  const permitButtonLabel = useMemo(() => {
    if (isSecret20PermitSupported) {
      return "Permit";
    } else {
      return "Permit (Unsupported)";
    }
  }, [isSecret20PermitSupported]);

  const createPermit = async (permissions: Permission[]): Promise<Permit> => {
    const random = new Uint8Array(32);
    crypto.getRandomValues(random);
    const permitName = Buffer.from(random).toString("hex");
    return new Promise((resolve, reject) => {
      const account = accountStore.getAccount(chainId);
      account.secret
        .createSecret20Permit(
          account.bech32Address,
          chainId,
          permitName,
          [contractAddress],
          permissions,
          (permit) => {
            if (!permit) {
              reject(new Error("Permit is null"));
              return;
            }
            resolve(permit);
          }
        )
        .catch(reject);
    });
  };

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      accountStore
        .getAccount(chainId)
        .secret.createSecret20ViewingKey(
          contractAddress,
          "",
          {},
          {},
          (tx, viewingKey) => {
            if (tx.code != null && tx.code !== 0) {
              reject(new Error(tx.raw_log));
              return;
            }

            if (!viewingKey) {
              reject(new Error("Viewing key is null"));
              return;
            }
            resolve(viewingKey);
          }
        )
        .catch(reject);
    });
  };

  return (
    <HeaderLayout
      title="Add Token Manually"
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButton={{
        text: "Confirm",
        color: "secondary",
        size: "large",
        disabled:
          contractAddress.length === 0 ||
          !queryContract.tokenInfo ||
          (isSecretWasm && !accountStore.getAccount(chainId).isReadyToSendTx),
      }}
      onSubmit={handleSubmit(async (data) => {
        if (queryContract.tokenInfo) {
          let currency: AppCurrency;

          if (isSecretWasm) {
            let queryAuthorization: QueryAuthorization;

            if (!isOpenSecret20ViewingKey) {
              blockRejectAll.current = true;
              if (useSecret20Permit) {
                try {
                  queryAuthorization = new PermitQueryAuthorization(
                    await createPermit(
                      secret20PermitPermissions
                        // remove leading or trailing commas or whitespace
                        .replace(RegExp(/(^[,\s]+)|([,\s]+$)/g), "")
                        // split at commas or whitespace
                        .split(RegExp("[ ,]+"))
                        .map((p) => p as Permission)
                    )
                  );
                } catch (e) {
                  notification.show(
                    "failed",
                    "Failed to create the permit",
                    e.message || e.toString()
                  );

                  await new Promise((resolve) => setTimeout(resolve, 2000));

                  window.close();
                  return;
                }
              } else {
                try {
                  queryAuthorization = new ViewingKeyAuthorization(
                    await createViewingKey()
                  );
                } catch (e) {
                  notification.show(
                    "failed",
                    "Failed to create the viewing key",
                    e.message || e.toString()
                  );

                  await new Promise((resolve) => setTimeout(resolve, 2000));

                  window.close();
                  return;
                }
              }
            } else {
              queryAuthorization = new ViewingKeyAuthorization(data.viewingKey);
            }
            currency = {
              type: "secret20",
              contractAddress,
              queryAuthorizationStr: queryAuthorization.toString(),
              coinMinimalDenom: queryContract.tokenInfo.name,
              coinDenom: queryContract.tokenInfo.symbol,
              coinDecimals: queryContract.tokenInfo.decimals,
            };
          } else {
            currency = {
              type: "cw20",
              contractAddress: contractAddress,
              coinMinimalDenom: queryContract.tokenInfo.name,
              coinDenom: queryContract.tokenInfo.symbol,
              coinDecimals: queryContract.tokenInfo.decimals,
            };
          }

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

                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal &&
                  isSecretWasm
                ) {
                  // TODO: secret20의 경우는 서명 페이지로 페이지 자체가 넘어가기 때문에 proceedNext를 처리할 수가 없다.
                  //       나중에 뭔가 해결법이 생기면 다시 생각해본다...
                  window.close();
                }
              }
            );
          } else {
            await tokensStore.addToken(chainId, currency);

            navigate("/");
          }
        }
      })}
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
          readOnly={interactionInfo.interaction}
          error={
            formState.errors.contractAddress?.message ||
            (queryContract.error?.data as any)?.message
          }
          {...register("contractAddress", {
            required: true,
            validate: (value): string | undefined => {
              try {
                const chainInfo = chainStore.getChain(chainId);
                Bech32Address.validate(
                  value,
                  chainInfo.bech32Config.bech32PrefixAccAddr
                );
              } catch (e) {
                return e.message || e.toString();
              }
            },
          })}
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

        {isSecretWasm ? (
          <Stack gutter="0.75rem">
            <Subtitle3 color={ColorPalette["gray-50"]}>
              Query Authorization Type
            </Subtitle3>
            <Box>
              <Columns sum={1} gutter="0.625rem">
                <Column weight={1}>
                  <Skeleton type="button">
                    <Button
                      text={permitButtonLabel}
                      color={useSecret20Permit ? "primary" : "secondary"}
                      disabled={!isSecret20PermitSupported}
                      onClick={() => {
                        setUseSecret20Permit(true);
                        setIsOpenSecret20ViewingKey(false);
                      }}
                    />
                  </Skeleton>
                </Column>

                <Column weight={1}>
                  <Skeleton type="button">
                    <Button
                      text="Viewing Key"
                      color={!useSecret20Permit ? "primary" : "secondary"}
                      onClick={() => setUseSecret20Permit(false)}
                    />
                  </Skeleton>
                </Column>
              </Columns>
            </Box>
            {useSecret20Permit ? (
              <TextInput
                label="Permit Permissions"
                placeholder="e.g. allowance, balance, history"
                onChange={(e) => {
                  e.preventDefault();

                  onChangeSecret20PermitPermissions(e.target.value);
                }}
                value={secret20PermitPermissions}
              />
            ) : (
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
            )}

            {isOpenSecret20ViewingKey ? (
              <TextInput
                label="Viewing Key"
                error={
                  formState.errors.viewingKey
                    ? formState.errors.viewingKey.message
                    : undefined
                }
                {...register("viewingKey", {
                  required: true,
                })}
              />
            ) : null}
          </Stack>
        ) : null}
      </Styles.Container>
    </HeaderLayout>
  );
});
