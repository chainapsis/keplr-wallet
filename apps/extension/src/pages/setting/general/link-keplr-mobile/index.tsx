import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { GuideBox } from "../../../../components/guide-box";
import { Stack } from "../../../../components/stack";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Subtitle3 } from "../../../../components/typography";
import { TextInput } from "../../../../components/input";
import lottie from "lottie-web";
import AnimScan from "../../../../public/assets/lottie/wallet/scan.json";
import { YAxis } from "../../../../components/axis";
import { useConfirm } from "../../../../hooks/confirm";
import {
  ExportedKeyRingVault,
  ExportKeyRingVaultsMsg,
  GetEnabledChainIdentifiersMsg,
} from "@keplr-wallet/background";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { QRCodeSVG } from "qrcode.react";
import { useStore } from "../../../../stores";
import SignClient from "@walletconnect/sign-client";
import { useNavigate } from "react-router";
import AES, { Counter } from "aes-js";
import { AddressBookData } from "../../../../stores/ui-config/address-book";
import { toJS } from "mobx";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { FormattedMessage, useIntl } from "react-intl";

class MemoryKeyValueStorage {
  protected readonly store: Map<string, string> = new Map();

  getEntries<T = any>(): Promise<[string, T][]> {
    const entries: [string, T][] = [];
    for (const [key, value] of this.store.entries()) {
      entries.push([key, JSON.parse(value)]);
    }
    return Promise.resolve(entries);
  }

  getItem<T = any>(key: string): Promise<T | undefined> {
    const value = this.store.get(key);
    if (value != null) {
      return Promise.resolve(JSON.parse(value));
    }
    return Promise.resolve(undefined);
  }

  getKeys(): Promise<string[]> {
    return Promise.resolve(Array.from(this.store.keys()));
  }

  removeItem(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve(undefined);
  }

  setItem<T = any>(key: string, value: T): Promise<void> {
    this.store.set(key, JSON.stringify(value));
    return Promise.resolve(undefined);
  }
}

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  Bold: styled.span`
    color: ${ColorPalette["gray-10"]};
    text-decoration: underline;
  `,
  Paragraph: styled(Subtitle3)`
    text-align: center;
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-200"]};
    padding: 0 0.625rem;
  `,
};

export const SettingGeneralLinkKeplrMobilePage: FunctionComponent = observer(
  () => {
    const [keyRingVaults, setKeyRingVaults] = useState<ExportedKeyRingVault[]>(
      []
    );

    const confirm = useConfirm();
    const intl = useIntl();

    return keyRingVaults.length === 0 ? (
      <EnterPasswordView
        onSubmit={async (password) => {
          const msg = new ExportKeyRingVaultsMsg(password);

          const res = await new InExtensionMessageRequester().sendMessage(
            BACKGROUND_PORT,
            msg
          );

          if (res.length === 0) {
            confirm.confirm(
              intl.formatMessage({
                id: "page.setting.general.link-keplr-mobile.confirm-title",
              }),
              <React.Fragment>
                <FormattedMessage
                  id="page.setting.general.link-keplr-mobile.confirm-paragraph"
                  values={{ br: <br /> }}
                />
              </React.Fragment>,
              {
                forceYes: true,
              }
            );
          } else {
            setKeyRingVaults(res);
          }
        }}
      />
    ) : (
      <QRCodeView
        keyRingVaults={keyRingVaults}
        cancel={() => {
          setKeyRingVaults([]);
        }}
      />
    );
  }
);

