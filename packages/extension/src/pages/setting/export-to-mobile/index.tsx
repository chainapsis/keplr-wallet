import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "../../../layouts";
import { useHistory } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import QRCode from "qrcode.react";
import style from "./style.module.scss";
import WalletConnect from "@walletconnect/client";
import { Buffer } from "buffer/";
import { useLoadingIndicator } from "../../../components/loading-indicator";
import { Button, Form } from "reactstrap";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import useForm from "react-hook-form";
import { Input } from "../../../components/form";
import { ExportKeyRingData } from "@keplr-wallet/background";
import AES, { Counter } from "aes-js";
import { AddressBookConfigMap, AddressBookData } from "@keplr-wallet/hooks";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { toJS } from "mobx";

export interface QRCodeSharedData {
  // The uri for the wallet connect
  wcURI: string;
  // The temporary password for encrypt/descrypt the key datas.
  // This must not be shared the other than the extension and mobile.
  sharedPassword: string;
}

export interface WCExportKeyRingDatasResponse {
  encrypted: {
    // ExportKeyRingData[]
    // Json format and hex encoded
    ciphertext: string;
    // Hex encoded
    iv: string;
  };
  addressBooks: { [chainId: string]: AddressBookData[] | undefined };
}

export const ExportToMobilePage: FunctionComponent = () => {
  const history = useHistory();
  const intl = useIntl();

  const [exportKeyRingDatas, setExportKeyRingDatas] = useState<
    ExportKeyRingData[]
  >([]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.export-to-mobile",
      })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      {exportKeyRingDatas.length === 0 ? (
        <EnterPasswordToExportKeyRingView
          onSetExportKeyRingDatas={setExportKeyRingDatas}
        />
      ) : (
        <WalletConnectToExportKeyRingView
          exportKeyRingDatas={exportKeyRingDatas}
        />
      )}
    </HeaderLayout>
  );
};

interface FormData {
  password: string;
}

export const EnterPasswordToExportKeyRingView: FunctionComponent<{
  onSetExportKeyRingDatas: (datas: ExportKeyRingData[]) => void;
}> = observer(({ onSetExportKeyRingDatas }) => {
  const { keyRingStore } = useStore();

  const intl = useIntl();

  const { register, handleSubmit, setError, errors } = useForm<FormData>({
    defaultValues: {
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);

  return (
    <div className={style.container}>
      <div style={{ flex: 1 }} />
      <Form
        onSubmit={handleSubmit(async (data) => {
          setLoading(true);
          try {
            onSetExportKeyRingDatas(
              await keyRingStore.exportKeyRingDatas(data.password)
            );
          } catch (e) {
            console.log("Fail to decrypt: " + e.message);
            setError(
              "password",
              "invalid",
              intl.formatMessage({
                id: "setting.export-to-mobile.input.password.error.invalid",
              })
            );
          } finally {
            setLoading(false);
          }
        })}
      >
        <Input
          type="password"
          label={intl.formatMessage({
            id: "setting.export-to-mobile.input.password",
          })}
          name="password"
          error={errors.password && errors.password.message}
          ref={register({
            required: intl.formatMessage({
              id: "setting.export-to-mobile.input.password.error.required",
            }),
          })}
        />
        <Button type="submit" color="primary" block data-loading={loading}>
          <FormattedMessage id="setting.export-to-mobile.button.confirm" />
        </Button>
      </Form>
    </div>
  );
});

export const WalletConnectToExportKeyRingView: FunctionComponent<{
  exportKeyRingDatas: ExportKeyRingData[];
}> = observer(({ exportKeyRingDatas }) => {
  const { chainStore } = useStore();

  const history = useHistory();

  const loadingIndicator = useLoadingIndicator();

  const [addressBookConfigMap] = useState(
    () =>
      new AddressBookConfigMap(new ExtensionKVStore("address-book"), chainStore)
  );

  const [connector, setConnector] = useState<WalletConnect | undefined>();
  const [qrCodeData, setQRCodeData] = useState<QRCodeSharedData | undefined>();

  useEffect(() => {
    if (!connector) {
      (async () => {
        const connector = new WalletConnect({
          bridge: "https://bridge.walletconnect.org",
        });

        if (connector.connected) {
          await connector.killSession();
        }

        setConnector(connector);
      })();
    }
  }, [connector]);

  useEffect(() => {
    if (connector) {
      connector.on("display_uri", (error, payload) => {
        if (error) {
          console.log(error);
          history.push("/");
          connector.killSession();
          return;
        }

        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        const password = Buffer.from(bytes).toString("hex");

        const uri = payload.params[0] as string;
        setQRCodeData({
          wcURI: uri,
          sharedPassword: password,
        });
      });

      connector.createSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector]);

  useEffect(() => {
    if (connector && qrCodeData) {
      connector.on("connect", (error) => {
        if (error) {
          console.log(error);
          history.push("/");
          connector.killSession();
        } else {
          loadingIndicator.setIsLoading("export-to-mobile", true);

          connector.on("call_request", (error, payload) => {
            if (
              error ||
              payload.method !==
                "keplr_request_export_keyring_datas_wallet_connect_v1"
            ) {
              console.log(error, payload?.method);
              history.push("/");
              connector.killSession();
              loadingIndicator.setIsLoading("export-to-mobile", false);
            } else {
              const buf = Buffer.from(JSON.stringify(exportKeyRingDatas));

              const bytes = new Uint8Array(16);
              crypto.getRandomValues(bytes);
              const iv = Buffer.from(bytes);

              const counter = new Counter(0);
              counter.setBytes(iv);
              const aesCtr = new AES.ModeOfOperation.ctr(
                Buffer.from(qrCodeData!.sharedPassword, "hex"),
                counter
              );

              (async () => {
                const addressBooks: {
                  [chainId: string]: AddressBookData[] | undefined;
                } = {};

                if (payload.params && payload.params.length > 0) {
                  for (const chainId of payload.params[0].addressBookChainIds ??
                    []) {
                    const addressBookConfig = addressBookConfigMap.getAddressBookConfig(
                      chainId
                    );

                    await addressBookConfig.waitLoaded();

                    addressBooks[chainId] = toJS(
                      addressBookConfig.addressBookDatas
                    ) as AddressBookData[];
                  }
                }

                const response: WCExportKeyRingDatasResponse = {
                  encrypted: {
                    ciphertext: Buffer.from(aesCtr.encrypt(buf)).toString(
                      "hex"
                    ),
                    // Hex encoded
                    iv: iv.toString("hex"),
                  },
                  addressBooks,
                };

                connector.approveRequest({
                  id: payload.id,
                  result: [response],
                });

                history.push("/");
                connector.killSession();
                loadingIndicator.setIsLoading("export-to-mobile", false);
              })();
            }
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector, qrCodeData]);

  return (
    <div className={style.container}>
      <QRCode size={300} value={qrCodeData ? JSON.stringify(qrCodeData) : ""} />
    </div>
  );
});
