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

export const SignCosmosADR36Page: FunctionComponent = observer(() => {
  const { chainStore, signInteractionStore } = useStore();

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

  return (
    <HeaderLayout
      title="Prove Ownership"
      fixedHeight={true}
      left={<BackButton />}
      bottomButton={{
        text: "Approve",
        color: "primary",
        size: "large",
        disabled: signInteractionStore.waitingData == null,
        isLoading: signInteractionStore.waitingData?.obsolete,
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

            await signInteractionStore.approveWithProceedNext(
              signInteractionStore.waitingData.id,
              signDocWrapper,
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
          overflow: "scroll",
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
            <div>test</div>
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
            overflow: "scroll",
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
      </Box>
    </HeaderLayout>
  );
});
