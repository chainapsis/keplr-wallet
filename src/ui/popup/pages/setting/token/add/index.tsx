import React, { FunctionComponent, useCallback, useState } from "react";
import { HeaderLayout } from "../../../../layouts/header-layout";
import { useHistory, useLocation } from "react-router";
import { useIntl, FormattedMessage } from "react-intl";

import style from "./style.module.scss";
import { Button, Form, InputGroupAddon } from "reactstrap";
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

  const { chainStore } = useStore();

  const form = useForm<FormData>({
    defaultValues: {
      contractAddress: (query.contractaddress as string) ?? "",
      viewingKey: (query.viewingkey as string) ?? ""
    }
  });

  const contractAddress = form.watch("contractAddress");

  const isSecret20 =
    (chainStore.chainInfo.features ?? []).find(
      feature => feature === "secretwasm"
    ) != null;

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
          history.push("/");
        }
      }
    )
  );
  const cosmosJS = useCosmosJS(chainStore.chainInfo, walletProvider);

  const createViewingKey = async () => {
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

      await cosmosJS.sendMsgs(
        [msg],
        {
          gas: bigInteger(3000000),
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

              history.push({
                pathname: "/setting/token/add",
                search: `?contractaddress=${contractAddress}&viewingkey=${viewingKey}`
              });
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
            } finally {
              loadingIndicator.setIsLoading("create-veiwing-key", false);
            }
          } else {
            loadingIndicator.setIsLoading("create-veiwing-key", false);
            notification.push({
              placement: "top-center",
              type: "danger",
              duration: 2,
              content: `Failed to create the viewing key by the unknown reason`,
              canDelete: true,
              transition: {
                duration: 0.25
              }
            });
          }
        },
        e => {
          loadingIndicator.setIsLoading("create-veiwing-key", false);
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
        },
        "commit"
      );
    }
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.token.add"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <Form
        className={style.container}
        onSubmit={form.handleSubmit(async data => {
          if (
            tokenInfo.tokenInfo?.decimals &&
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

              history.push({
                pathname: "/"
              });
            } else {
              const currency: Secret20Currency = {
                type: "secret20",
                contractAddress: data.contractAddress,
                viewingKey: data.viewingKey,
                coinMinimalDenom: tokenInfo.tokenInfo.name,
                coinDenom: tokenInfo.tokenInfo.symbol,
                coinDecimals: tokenInfo.tokenInfo.decimals
              };

              await chainStore.addToken(currency);

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
          error={
            form.errors.contractAddress
              ? form.errors.contractAddress.message
              : tokenInfo.tokenInfo == null
              ? tokenInfo.error?.message
              : undefined
          }
        />
        {isSecret20 ? (
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
            append={
              <InputGroupAddon addonType="append">
                <Button
                  color="primary"
                  disabled={
                    !cosmosJS.sendMsgs ||
                    cosmosJS.addresses.length == 0 ||
                    tokenInfo.tokenInfo == null
                  }
                  onClick={async e => {
                    e.preventDefault();

                    await createViewingKey();
                  }}
                >
                  <FormattedMessage id="setting.token.add.secret20.viewing-key.button.create" />
                </Button>
              </InputGroupAddon>
            }
          />
        ) : null}
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.name"
          })}
          value={tokenInfo.tokenInfo?.name ?? ""}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.symbol"
          })}
          value={tokenInfo.tokenInfo?.symbol ?? ""}
          readOnly={true}
        />
        <Input
          type="text"
          label={intl.formatMessage({
            id: "setting.token.add.decimals"
          })}
          value={tokenInfo.tokenInfo?.decimals ?? ""}
          readOnly={true}
        />
        <div style={{ flex: 1 }} />
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
