import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../../layouts/header";
import { Box } from "../../../../components/box";
import { Image } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { Body1, Body2, H2, Subtitle3 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { handleExternalInteractionWithNoProceedNext } from "../../../../utils";
import { XMarkIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";
import { ApproveIcon } from "../../../../components/button";

export const SignCosmosICNSPage: FunctionComponent = observer(() => {
  const { icnsInteractionStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const interactionInfo = useInteractionInfo({
    onWindowClose: () => {
      icnsInteractionStore.rejectAll();
    },
    onUnmount: async () => {
      if (icnsInteractionStore.waitingData) {
        await icnsInteractionStore.rejectWithProceedNext(
          icnsInteractionStore.waitingData.id,
          () => {}
        );
      }
    },
  });

  const isLoading = (() => {
    if (
      icnsInteractionStore.waitingData &&
      icnsInteractionStore.isObsoleteInteractionApproved(
        icnsInteractionStore.waitingData.id
      )
    ) {
      return true;
    }
  })();

  return (
    <HeaderLayout
      title=""
      fixedHeight={true}
      bottomButtons={[
        {
          textOverrideIcon: <XMarkIcon color={ColorPalette["gray-200"]} />,
          size: "large",
          color: "secondary",
          style: {
            width: "3.25rem",
          },
          onClick: async () => {
            if (icnsInteractionStore.waitingData) {
              await icnsInteractionStore.rejectWithProceedNext(
                icnsInteractionStore.waitingData.id,
                (proceedNext) => {
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
            }
          },
        },
        {
          text: intl.formatMessage({ id: "button.approve" }),
          size: "large",
          type: "submit",
          left: !isLoading && <ApproveIcon />,
          isLoading,
          disabled: icnsInteractionStore.waitingData == null,
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        if (icnsInteractionStore.waitingData) {
          await icnsInteractionStore.approveWithProceedNext(
            icnsInteractionStore.waitingData.id,
            (proceedNext) => {
              if (!proceedNext) {
                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  handleExternalInteractionWithNoProceedNext();
                }
              }
            }
          );
        }
      }}
    >
      <Box height="100%" padding="0.75rem" paddingBottom="0">
        <Box alignX="center">
          <Image
            alt="Keplr Logo Image"
            src={require("../../../../public/assets/icns-logo.svg")}
            style={{ width: "4.625rem", height: "4.625rem" }}
          />

          <Gutter size="1.125rem" />

          <H2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-600"]
                : ColorPalette["gray-10"]
            }
          >
            <FormattedMessage id="page.sign.icns.title" />
          </H2>

          <Gutter size="1rem" />

          <Body1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            {icnsInteractionStore.waitingData?.data.origin || ""}
          </Body1>

          <Gutter size="1rem" />
        </Box>
        <Box
          style={{
            flex: 1,
            overflow: "auto",
          }}
          borderRadius="0.5rem"
        >
          <Box>
            {(icnsInteractionStore.waitingData?.data.accountInfos ?? []).map(
              (accountInfo, index) => {
                const isLast =
                  index ===
                  (icnsInteractionStore.waitingData?.data.accountInfos ?? [])
                    .length -
                    1;

                return (
                  <Box
                    key={accountInfo.chainId}
                    backgroundColor={
                      theme.mode === "light"
                        ? ColorPalette.white
                        : ColorPalette["gray-600"]
                    }
                    style={{
                      overflow: "hidden",
                      borderBottomLeftRadius: isLast ? "0.5rem" : undefined,
                      borderBottomRightRadius: isLast ? "0.5rem" : undefined,
                    }}
                  >
                    <Box alignY="center" paddingX="1.5rem" minHeight="4.25rem">
                      <Subtitle3
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-400"]
                            : ColorPalette["gray-50"]
                        }
                      >
                        {icnsInteractionStore.waitingData?.data.username +
                          "." +
                          accountInfo.bech32Prefix}
                      </Subtitle3>
                      <Gutter size="1px" />
                      <Body2 color={ColorPalette["gray-300"]}>
                        {Bech32Address.shortenAddress(
                          accountInfo.bech32Address,
                          26
                        )}
                      </Body2>
                    </Box>

                    {isLast ? null : (
                      <Box
                        height="1px"
                        backgroundColor={
                          theme.mode === "light"
                            ? ColorPalette["gray-50"]
                            : ColorPalette["gray-500"]
                        }
                      />
                    )}
                  </Box>
                );
              }
            )}
          </Box>
        </Box>
      </Box>
    </HeaderLayout>
  );
});
