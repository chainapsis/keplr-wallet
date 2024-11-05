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
import { useNavigate } from "react-router";

export const GlobalPermissionGetChainInfosPage: FunctionComponent<{
  data: InteractionWaitingData<GlobalPermissionData>;
}> = observer(({ data }) => {
  const { permissionStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const interactionInfo = useInteractionInfo();

  const navigate = useNavigate();

  return (
    <HeaderLayout
      title=""
      fixedHeight={true}
      bottomButtons={[
        {
          text: intl.formatMessage({
            id: "button.reject",
          }),
          size: "large",
          color: "secondary",
          onClick: () => {
            navigate("/", { replace: true });
          },
        },
        {
          text: intl.formatMessage({
            id: "button.approve",
          }),
          size: "large",
          type: "submit",
          isLoading: permissionStore.isObsoleteInteraction(data.id),
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
