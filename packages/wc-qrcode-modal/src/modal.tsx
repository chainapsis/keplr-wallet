import React, {
  CSSProperties,
  FunctionComponent,
  useEffect,
  useMemo,
  useState,
} from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import QRCode from "qrcode.react";
import {
  isMobile,
  isAndroid,
  saveMobileLinkInfo,
} from "@walletconnect/browser-utils";

export type ModalUIOptions = {
  backdrop?: {
    className?: string;
    style?: CSSProperties;
    disableDefaultStyle?: boolean;
  };
  modalContainer?: {
    className?: string;
    style?: CSSProperties;
    disableDefaultStyle?: boolean;
  };
  modalHeader?: {
    className?: string;
    style?: CSSProperties;
    disableDefaultStyle?: boolean;
  };
  qrCodeContainer?: {
    className?: string;
    style?: CSSProperties;
  };
  qrCodeSize?: number;
  appButtonContainer?: {
    className?: string;
    style?: CSSProperties;
  };
  appButton?: {
    className?: string;
    style?: CSSProperties;
  };
};

export const Modal: FunctionComponent<{
  uiOptions?: ModalUIOptions;

  uri: string;
  close: () => void;
}> = ({ uiOptions, uri, close }) => {
  const [checkMobile] = useState(() => isMobile());
  const [checkAndroid] = useState(() => isAndroid());

  const navigateToAppURL = useMemo(() => {
    if (checkMobile) {
      if (checkAndroid) {
        // Save the mobile link.
        saveMobileLinkInfo({
          name: "Keplr",
          href:
            "intent://wcV1#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;",
        });

        return `intent://wcV1?${uri}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
      } else {
        // Save the mobile link.
        saveMobileLinkInfo({
          name: "Keplr",
          href: "keplrwallet://wcV1",
        });

        return `keplrwallet://wcV1?${uri}`;
      }
    }
  }, [checkAndroid, checkMobile, uri]);

  useEffect(() => {
    // Try opening the app without interaction.
    if (navigateToAppURL) {
      window.location.href = navigateToAppURL;
    }
  }, [navigateToAppURL]);

  return (
    <React.Fragment>
      <div
        className={uiOptions?.backdrop?.className}
        style={{
          ...(uiOptions?.backdrop?.disableDefaultStyle
            ? {}
            : {
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.1)",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }),
          ...uiOptions?.backdrop?.style,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          close();
        }}
      >
        <div
          className={uiOptions?.modalContainer?.className}
          style={{
            ...(uiOptions?.modalContainer?.disableDefaultStyle
              ? {}
              : {
                  padding: 20,
                  borderRadius: 10,
                  backgroundColor: "#DDDDDD",
                }),
            ...uiOptions?.modalContainer?.style,
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {!checkMobile ? (
            <React.Fragment>
              <h3
                className={uiOptions?.modalHeader?.className}
                style={{
                  ...(uiOptions?.modalHeader?.disableDefaultStyle
                    ? {}
                    : {
                        fontSize: 20,
                        margin: 0,
                        marginBottom: 10,
                      }),
                  ...uiOptions?.modalHeader?.style,
                }}
              >
                Scan QR Code
              </h3>
              <div
                className={uiOptions?.qrCodeContainer?.className}
                style={uiOptions?.qrCodeContainer?.style}
              >
                <QRCode size={uiOptions?.qrCodeSize || 500} value={uri} />
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h3
                className={uiOptions?.modalHeader?.className}
                style={{
                  ...(uiOptions?.modalHeader?.disableDefaultStyle
                    ? {}
                    : {
                        fontSize: 20,
                        margin: 0,
                        marginBottom: 10,
                      }),
                  ...uiOptions?.modalHeader?.style,
                }}
              >
                Open App
              </h3>
              <div
                className={uiOptions?.appButtonContainer?.className}
                style={uiOptions?.appButtonContainer?.style}
              >
                <button
                  className={uiOptions?.appButton?.className}
                  style={uiOptions?.appButton?.style}
                  onClick={() => {
                    if (navigateToAppURL) {
                      window.location.href = navigateToAppURL;
                    }
                  }}
                >
                  Open App
                </button>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};
