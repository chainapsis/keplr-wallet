import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import {
  InteractionWaitingData,
  PermissionData,
} from "@keplr-wallet/background";
import { useStore } from "../../../stores";
import { useInteractionInfo } from "../../../hooks";
import { HeaderLayout } from "../../../layouts/header";
import { Box } from "../../../components/box";
import { Image } from "../../../components/image";
import { Body1, H2, Subtitle3 } from "../../../components/typography";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";

export const PermissionBasicAccessPage: FunctionComponent<{
  data: InteractionWaitingData<PermissionData>;
}> = observer(({ data }) => {
  const { chainStore, permissionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    permissionStore.rejectPermissionAll();
  });

  const chainInfos = chainStore.chainInfos.map((chainInfo) => {
    return {
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
    };
  });

  return (
    <HeaderLayout
      title=""
      bottomButton={{
        text: "Approve",
        size: "large",
        disabled: permissionStore.waitingPermissionData == null,
        isLoading: permissionStore.isObsoleteInteraction(
          permissionStore.waitingPermissionData?.id
        ),
        onClick: async () => {
          await permissionStore.approvePermissionWithProceedNext(
            data.id,
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
        },
      }}
    >
      <Box padding="0.75rem" alignX="center">
        <Image
          alt="Keplr Logo Image"
          src={require("../../../public/assets/logo-256.png")}
          style={{ width: "4.625rem", height: "4.625rem" }}
        />

        <Gutter size="1.125rem" />

        <H2 color={ColorPalette["gray-10"]}>Requesting Connection</H2>

        <Gutter size="1rem" />

        <Body1 color={ColorPalette["gray-200"]}>
          {data.data.origins.join(", ")}
        </Body1>

        <Gutter size="1rem" />

        <Box
          width="100%"
          backgroundColor={ColorPalette["gray-600"]}
          borderRadius="0.5rem"
        >
          {data.data.chainIds.map((chainId, index) => {
            const chainInfo = chainInfos.find(
              (chainInfo) => chainInfo.chainId === chainId
            );

            return (
              <Box key={chainId}>
                <Subtitle3
                  color={ColorPalette["gray-50"]}
                  style={{ padding: "1.5rem" }}
                >
                  {chainInfo?.chainName}
                </Subtitle3>

                {data.data.chainIds.length === 0 ||
                index === data.data.chainIds.length - 1 ? null : (
                  <Box
                    height="1px"
                    backgroundColor={ColorPalette["gray-500"]}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </HeaderLayout>
  );
});
