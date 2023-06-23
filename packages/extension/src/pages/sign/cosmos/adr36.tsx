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
import { FormattedMessage, useIntl } from "react-intl";
import { Image } from "../../../components/image";

export const SignCosmosADR36Page: FunctionComponent = observer(() => {
  const { chainStore, signInteractionStore, uiConfigStore } = useStore();
  const intl = useIntl();

  const [isViewData, setIsViewData] = useState(false);

  const interactionInfo = useInteractionInfo(() => {
    signInteractionStore.rejectAll();
  });

  if (
    signInteractionStore.waitingData &&
    !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc
  ) {
    throw new Error(
      intl.formatMessage({ id: "error.sign-doc-is-not-for-adr36" })
    );
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
      throw new Error(
        intl.formatMessage({ id: "error.sign-doc-is-improper-adr36" })
      );
    }

    const msg = signDocWrapper.aminoSignDoc.msgs[0];
    if (msg.type !== "sign/MsgSignData") {
      throw new Error(
        intl.formatMessage({ id: "error.sign-doc-is-improper-adr36" })
      );
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
      title={intl.formatMessage({ id: "page.sign.adr36.title" })}
      fixedHeight={true}
      left={
        <BackButton
          hidden={
            interactionInfo.interaction && !interactionInfo.interactionInternal
          }
        />
      }
      bottomButton={{
        text: intl.formatMessage({ id: "button.approve" }),
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
              throw new Error(
                intl.formatMessage({ id: "error.invalid-sign-doc-for-adr36" })
              );
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
            <Image
              alt="sign-custom-image"
              src={require("../../../public/assets/img/sign-adr36.png")}
              style={{ width: "3rem", height: "3rem" }}
            />
            <Gutter size="0.75rem" />
            <YAxis>
              <H5 color={ColorPalette["gray-10"]}>
                <FormattedMessage id="Prove account ownership to" />
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
            <Body2 color={ColorPalette["gray-200"]}>
              <FormattedMessage id="page.sign.adr36.requested-network" />
            </Body2>
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
              title={intl.formatMessage({
                id: "page.sign.adr36.warning-title",
              })}
              paragraph={intl.formatMessage({
                id: "page.sign.adr36.warning-paragraph",
              })}
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
