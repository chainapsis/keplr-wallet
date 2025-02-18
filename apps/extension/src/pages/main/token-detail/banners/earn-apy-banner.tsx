import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { PercentageIcon } from "../../../../components/icon";
import { IconInCircle } from "../icon-in-circle";
import { YAxis } from "../../../../components/axis";
import { Subtitle3 } from "../../../../components/typography";
import { useIntl } from "react-intl";
import { Button } from "../../../../components/button";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { ApyChip } from "../../../earn/components/chip";
import { useNavigate } from "react-router";

export const EarnApyBanner: FunctionComponent<{
  chainId: string;
}> = ({ chainId }) => {
  const intl = useIntl();
  const navigate = useNavigate();

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
      backgroundColor={ColorPalette["gray-650"]}
      padding="1rem"
      marginX="0.75rem"
      marginTop="19px"
      borderRadius="0.375rem"
    >
      <IconInCircle
        icon={<PercentageIcon width="0.75rem" height="0.75rem" />}
      />
      <Gutter size="0.75rem" />
      <YAxis gap="0.375rem">
        <Subtitle3>
          {intl.formatMessage({
            id: "page.token-detail.earn-apy-banner.title",
          })}
        </Subtitle3>
        <ApyChip chainId={chainId} colorType="green" />
      </YAxis>
      <Button
        color="primary"
        size="small"
        text={intl.formatMessage({
          id: "page.token-detail.earn-apy-banner.start-earn-button",
        })}
        style={{ marginLeft: "auto" }}
        onClick={() => {
          navigate(
            `/earn/amount?chainId=${chainId}&coinMinimalDenom=${"uusdc"}`
          );
        }}
      />
    </Box>
  );
};
