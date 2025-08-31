import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { GuideBox } from "../../../../components/guide-box";
import { Stack } from "../../../../components/stack";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Subtitle3 } from "../../../../components/typography";
import { PasswordTextInput } from "../../../../components/input";
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
import AES, { Counter } from "aes-js";
import { AddressBookData } from "../../../../stores/ui-config/address-book";
import { toJS } from "mobx";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { FormattedMessage, useIntl } from "react-intl";
import {
  exportUpload,
  exportGenerateQRCodeDataByInterval,
} from "keplr-wallet-private";

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
  const intl = useIntl();
  const theme = useTheme();

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
          <Gutter size="3.75rem" direction="vertical" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="66"
            height="66"
            fill="none"
            stroke="none"
            viewBox="0 0 66 66"
          >
            <g clipPath="url(#clip0_20035_158658)">
              <path
                fill={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
                d="M12.503 52.764v-4.251l2.125-2.126H8.251q-1.754 0-3.001-1.248Q4.002 43.892 4 42.136V10.25Q4 8.497 5.25 7.25 6.5 6.002 8.25 6H52.89q1.754 0 3.003 1.25 1.251 1.25 1.248 3.001v31.885q0 1.753-1.248 3.003t-3.003 1.248h-6.377l2.125 2.126v4.251zM8.25 42.136H52.89V10.25H8.25z"
              />
              <path
                fill={
                  theme.mode === "light"
                    ? ColorPalette["white"]
                    : ColorPalette["gray-700"]
                }
                d="M33.759 14.503h34.01v44.639h-34.01z"
              />
              <path
                fill={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
                d="M42.261 23.005v29.76h17.005v-29.76zm12.754 23.382a2.126 2.126 0 0 1 0 4.252h-8.502a2.126 2.126 0 0 1 0-4.252zm8.503 6.377a4.25 4.25 0 0 1-4.251 4.251H42.26a4.25 4.25 0 0 1-4.25-4.25v-29.76a4.25 4.25 0 0 1 4.25-4.251h17.005a4.25 4.25 0 0 1 4.252 4.251z"
              />
            </g>
            <defs>
              <clipPath id="clip0_20035_158658">
                <path fill="#fff" d="M0 0h66v66H0z" />
              </clipPath>
            </defs>
          </svg>
          <Gutter size="2.5rem" direction="vertical" />
        </YAxis>

        <Styles.Paragraph>
          <FormattedMessage id="page.setting.general.link-keplr-mobile.enter-password-view.paragraph" />
        </Styles.Paragraph>

        <PasswordTextInput
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

  const confirm = useConfirm();
  const intl = useIntl();

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
    let intervalId: NodeJS.Timer | undefined;

    try {
      (async () => {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        const password = Buffer.from(bytes);

        const ivBytes = new Uint8Array(16);
        crypto.getRandomValues(ivBytes);
        const iv = Buffer.from(ivBytes);

        const counter = new Counter(0);
        counter.setBytes(iv);
        const aesCtr = new AES.ModeOfOperation.ctr(password, counter);

        const addressBooks: {
          [chainId: string]: AddressBookData[] | undefined;
        } = {};

        for (const chainInfo of chainStore.chainInfos) {
          const addressBookData =
            uiConfigStore.addressBookConfig.getAddressBook(chainInfo.chainId);

          addressBooks[chainInfo.chainIdentifier] = toJS(addressBookData);
        }

        const enabledChainIdentifiers: Record<string, string[] | undefined> =
          {};
        for (const vault of keyRingVaults) {
          enabledChainIdentifiers[vault.id] =
            await new InExtensionMessageRequester().sendMessage(
              BACKGROUND_PORT,
              new GetEnabledChainIdentifiersMsg(vault.id)
            );
        }

        const buf = Buffer.from(JSON.stringify(keyRingVaults));

        const keyringData: WCExportKeyRingDatasResponse = {
          encrypted: {
            ciphertext: Buffer.from(aesCtr.encrypt(buf)).toString("hex"),
          },
          addressBooks,
          enabledChainIdentifiers,
        };

        const uploadResult = await exportUpload(JSON.stringify(keyringData));

        const data = JSON.stringify({
          otp: uploadResult?.otp,
          encryptionKey: password.toString("hex"),
          iv: iv.toString("hex"),
        });

        intervalId = exportGenerateQRCodeDataByInterval(data, setQRCodeData);
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

    return () => {
      if (intervalId != null) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
