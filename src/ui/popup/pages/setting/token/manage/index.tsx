import React, { FunctionComponent, useCallback, useState } from "react";
import { HeaderLayout } from "../../../../layouts/header-layout";
import { useHistory } from "react-router";
import { PageButton } from "../../page-button";

import style from "./style.module.scss";
import { observer } from "mobx-react";
import { useStore } from "../../../../stores";
import { Secret20Currency } from "../../../../../../common/currency";
import { shortenAddress } from "../../../../../../common/address";
import { useNotification } from "../../../../../components/notification";
import { useConfirm } from "../../../../../components/confirm";
import { useLoadingIndicator } from "../../../../../components/loading-indicator";
import { PopupWalletProvider } from "../../../../wallet-provider";
import { useCosmosJS } from "../../../../../hooks";
import { MsgExecuteContract as SecretMsgExecuteContract } from "../../../../../../common/secretjs/x/compute";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import Axios from "axios";
import { sendMessage } from "../../../../../../common/message";
import { BACKGROUND_PORT } from "../../../../../../common/message/constant";
import {
  ReqeustEncryptMsg,
  RequestDecryptMsg
} from "../../../../../../background/secret-wasm";
import bigInteger from "big-integer";
import { Coin } from "@chainapsis/cosmosjs/common/coin";
import { Int } from "@chainapsis/cosmosjs/common/int";
import { UncontrolledTooltip } from "reactstrap";

const Buffer = require("buffer/").Buffer;

export const ManageTokenPage: FunctionComponent = observer(() => {
  const history = useHistory();
  const notification = useNotification();
  const loadingIndicator = useLoadingIndicator();
  const confirm = useConfirm();

  const { chainStore, accountStore } = useStore();

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

  const createViewingKey = async (contractAddress: string): Promise<string> => {
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

  const appCurrencies = chainStore.chainInfo.currencies.filter(currency => {
    return "type" in currency && currency.type === "secret20";
  });

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Token List"
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <div className={style.container}>
        {appCurrencies.map(currency => {
          if (!("type" in currency) || currency.type !== "secret20") {
            return;
          }

          const secret20 = currency as Secret20Currency;

          const isInvalidViewingKey =
            accountStore.secret20ViewingKeyError[secret20.contractAddress] ===
            true;

          const icons: React.ReactElement[] = [];

          if (!isInvalidViewingKey) {
            icons.push(
              <i
                key="copy"
                className="fas fa-copy"
                style={{
                  cursor: "pointer"
                }}
                onClick={async e => {
                  e.preventDefault();

                  await navigator.clipboard.writeText(secret20.viewingKey);
                  // TODO: Show success tooltip.
                  notification.push({
                    placement: "top-center",
                    type: "success",
                    duration: 2,
                    content: "Viewing key copied!",
                    canDelete: true,
                    transition: {
                      duration: 0.25
                    }
                  });
                }}
              />
            );
          } else {
            icons.push(
              <React.Fragment>
                <i
                  className="fas fa-exclamation-circle text-danger"
                  id={`error_${secret20.contractAddress}`}
                />
                <UncontrolledTooltip
                  target={`error_${secret20.contractAddress}`}
                >
                  Viewing key error
                </UncontrolledTooltip>
              </React.Fragment>,
              <i
                key="refair"
                className="fas fa-wrench"
                style={{
                  cursor: "pointer"
                }}
                onClick={async e => {
                  e.preventDefault();

                  const viewingKey = await createViewingKey(
                    secret20.contractAddress
                  );
                  const currency: Secret20Currency = Object.assign(
                    {},
                    secret20,
                    {
                      viewingKey
                    }
                  );
                  await chainStore.addToken(currency);
                }}
              />
            );
          }

          icons.push(
            <i
              key="trash"
              className="fas fa-trash-alt"
              style={{
                cursor: "pointer"
              }}
              onClick={async e => {
                e.preventDefault();

                if (
                  await confirm.confirm({
                    paragraph:
                      "Are you sure you’d like to disable this token? You wil not be able to see your balance or transfer until you register a viewing key."
                  })
                ) {
                  await chainStore.removeToken(secret20);
                }
              }}
            />
          );

          return (
            <PageButton
              key={secret20.contractAddress}
              style={{
                cursor: "auto"
              }}
              title={secret20.coinDenom}
              paragraph={shortenAddress(secret20.contractAddress, 30)}
              icons={icons}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});