const EnterPasswordView: FunctionComponent<{
  onSubmit: (password: string) => Promise<void>;
}> = observer(({ onSubmit }) => {
  const animDivRef = useRef<HTMLDivElement | null>(null);
  const intl = useIntl();
  const theme = useTheme();

  useEffect(() => {
    if (animDivRef.current) {
      const anim = lottie.loadAnimation({
        container: animDivRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: AnimScan,
      });

      return () => {
        anim.destroy();
      };
    }
  }, []);

  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.setting.general.link-kpelr-mobile-title",
      })}
      left={<BackButton />}
      bottomButtons={[
        {
          color: "secondary",
          text: intl.formatMessage({
            id: "button.confirm",
          }),
          size: "large",
          type: "submit",
          isLoading,
          disabled: password.length === 0,
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setIsFailed(false);
        try {
          await onSubmit(password);
        } catch (e) {
          console.log(e);
          setIsFailed(true);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      <Styles.Container gutter="0.75rem">
        <GuideBox
          title={intl.formatMessage({
            id: "page.setting.general.link-keplr-mobile.enter-password-view.guide-title",
          })}
          paragraph={intl.formatMessage({
            id: "page.setting.general.link-keplr-mobile.enter-password-view.guide-paragraph",
          })}
        />

        <YAxis alignX="center">
          <div
            ref={animDivRef}
            style={{
              backgroundColor:
                theme.mode === "light" ? "none" : ColorPalette["gray-600"],
              borderRadius: "2.5rem",
              width: "9.375rem",
              height: "9.375rem",
            }}
          />
        </YAxis>

        <Styles.Paragraph>
          <FormattedMessage id="page.setting.general.link-keplr-mobile.enter-password-view.paragraph" />
        </Styles.Paragraph>

        <TextInput
          label={intl.formatMessage({
            id: "page.setting.general.link-keplr-mobile.enter-password-view.password-label",
          })}
          type="password"
          value={password}
          error={
            isFailed
              ? intl.formatMessage({ id: "error.invalid-password" })
              : undefined
          }
          onChange={(e) => {
            e.preventDefault();

            setPassword(e.target.value);

            // Clear error if the user is typing.
            setIsFailed(false);
          }}
        />
      </Styles.Container>
    </HeaderLayout>
  );
});

export interface WCExportKeyRingDatasResponse {
  encrypted: {
    // ExportKeyRingData[]
    // Json format and hex encoded
    ciphertext: string;
  };
  addressBooks: { [chainId: string]: AddressBookData[] | undefined };
  enabledChainIdentifiers: Record<string, string[] | undefined>;
}

const QRCodeView: FunctionComponent<{
  keyRingVaults: ExportedKeyRingVault[];

  cancel: () => void;
}> = observer(({ keyRingVaults, cancel }) => {
  const { chainStore, uiConfigStore } = useStore();

  const navigate = useNavigate();
  const confirm = useConfirm();
  const intl = useIntl();

  const [signClient, setSignClient] = useState<SignClient | undefined>();
  const [qrCodeData, setQRCodeData] = useState<string | undefined>();

  const cancelRef = useRef(cancel);
  cancelRef.current = cancel;
  const [isExpired, setIsExpired] = useState(false);
  const processOnce = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => {
      if (processOnce.current) {
        return;
      }
      // Hide qr code after 30 seconds.
      setIsExpired(true);
      confirm
        .confirm(
          "",
          intl.formatMessage({
            id: "page.setting.general.link-keplr-mobile.qr-code-view.session-expired",
          }),
          {
            forceYes: true,
            yesText: "Ok",
          }
        )
        .then(() => {
          cancelRef.current();
        });
    }, 30000);

    return () => {
      clearTimeout(id);
    };
  }, [confirm, intl]);

  useEffect(() => {
    (async () => {
      const signClient = await SignClient.init({
        projectId: process.env["WC_PROJECT_ID"],
        storage: new MemoryKeyValueStorage(),
      });

      setSignClient(signClient);
    })();
  }, []);

  const topic = useRef<string>("");
  useEffect(() => {
    let intervalId: NodeJS.Timer | undefined;

    if (signClient) {
      try {
        (async () => {
          const { uri, approval } = await signClient.connect({
            requiredNamespaces: {
              cosmos: {
                methods: ["__keplr_export_keyring_vaults"],
                chains: ["cosmos:cosmoshub-4"],
                events: [],
              },
            },
          });

          if (uri) {
            const bytes = new Uint8Array(32);
            crypto.getRandomValues(bytes);
            const password = Buffer.from(bytes);

            const ivBytes = new Uint8Array(16);
            crypto.getRandomValues(ivBytes);
            const iv = Buffer.from(ivBytes);

            const n = Math.floor(Math.random() * 10000);
            const len = 5;
            const data = JSON.stringify({
              wcURI: uri,
              password: password.toString("hex"),
              iv: iv.toString("hex"),
            });
            const chunks: string[] = [];
            for (let i = 0; i < len; i += 1) {
              const chunk =
                i === len - 1
                  ? data.slice((data.length / len) * i)
                  : data.slice(
                      (data.length / len) * i,
                      (data.length / len) * (i + 1)
                    );
              chunks.push(chunk);
            }
            let i = 0;
            const setQR = () => {
              const _i = i % len;
              const payload = {
                t: "export",
                n,
                len,
                v: "v2",
                i: _i,
                d: chunks[_i],
              };

              setQRCodeData(JSON.stringify(payload));

              i++;
            };

            setQR();
            intervalId = setInterval(() => {
              setQR();
            }, 1000);

            const counter = new Counter(0);
            counter.setBytes(iv);
            const aesCtr = new AES.ModeOfOperation.ctr(password, counter);

            // Await session approval from the wallet.
            const session = await approval();
            topic.current = session.topic;

            await (async () => {
              const addressBooks: {
                [chainId: string]: AddressBookData[] | undefined;
              } = {};

              for (const chainInfo of chainStore.chainInfos) {
                const addressBookData =
                  uiConfigStore.addressBookConfig.getAddressBook(
                    chainInfo.chainId
                  );

                addressBooks[chainInfo.chainIdentifier] = toJS(addressBookData);
              }

              const enabledChainIdentifiers: Record<
                string,
                string[] | undefined
              > = {};
              for (const vault of keyRingVaults) {
                enabledChainIdentifiers[vault.id] =
                  await new InExtensionMessageRequester().sendMessage(
                    BACKGROUND_PORT,
                    new GetEnabledChainIdentifiersMsg(vault.id)
                  );
              }

              const buf = Buffer.from(JSON.stringify(keyRingVaults));

              const response: WCExportKeyRingDatasResponse = {
                encrypted: {
                  ciphertext: Buffer.from(aesCtr.encrypt(buf)).toString("hex"),
                },
                addressBooks,
                enabledChainIdentifiers,
              };

              await signClient.request({
                topic: session.topic,
                chainId: "cosmos:cosmoshub-4",
                request: {
                  method: "__keplr_export_keyring_vaults",
                  params: [
                    `0x${Buffer.from(JSON.stringify(response)).toString(
                      "hex"
                    )}`,
                  ],
                },
              });

              navigate("/");
            })();
          }
        })();
      } catch (e) {
        confirm
          .confirm(
            "",
            `Failed to create qr code data: ${e.message || e.toString()}`,
            {
              forceYes: true,
            }
          )
          .then(() => {
            cancelRef.current();
          });
      }
    }

    return () => {
      if (intervalId != null) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signClient]);

  useEffect(() => {
    return () => {
      if (signClient && topic.current) {
        signClient
          .disconnect({
            topic: topic.current,
            reason: {
              code: 1000,
              message: "Unmounted",
            },
          })
          .catch((e) => {
            console.log(e);
          });
      }
    };
  }, [signClient]);

  return (
    <HeaderLayout
      title={intl.formatMessage({
        id: "page.setting.general.link-kpelr-mobile-title",
      })}
      left={<BackButton />}
    >
      <Styles.Container>
        <Box padding="1.5rem">
          <YAxis alignX="center">
            <Styles.Paragraph>
              <FormattedMessage id="page.setting.general.link-keplr-mobile.qr-code-view.paragraph" />
            </Styles.Paragraph>
            <Gutter size="3.375rem" direction="vertical" />
            <Box
              padding="1rem"
              borderRadius="0.5rem"
              backgroundColor={ColorPalette["white"]}
            >
              <QRCodeSVG
                value={(() => {
                  if (isExpired) {
                    return intl.formatMessage({
                      id: "page.setting.general.link-keplr-mobile.qr-code-view.expired",
                    });
                  }

                  if (qrCodeData) {
                    return qrCodeData;
                  }

                  return "";
                })()}
                size={200}
                level="M"
                bgColor={ColorPalette.white}
                fgColor={ColorPalette.black}
                imageSettings={{
                  src: require("../../../../public/assets/logo-256.png"),
                  width: 40,
                  height: 40,
                  excavate: true,
                }}
              />
            </Box>
          </YAxis>
        </Box>
      </Styles.Container>
    </HeaderLayout>
  );
});
