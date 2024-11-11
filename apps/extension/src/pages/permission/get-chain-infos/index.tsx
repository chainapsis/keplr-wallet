import React, { FunctionComponent } from "react";
import {
  GlobalPermissionData,
  InteractionWaitingData,
} from "@keplr-wallet/background";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { Box } from "../../../components/box";
import { Image } from "../../../components/image";
import { Gutter } from "../../../components/gutter";
import { Body1, Body2, H2 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { handleExternalInteractionWithNoProceedNext } from "../../../utils";
import { XMarkIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { ApproveIcon } from "../../../components/button";

export const GlobalPermissionGetChainInfosPage: FunctionComponent<{
  data: InteractionWaitingData<GlobalPermissionData>;
}> = observer(({ data }) => {
  const { permissionStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();
  const navigate = useNavigate();

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await permissionStore.rejectPermissionWithProceedNext(data.id, () => {});
    },
  });

  const isLoading = permissionStore.isObsoleteInteraction(data.id);

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
            await permissionStore.rejectPermissionWithProceedNext(
              data.id,
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
          },
        },
        {
          text: intl.formatMessage({
            id: "button.approve",
          }),
          size: "large",
          type: "submit",
          left: !isLoading && <ApproveIcon />,
          isLoading,
        },
      ]}
      onSubmit={async (e) => {
        e.preventDefault();

        await permissionStore.approveGlobalPermissionWithProceedNext(
          data.id,
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
      }}
    >
      <Box height="100%" padding="0.75rem">
        <Box alignX="center">
          <Gutter size="2.5rem" />
          <Image
            alt="Keplr Logo Image"
            src={require("../../../public/assets/logo-256.png")}
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
            <FormattedMessage id="page.permission.requesting-connection-title" />
          </H2>

          <Gutter size="1rem" />

          <Body1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
          >
            {data.data.origins.join(", ")}
          </Body1>
        </Box>

        <Box
          alignX="center"
          alignY="center"
          style={{
            flex: 1,
          }}
        >
          <Body2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-300"]
                : ColorPalette["gray-200"]
            }
            style={{
              lineHeight: 1.215,
            }}
          >
            <FormattedMessage
              id="page.permission.paragraph"
              values={{
                br: <br />,
              }}
            />
          </Body2>
        </Box>
      </Box>
    </HeaderLayout>
  );
});
