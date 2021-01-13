import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "../../../../layouts/header-layout";
import { useHistory, useLocation } from "react-router";
import { useIntl, FormattedMessage } from "react-intl";

import style from "./style.module.scss";
import { Button, Form } from "reactstrap";
import { Input } from "../../../../../components/form";
import { useWasmTokenInfo } from "../../../../../hooks/use-wasm-token-info";
import { observer } from "mobx-react";
import { useStore } from "../../../../stores";
import useForm from "react-hook-form";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import {
  CW20Currency,
  Secret20Currency
} from "../../../../../../common/currency";
import { useCosmosJS } from "../../../../../hooks";
import { PopupWalletProvider } from "../../../../wallet-provider";
import { MsgExecuteContract as SecretMsgExecuteContract } from "../../../../../../common/secretjs/x/compute";
import bigInteger from "big-integer";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import { Int } from "@chainapsis/cosmosjs/common/int";
import Axios from "axios";
import { sendMessage } from "../../../../../../common/message/send";
import { BACKGROUND_PORT } from "../../../../../../common/message/constant";
import {
  ReqeustEncryptMsg,
  RequestDecryptMsg
} from "../../../../../../background/secret-wasm";
import { useLoadingIndicator } from "../../../../../components/loading-indicator";
import { useNotification } from "../../../../../components/notification";
import queryString from "query-string";
import { fitWindow } from "../../../../../../common/window";
import {
  ApproveSuggestedTokenMsg,
  RejectSuggestedTokenMsg
} from "../../../../../../background/tokens/messages";

const Buffer = require("buffer/").Buffer;

interface FormData {
  contractAddress: string;
  // For the secret20
  viewingKey: string;
}

