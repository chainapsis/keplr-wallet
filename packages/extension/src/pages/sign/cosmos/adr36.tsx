import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { checkAndValidateADR36AminoSignDoc } from "@keplr-wallet/cosmos";
import { Box } from "../../../components/box";
import { XAxis, YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { Body2, Body3, H5, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { ViewDataButton } from "../components/view-data-button";
import { handleCosmosPreSign } from "../utils/handle-cosmos-sign";
import { KeplrError } from "@keplr-wallet/router";
import { ErrModuleLedgerSign } from "../utils/ledger-types";
import { LedgerGuideBox } from "../components/ledger-guide-box";
import { GuideBox } from "../../../components/guide-box";
import { IconProps } from "../../../components/icon/types";

export const SignCosmosADR36Page: FunctionComponent = observer(() => {
  const { chainStore, signInteractionStore, uiConfigStore } = useStore();

  const [isViewData, setIsViewData] = useState(false);

  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  if (
    signInteractionStore.waitingData &&
    !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc
  ) {
    throw new Error("Sign doc is not for adr36");
  }

  const signDocWrapper = signInteractionStore.waitingData?.data.signDocWrapper;
  const isADR36WithString = (() => {
    if (
      signInteractionStore.waitingData?.data.signOptions &&
      "isADR36WithString" in signInteractionStore.waitingData.data.signOptions
    ) {
      return (
        signInteractionStore.waitingData.data.signOptions.isADR36WithString ||
        false
      );
    }
    return false;
  })();
  const content = useMemo(() => {
    if (!signDocWrapper) {
      return "";
    }

    if (signDocWrapper.aminoSignDoc.msgs.length !== 1) {
      throw new Error("Sign doc is improper ADR-36");
    }

    const msg = signDocWrapper.aminoSignDoc.msgs[0];
    if (msg.type !== "sign/MsgSignData") {
      throw new Error("Sign doc is improper ADR-36");
    }

    if (isADR36WithString) {
      const str = Buffer.from(msg.value.data, "base64").toString();

      try {
        // In case of json, it is displayed more easily to read.
        return JSON.stringify(JSON.parse(str), null, 2);
      } catch {
        return str;
      }
    } else {
      return msg.value.data as string;
    }
  }, [isADR36WithString, signDocWrapper]);

  const isLedgerAndDirect =
    signInteractionStore.waitingData?.data.keyType === "ledger" &&
    signInteractionStore.waitingData?.data.mode === "direct";

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  return (
    <HeaderLayout
      title="Prove Ownership"
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButton={{
        text: "Approve",
        color: "primary",
        size: "large",
        disabled: signInteractionStore.waitingData == null,
        isLoading:
          signInteractionStore.isObsoleteInteraction(
            signInteractionStore.waitingData?.id
          ) || isLedgerInteracting,
        onClick: async () => {
          if (signInteractionStore.waitingData) {
            const signDocWrapper =
              signInteractionStore.waitingData.data.signDocWrapper;

            if (
              signDocWrapper.mode !== "amino" ||
              !checkAndValidateADR36AminoSignDoc(
                signDocWrapper.aminoSignDoc,
                chainStore.getChain(
                  signInteractionStore.waitingData.data.chainId
                ).bech32Config.bech32PrefixAccAddr
              )
            ) {
              throw new Error("Invalid sign doc for adr36");
            }

            if (signInteractionStore.waitingData.data.keyType === "ledger") {
              setIsLedgerInteracting(true);
              setLedgerInteractingError(undefined);
            }

            try {
              const signature = await handleCosmosPreSign(
                uiConfigStore.useWebHIDLedger,
                signInteractionStore.waitingData,
                signDocWrapper
              );

              await signInteractionStore.approveWithProceedNext(
                signInteractionStore.waitingData.id,
                signDocWrapper,
                signature,
                (proceedNext) => {
                  if (!proceedNext) {
                    if (
                      interactionInfo.interaction &&
                      !interactionInfo.interactionInternal
                    ) {
                      window.close();
                    }
                  }
                }
              );
            } catch (e) {
              console.log(e);

              if (e instanceof KeplrError) {
                if (e.module === ErrModuleLedgerSign) {
                  setLedgerInteractingError(e);
                } else {
                  setLedgerInteractingError(undefined);
                }
              } else {
                setLedgerInteractingError(undefined);
              }
            } finally {
              setIsLedgerInteracting(false);
            }
          }
        },
      }}
    >
      <Box
        height="100%"
        padding="0.75rem"
        paddingTop="0.5rem"
        paddingBottom="0"
        style={{
          overflow: "auto",
        }}
      >
        <Box>
          <XAxis alignY="center">
            <div
              style={{
                flex: 1,
              }}
            />
            <ViewDataButton
              isViewData={isViewData}
              setIsViewData={setIsViewData}
            />
          </XAxis>
        </Box>

        <Gutter size="0.5rem" />

        <Box
          padding="1rem"
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="0.375rem"
        >
          <XAxis alignY="center">
            <Box
              width="3rem"
              height="3rem"
              borderRadius="50%"
              alignX="center"
              alignY="center"
              backgroundColor={ColorPalette["gray-400"]}
            >
              <ADR36SignIcon />
            </Box>
            <Gutter size="0.75rem" />
            <YAxis>
              <H5 color={ColorPalette["gray-10"]}>
                Prove account ownership to
              </H5>
              <Gutter size="2px" />
              <Body3 color={ColorPalette["gray-200"]}>
                {signInteractionStore.waitingData?.data.origin || ""}
              </Body3>
            </YAxis>
          </XAxis>
        </Box>

        <Gutter size="0.75rem" />

        <Box
          height="13rem"
          padding="1rem"
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="0.375rem"
          style={{
            overflow: "auto",
          }}
        >
          <pre
            style={{
              color: ColorPalette["gray-10"],
              // Remove normalized style of pre tag
              margin: 0,
            }}
          >
            {!isViewData
              ? content
              : JSON.stringify(
                  signInteractionStore.waitingData?.data.signDocWrapper
                    .aminoSignDoc,
                  null,
                  2
                )}
          </pre>
        </Box>

        <div style={{ flex: 1 }} />
        <Box
          padding="1rem"
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="0.375rem"
        >
          <XAxis alignY="center">
            <Body2 color={ColorPalette["gray-200"]}>Requested Network</Body2>
            <div style={{ flex: 1 }} />
            <Subtitle3 color={ColorPalette["gray-50"]}>
              {signInteractionStore.waitingData?.data.chainId
                ? chainStore.getChain(
                    signInteractionStore.waitingData?.data.chainId
                  ).chainName
                : ""}
            </Subtitle3>
          </XAxis>
        </Box>

        {isLedgerAndDirect ? (
          <React.Fragment>
            <Gutter size="0.75rem" />
            <GuideBox
              color="warning"
              title="Incompatible Signing Requested"
              paragraph="Error: SIGN_MODE_DIRECT can’t be signed on Ledger. Contact the web app provider to fix this issue."
            />
          </React.Fragment>
        ) : null}

        {signInteractionStore.waitingData ? (
          <LedgerGuideBox
            data={{
              keyInsensitive:
                signInteractionStore.waitingData.data.keyInsensitive,
              isEthereum:
                "eip712" in signInteractionStore.waitingData.data &&
                signInteractionStore.waitingData.data.eip712 != null,
            }}
            isLedgerInteracting={isLedgerInteracting}
            ledgerInteractingError={ledgerInteractingError}
          />
        ) : null}
      </Box>
    </HeaderLayout>
  );
});

const ADR36SignIcon: FunctionComponent<IconProps> = ({
  width = "2rem",
  height = "2rem",
  color,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.14336 27.0355L14.6389 20.5399C15.1116 20.6676 15.6133 20.6354 16.0659 20.4485C16.5185 20.2615 16.8966 19.9303 17.1414 19.5062C17.3863 19.0822 17.4841 18.5891 17.4198 18.1037C17.3554 17.6183 17.1325 17.1677 16.7856 16.8221C16.4397 16.4762 15.9893 16.2541 15.5043 16.1903C15.0192 16.1265 14.5267 16.2244 14.1031 16.4691C13.6794 16.7137 13.3483 17.0912 13.1612 17.5432C12.974 17.9952 12.9412 18.4963 13.0678 18.9688L6.57225 25.4643L5.39447 24.2866C8.53669 20.6199 9.71447 16.5599 11.2856 9.75101L18.3567 8.96546L24.6422 15.251L23.8567 22.321C17.0478 23.8932 12.9878 25.071 9.32225 28.2143L8.14336 27.0355ZM21.1067 5.4299L28.1589 12.481C28.2316 12.5536 28.2827 12.6448 28.3067 12.7447C28.3306 12.8445 28.3264 12.9491 28.2945 13.0467C28.2626 13.1443 28.2043 13.2312 28.126 13.2976C28.0478 13.3641 27.9526 13.4076 27.8511 13.4232L26.2134 13.6788L19.9289 7.39324L20.1645 5.74324C20.1793 5.64129 20.2222 5.54548 20.2883 5.4665C20.3544 5.38751 20.4412 5.32847 20.5389 5.29596C20.6367 5.26346 20.7416 5.25877 20.8418 5.28242C20.9421 5.30607 21.0338 5.35713 21.1067 5.4299Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};
