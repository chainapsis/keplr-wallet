import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "../../../../layouts";
import { useHistory } from "react-router";
import { useIntl, FormattedMessage } from "react-intl";

import style from "./style.module.scss";
import { Button, Form } from "reactstrap";
import { Input } from "../../../../components/form";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import useForm from "react-hook-form";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { CW20Currency, Secret20Currency } from "@keplr-wallet/types";
import { useInteractionInfo } from "@keplr-wallet/hooks";
import { useLoadingIndicator } from "../../../../components/loading-indicator";
import { useNotification } from "../../../../components/notification";

interface FormData {
  contractAddress: string;
  // For the secret20
  viewingKey: string;
}

export const AddTokenPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();

  const { chainStore, queriesStore, accountStore, tokensStore } = useStore();
  const tokensOf = tokensStore.getTokensOf(chainStore.current.chainId);

  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  const interactionInfo = useInteractionInfo(() => {
    // When creating the secret20 viewing key, this page will be moved to "/sign" page to generate the signature.
    // So, if it is creating phase, don't reject the waiting datas.
    if (accountInfo.isSendingMsg !== "createSecret20ViewingKey") {
      tokensStore.rejectAllSuggestedTokens();
    }
  });

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: "",
      viewingKey: "",
    },
  });

  const contractAddress = form.watch("contractAddress");

  useEffect(() => {
    if (tokensStore.waitingSuggestedToken) {
      chainStore.selectChain(tokensStore.waitingSuggestedToken.data.chainId);
      if (
        contractAddress !==
        tokensStore.waitingSuggestedToken.data.contractAddress
      ) {
        form.setValue(
          "contractAddress",
          tokensStore.waitingSuggestedToken.data.contractAddress
        );
      }
    }
  }, [chainStore, contractAddress, form, tokensStore.waitingSuggestedToken]);

  const queries = queriesStore.get(chainStore.current.chainId);
  const queryContractInfo = queries.secret.querySecret20ContractInfo.getQueryContract(
    contractAddress
  );

  const tokenInfo = queryContractInfo.tokenInfo;

  const isSecret20 =
    (chainStore.current.features ?? []).find(
      (feature) => feature === "secretwasm"
    ) != null;

  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] = useState(
    false
  );

  const notification = useNotification();
  const loadingIndicator = useLoadingIndicator();

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      accountInfo.secret
        .createSecret20ViewingKey(
          contractAddress,
          "",
          {},
          {},
          (_, viewingKey) => {
            loadingIndicator.setIsLoading("create-veiwing-key", false);

            resolve(viewingKey);
          }
        )
        .then(() => {
          loadingIndicator.setIsLoading("create-veiwing-key", true);
        })
        .catch(reject);
    });
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.token.add",
      })}
      onBackButton={
        interactionInfo.interaction
          ? undefined
          : () => {
              history.goBack();
            }
      }
    >
      <Form
        className={style.container}
        onSubmit={form.handleSubmit(async (data) => {
          if (
            tokenInfo?.decimals != null &&
            tokenInfo.name &&
            tokenInfo.symbol
          ) {
            if (!isSecret20) {
              const currency: CW20Currency = {
                type: "cw20",
                contractAddress: data.contractAddress,
                coinMinimalDenom: tokenInfo.name,
                coinDenom: tokenInfo.symbol,
                coinDecimals: tokenInfo.decimals,
              };

              if (
                interactionInfo.interaction &&
                tokensStore.waitingSuggestedToken
              ) {
                await tokensStore.approveSuggestedToken(currency);
              } else {
                await tokensOf.addToken(currency);
              }
            } else {
              let viewingKey = data.viewingKey;
              if (!viewingKey && !isOpenSecret20ViewingKey) {
                try {
                  viewingKey = await createViewingKey();
                } catch (e) {
                  notification.push({
                    placement: "top-center",
                    type: "danger",
                    duration: 2,
                    content: `Failed to create the viewing key: ${e.message}`,
                    canDelete: true,
                    transition: {
                      duration: 0.25,
                    },
                  });

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
                    history.push({
                      pathname: "/",
                    });
                  }

                  return;
                }
              }

              if (!viewingKey) {
                notification.push({
                  placement: "top-center",
                  type: "danger",
                  duration: 2,
                  content: "Failed to create the viewing key",
                  canDelete: true,
                  transition: {
                    duration: 0.25,
                  },
                });
              } else {
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
                  await tokensStore.approveSuggestedToken(currency);
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
              history.push({
                pathname: "/",
              });
            }
          }
        })}
      >
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.contract-address",
          })}
          name="contractAddress"
          autoComplete="off"
          readOnly={tokensStore.waitingSuggestedToken != null}
          ref={form.register({
            required: "Contract address is required",
            validate: (value: string): string | undefined => {
              try {
                Bech32Address.validate(
                  value,
                  chainStore.current.bech32Config.bech32PrefixAccAddr
                );
              } catch {
                return "Invalid address";
              }
            },
          })}
          error={
            form.errors.contractAddress
              ? form.errors.contractAddress.message
              : tokenInfo == null
              ? (queryContractInfo.error?.data as any)?.error ||
                queryContractInfo.error?.message
              : undefined
          }
          text={
            queryContractInfo.isFetching ? (
              <i className="fas fa-spinner fa-spin" />
            ) : undefined
          }
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.name",
          })}
          value={tokenInfo?.name ?? "-"}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.symbol",
          })}
          value={tokenInfo?.symbol ?? "-"}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.decimals",
          })}
          value={tokenInfo?.decimals ?? "-"}
          readOnly={true}
        />
        {isSecret20 && isOpenSecret20ViewingKey ? (
          <Input
            type="text"
            label={intl.formatMessage({
              id: "setting.token.add.secret20.viewing-key",
            })}
            name="viewingKey"
            autoComplete="off"
            ref={form.register({
              required: "Viewing key is required",
            })}
            error={
              form.errors.viewingKey
                ? form.errors.viewingKey.message
                : undefined
            }
          />
        ) : null}
        <div style={{ flex: 1 }} />
        <div className="custom-control custom-checkbox mb-2">
          <input
            className="custom-control-input"
            id="viewing-key-checkbox"
            type="checkbox"
            checked={isOpenSecret20ViewingKey}
            onChange={() => {
              setIsOpenSecret20ViewingKey((value) => !value);
            }}
          />
          <label
            className="custom-control-label"
            htmlFor="viewing-key-checkbox"
            style={{ color: "#666666", paddingTop: "1px" }}
          >
            <FormattedMessage id="setting.token.add.secret20.checkbox.import-viewing-key" />
          </label>
        </div>
        <Button
          type="submit"
          color="primary"
          disabled={tokenInfo == null || !accountInfo.isReadyToSendMsgs}
          data-loading={accountInfo.isSendingMsg === "createSecret20ViewingKey"}
        >
          <FormattedMessage id="setting.token.add.button.submit" />
        </Button>
      </Form>
    </HeaderLayout>
  );
});