export const AddTokenPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const intl = useIntl();

  const location = useLocation();
  const query = queryString.parse(location.search);
  const external = query.external ?? false;

  useEffect(() => {
    if (external) {
      fitWindow();
    }
  }, [external]);

  const { chainStore } = useStore();

  useEffect(() => {
    if (query.chainId && typeof query.chainId === "string") {
      chainStore.setChain(query.chainId);
    }
  }, [chainStore, query.chainId]);

  useEffect(() => {
    // Force reject when closing window.
    const beforeunload = async () => {
      if (external) {
        const msg = new RejectSuggestedTokenMsg(chainStore.chainInfo.chainId);
        await sendMessage(BACKGROUND_PORT, msg);
      }
    };

    addEventListener("beforeunload", beforeunload);
    return () => {
      removeEventListener("beforeunload", beforeunload);
    };
  }, [chainStore.chainInfo.chainId, external]);

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: (query.contractAddress as string) ?? "",
      viewingKey: query.viewingKey
        ? decodeURIComponent(query.viewingKey as string)
        : ""
    },
    mode: "onChange"
  });

  const contractAddress = form.watch("contractAddress");

  const isSecret20 =
    (chainStore.chainInfo.features ?? []).find(
      feature => feature === "secretwasm"
    ) != null;

  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] = useState(
    false
  );

  const tokenInfo = useWasmTokenInfo(
    chainStore.chainInfo.chainId,
    chainStore.chainInfo.rest,
    contractAddress,
    chainStore.chainInfo.restConfig,
    isSecret20
  );

  const notification = useNotification();
  const loadingIndicator = useLoadingIndicator();

  const [walletProvider] = useState(
    new PopupWalletProvider(
      {
        onRequestTxBuilderConfig: (id: string) => {
          history.push(`/fee/${id}`);
        }
      },
      {
        onRequestSignature: (id: string) => {
          history.push(`/sign/${id}`);
        },
        onSignatureApproved: () => {
          loadingIndicator.setIsLoading("create-veiwing-key", true);
          if (!external) {
            history.push("/");
          }
        }
      }
    )
  );
  const cosmosJS = useCosmosJS(chainStore.chainInfo, walletProvider);

  const createViewingKey = async (): Promise<string> => {
    if (cosmosJS.sendMsgs && cosmosJS.addresses.length > 0) {
      const random = new Uint8Array(15);
      crypto.getRandomValues(random);
      const entropy = Buffer.from(random).toString("hex");

      const msg = new SecretMsgExecuteContract(
        AccAddress.fromBech32(cosmosJS.addresses[0]),
        AccAddress.fromBech32(contractAddress),
        {
          // eslint-disable-next-line @typescript-eslint/camelcase
          create_viewing_key: { entropy }
        },
        "",
        []
      );

      const nonce = await msg.encrypt(
        Axios.create({
          ...{
            baseURL: chainStore.chainInfo.rest
          },
          ...chainStore.chainInfo.restConfig
        }),
        async (contractCodeHash, msg): Promise<Uint8Array> => {
          return Buffer.from(
            await sendMessage(
              BACKGROUND_PORT,
              new ReqeustEncryptMsg(
                chainStore.chainInfo.chainId,
                contractCodeHash,
                msg
              )
            ),
            "hex"
          );
        }
      );

      return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cosmosJS.sendMsgs!(
          [msg],
          {
            gas: bigInteger(150000),
            memo: "",
            fee: new Coin(
              chainStore.chainInfo.stakeCurrency.coinMinimalDenom,
              new Int("1000")
            )
          },
          async result => {
            if (result && result.mode === "commit") {
              try {
                const dataOutputCipher = result.deliverTx.data;
                const dataOutput = Buffer.from(
                  Buffer.from(
                    await sendMessage(
                      BACKGROUND_PORT,
                      new RequestDecryptMsg(
                        chainStore.chainInfo.chainId,
                        Buffer.from(dataOutputCipher).toString("hex"),
                        Buffer.from(nonce).toString("hex")
                      )
                    ),
                    "hex"
                  ).toString(),
                  "base64"
                );

                // Expected: {"create_viewing_key":{"key":"api_key_1k1T...btJQo="}}
                const data = JSON.parse(dataOutput);
                const viewingKey = data["create_viewing_key"]["key"];

                resolve(viewingKey);
              } catch (e) {
                reject(
                  new Error(`Failed to create the viewing key: ${e.message}`)
                );
              } finally {
                loadingIndicator.setIsLoading("create-veiwing-key", false);
              }
            } else {
              loadingIndicator.setIsLoading("create-veiwing-key", false);
              reject(
                new Error(
                  `Failed to create the viewing key by the unknown reason`
                )
              );
            }
          },
          e => {
            loadingIndicator.setIsLoading("create-veiwing-key", false);
            reject(new Error(`Failed to create the viewing key: ${e.message}`));
          },
          "commit"
        );
      });
    } else {
      throw new Error("Not prepared to send tx");
    }
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.token.add"
      })}
      onBackButton={
        query.external
          ? undefined
          : () => {
              history.goBack();
            }
      }
    >
      <Form
        className={style.container}
        onSubmit={form.handleSubmit(async data => {
          if (
            tokenInfo.tokenInfo?.decimals != null &&
            tokenInfo.tokenInfo.name &&
            tokenInfo.tokenInfo.symbol
          ) {
            if (!isSecret20) {
              const currency: CW20Currency = {
                type: "cw20",
                contractAddress: data.contractAddress,
                coinMinimalDenom: tokenInfo.tokenInfo.name,
                coinDenom: tokenInfo.tokenInfo.symbol,
                coinDecimals: tokenInfo.tokenInfo.decimals
              };

              await chainStore.addToken(currency);
            } else {
              let viewingKey = data.viewingKey;

              if (!viewingKey) {
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
                      duration: 0.25
                    }
                  });
                  return;
                }
              }

              const currency: Secret20Currency = {
                type: "secret20",
                contractAddress: data.contractAddress,
                viewingKey: viewingKey,
                coinMinimalDenom: tokenInfo.tokenInfo.name,
                coinDenom: tokenInfo.tokenInfo.symbol,
                coinDecimals: tokenInfo.tokenInfo.decimals
              };

              await chainStore.addToken(currency);
            }

            if (external) {
              const msg = new ApproveSuggestedTokenMsg(
                chainStore.chainInfo.chainId
              );
              await sendMessage(BACKGROUND_PORT, msg);
              window.close();
            } else {
              history.push({
                pathname: "/"
              });
            }
          }
        })}
      >
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.contract-address"
          })}
          name="contractAddress"
          autoComplete="off"
          ref={form.register({
            required: "Contract address is required",
            validate: (value: string): string | undefined => {
              try {
                AccAddress.fromBech32(
                  value,
                  chainStore.chainInfo.bech32Config.bech32PrefixAccAddr
                );
              } catch {
                return "Invalid address";
              }
            }
          })}
          text={
            tokenInfo.fetching ? (
              <i className="fas fa-spinner fa-spin" />
            ) : (
              undefined
            )
          }
          error={(() => {
            if (form.errors.contractAddress) {
              return form.errors.contractAddress.message;
            }

            if (tokenInfo.tokenInfo == null) {
              const error = tokenInfo.error as any;
              if (error && error.response) {
                // Sometimes, the chain info is not changed before the actual chain info is set.
                // So, for now, ignore the Not Found status.
                if (error.response.status !== 404) {
                  return "Invalid SNIP20 contract address";
                }
              }
            }

            return undefined;
          })()}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.name"
          })}
          value={tokenInfo.tokenInfo?.name ?? "-"}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.symbol"
          })}
          value={tokenInfo.tokenInfo?.symbol ?? "-"}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.decimals"
          })}
          value={tokenInfo.tokenInfo?.decimals ?? "-"}
          readOnly={true}
        />
        {isSecret20 && isOpenSecret20ViewingKey ? (
          <Input
            type="text"
            label={intl.formatMessage({
              id: "setting.token.add.secret20.viewing-key"
            })}
            name="viewingKey"
            autoComplete="off"
            ref={form.register({
              required: "Viewing key is required"
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
              setIsOpenSecret20ViewingKey(value => !value);
            }}
          />
          <label
            className="custom-control-label"
            htmlFor="viewing-key-checkbox"
            style={{ color: "#666666", paddingTop: "1px" }}
          >
            (Advanced) Import my own viewing key
          </label>
        </div>
        <Button
          type="submit"
          color="primary"
          disabled={tokenInfo.tokenInfo == null || tokenInfo.fetching}
        >
          <FormattedMessage id="setting.token.add.button.submit" />
        </Button>
      </Form>
    </HeaderLayout>
  );
});
