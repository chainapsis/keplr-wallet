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
