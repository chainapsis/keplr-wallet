import React from "react";
import { useStore } from "../../../../stores";
import { useNavigate } from "react-router";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { ApproveIcon, CancelIcon } from "../../../../components/button";
import { HeaderProps } from "../../../../layouts/header/types";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import {
  handleEthereumPreSignByKeystone,
  handleEthereumPreSignByLedger,
} from "../../utils/handle-eth-sign";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../../utils/ledger-types";
import { ErrModuleKeystoneSign } from "../../utils/keystone";
import { KeystoneUR } from "../../utils/keystone";
import { Buffer } from "buffer/";
import { useInteractionInfo } from "../../../../hooks";

export interface UseEthereumSigningButtonsProps {
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
  interactionInfo: ReturnType<typeof useInteractionInfo>;
  signingDataBuff: Buffer;
  isLoading: boolean;
  buttonDisabled?: boolean;
  setIsLedgerInteracting: (value: boolean) => void;
  setLedgerInteractingError: (error: Error | undefined) => void;
  setIsKeystoneInteracting: (value: boolean) => void;
  setKeystoneInteractingError: (error: Error | undefined) => void;
  keystoneScanResolve: React.MutableRefObject<
    ((ur: KeystoneUR) => void) | undefined
  >;
  unmountPromise: { promise: Promise<void> };
  setKeystoneUR?: (ur: KeystoneUR) => void;
}

export const useEthereumSigningButtons = ({
  interactionData,
  interactionInfo,
  signingDataBuff,
  isLoading,
  buttonDisabled = false,
  setIsLedgerInteracting,
  setLedgerInteractingError,
  setIsKeystoneInteracting,
  setKeystoneInteractingError,
  keystoneScanResolve,
  unmountPromise,
  setKeystoneUR,
}: UseEthereumSigningButtonsProps) => {
  const { signEthereumInteractionStore, uiConfigStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const bottomButtons: HeaderProps["bottomButtons"] = [
    {
      textOverrideIcon: (
        <CancelIcon
          color={
            theme.mode === "light"
              ? ColorPalette["blue-400"]
              : ColorPalette["gray-200"]
          }
        />
      ),
      size: "large",
      color: "secondary",
      style: {
        width: "3.25rem",
      },
      onClick: async () => {
        await signEthereumInteractionStore.rejectWithProceedNext(
          interactionData.id,
          async (proceedNext) => {
            if (!proceedNext) {
              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                handleExternalInteractionWithNoProceedNext();
              } else if (
                interactionInfo.interaction &&
                interactionInfo.interactionInternal
              ) {
                window.history.length > 1 ? navigate(-1) : navigate("/");
              } else {
                navigate("/", { replace: true });
              }
            }
          }
        );
      },
    },
    {
      text: intl.formatMessage({ id: "button.approve" }),
      color: "primary",
      size: "large",
      left: !isLoading && <ApproveIcon />,
      disabled: buttonDisabled,
      isLoading,
      onClick: async () => {
        try {
          let signature;
          if (interactionData.data.keyType === "ledger") {
            setIsLedgerInteracting(true);
            setLedgerInteractingError(undefined);
            signature = await handleEthereumPreSignByLedger(
              interactionData,
              signingDataBuff,
              {
                useWebHID: uiConfigStore.useWebHIDLedger,
              }
            );
          } else if (interactionData.data.keyType === "keystone") {
            setIsKeystoneInteracting(true);
            setKeystoneInteractingError(undefined);
            signature = await handleEthereumPreSignByKeystone(
              interactionData,
              signingDataBuff,
              {
                displayQRCode: async (ur: KeystoneUR) => {
                  if (setKeystoneUR) {
                    setKeystoneUR(ur);
                  }
                },
                scanQRCode: () =>
                  new Promise<KeystoneUR>((resolve) => {
                    keystoneScanResolve.current = resolve;
                  }),
              }
            );
          }

          await signEthereumInteractionStore.approveWithProceedNext(
            interactionData.id,
            signingDataBuff,
            signature,
            async (proceedNext) => {
              if (!proceedNext) {
                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  handleExternalInteractionWithNoProceedNext();
                }
              }

              if (
                interactionInfo.interaction &&
                interactionInfo.interactionInternal
              ) {
                await unmountPromise.promise;
              }
            }
          );
        } catch (e) {
          console.log(e);

          if (e instanceof KeplrError) {
            if (e.module === ErrModuleLedgerSign) {
              setLedgerInteractingError(e);
            } else if (e.module === ErrModuleKeystoneSign) {
              setKeystoneInteractingError(e);
            } else {
              setLedgerInteractingError(undefined);
              setKeystoneInteractingError(undefined);
            }
          } else {
            setLedgerInteractingError(undefined);
            setKeystoneInteractingError(undefined);
          }
        } finally {
          setIsLedgerInteracting(false);
          setIsKeystoneInteracting(false);
        }
      },
    },
  ];

  return { bottomButtons };
};
