import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { PermissionData } from "@keplr-wallet/background";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { HeaderLayout } from "../../../layouts/header";
import { Box } from "../../../components/box";
import { Image } from "../../../components/image";
import { Body1, Body2, H2, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { Dropdown } from "../../../components/dropdown";

export const PermissionBasicAccessForEVMPage: FunctionComponent<{
  data: {
    ids: string[];
  } & PermissionData;
}> = observer(({ data }) => {
  const { chainStore, permissionStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

  const interactionInfo = useInteractionInfo();

  const [currentChainIdForEVM, setCurrentChainIdForEVM] = useState<
    string | undefined
  >(!data.options?.isUnableToChangeChainInUI ? data.chainIds[0] : undefined);

  return (
    <HeaderLayout
      title=""
      fixedHeight={true}
      bottomButton={{
        text: intl.formatMessage({
          id: "button.approve",
        }),
        size: "large",
        isLoading: (() => {
          const obsolete = data.ids.find((id) => {
            return permissionStore.isObsoleteInteraction(id);
          });
          return !!obsolete;
        })(),
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        await permissionStore.approvePermissionWithProceedNext(
          data.ids,
          (proceedNext) => {
            if (!proceedNext) {
              if (
                interactionInfo.interaction &&
                !interactionInfo.interactionInternal
              ) {
                window.close();
              }
            }
          },
          currentChainIdForEVM
        );
      }}
    >
      <Box height="100%" padding="0.75rem" paddingBottom="0">
        <Box alignX="center">
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
            {data.origins.join(", ")}
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
          {!data.options?.isUnableToChangeChainInUI ? (
            <Box style={{ paddingTop: "1.125rem" }}>
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
                style={{ paddingLeft: "0.5rem", paddingBottom: "0.5rem" }}
              >
                Connect
              </Body2>
              <Dropdown
                items={chainStore.chainInfos
                  .filter((chainInfo) =>
                    chainStore.isEvmChain(chainInfo.chainId)
                  )
                  .map((chainInfo) => ({
                    key: `${chainInfo.chainId}`,
                    label: chainInfo.chainName,
                  }))}
                onSelect={(chainId) => setCurrentChainIdForEVM(chainId)}
                selectedItemKey={currentChainIdForEVM}
                style={{ padding: "1rem", height: "auto" }}
              />
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-300"]
                    : ColorPalette["gray-200"]
                }
                style={{
                  marginTop: "2.375rem",
                  textAlign: "center",
                }}
              >
                {"You are connecting to an EVM compatible chain."}
                <br />
                <br />
                {
                  "Please select from the dropdown which chain you'd like to connect for the application."
                }
              </Body2>
            </Box>
          ) : (
            <Box
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette.white
                  : ColorPalette["gray-600"]
              }
              style={{
                overflow: "hidden",
                borderBottomLeftRadius: "0.5rem",
                borderBottomRightRadius: "0.5rem",
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
                  {chainStore.getChain(data.chainIds[0]).chainName}
                </Subtitle3>
              </Box>
              <Box
                height="1px"
                backgroundColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-50"]
                    : ColorPalette["gray-500"]
                }
              />
            </Box>
          )}
        </Box>
      </Box>
    </HeaderLayout>
  );
});
