import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { InteractionWaitingData } from "@keplr-wallet/background";
import { ChainInfo } from "@keplr-wallet/types";
import { useIntl } from "react-intl";
import styled, { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";
import { WarningBox } from "../../../../components/warning-box";

const Styles = {
  Chip: styled.div`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-200"]};
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-50"]
        : ColorPalette["gray-500"]};

    padding: 0.375rem 0.75rem;
    border-radius: 2.5rem;
  `,
};

export const OriginInfoView: FunctionComponent<{
  waitingData: InteractionWaitingData<{
    chainInfo: ChainInfo;
    origin: string;
  }>;
}> = observer(({ waitingData }) => {
  const chainInfo = waitingData.data.chainInfo;
  const intl = useIntl();
  const theme = useTheme();

  return (
    <Box paddingX="0.75rem" height="100%">
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Styles.Chip>{waitingData.data.origin}</Styles.Chip>
        <Gutter size="0.375rem" />
        <Box
          style={{
            display: "flex",
            width: "100%",
            padding: "1rem",
            backgroundColor:
              theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-600"],
            borderRadius: "0.375rem",
            boxShadow:
              theme.mode === "light"
                ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
                : "none",

            overflow: "auto",
          }}
        >
          <Box
            as={"pre"}
            style={{ margin: 0 }}
            color={
              theme.mode === "light"
                ? ColorPalette["gray-400"]
                : ColorPalette["gray-10"]
            }
          >
            {JSON.stringify(chainInfo, null, 2)}
          </Box>
        </Box>

        <Box>
          <Gutter size="0.75rem" />

          <Box style={{ flex: 1 }} />

          <WarningBox
            title={intl.formatMessage({
              id: "page.suggest-chain.origin-info-view.guide-title",
            })}
            paragraph={intl.formatMessage({
              id: "page.suggest-chain.origin-info-view.guide-paragraph",
            })}
          />
        </Box>
      </Box>
    </Box>
  );
});
