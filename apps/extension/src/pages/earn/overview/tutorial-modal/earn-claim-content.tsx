import React, { FunctionComponent, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { XAxis } from "../../../../components/axis";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { Gutter } from "../../../../components/gutter";
import {
  H4,
  Body3,
  Subtitle4,
  Button2,
} from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Image } from "../../../../components/image";

export const EarnClaimContent: FunctionComponent<{
  tokenName: string;
  moveToNext: () => void;
  moveToPrev: () => void;
  isLightMode: boolean;
}> = ({ tokenName, moveToNext, moveToPrev, isLightMode }) => (
  <Fragment>
    <Box paddingY="1.25rem">
      <H4
        color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}
        style={{ textAlign: "center" }}
      >
        <FormattedMessage
          id="page.earn.overview.tutorial-modal.claim.title"
          values={{ tokenName }}
        />
      </H4>
    </Box>
    <Body3
      color={isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]}
      style={{ textAlign: "center" }}
    >
      <FormattedMessage
        id="page.earn.overview.tutorial-modal.claim.paragraph"
        values={{ tokenName }}
      />
    </Body3>
    <Gutter size="1.125rem" />

    <SampleClaimAllRewardCard isLightMode={isLightMode} />
    <Gutter size="1.5rem" />

    <XAxis>
      <Button
        size="medium"
        color="secondary"
        text={<FormattedMessage id="button.go-back" />}
        onClick={moveToPrev}
      />
      <Gutter size="0.75rem" />
      <Button
        size="medium"
        color="primary"
        text={
          <FormattedMessage id="page.earn.overview.tutorial-modal.claim.open-earn-overview-button" />
        }
        onClick={moveToNext}
        style={{ flex: 1 }}
      />
    </XAxis>
  </Fragment>
);

const SampleClaimAllRewardCard: FunctionComponent<{
  isLightMode: boolean;
}> = ({ isLightMode }) => (
  <Box position="relative" style={{ cursor: "default" }}>
    <Box
      zIndex={1}
      paddingX="1rem"
      paddingY="0.75rem"
      backgroundColor={
        isLightMode ? ColorPalette.white : ColorPalette["gray-650"]
      }
      style={
        isLightMode
          ? { boxShadow: "0px 1px 4px 0px rgba(43, 39, 55, 0.10)" }
          : {}
      }
      borderRadius="0.5rem"
    >
      <XAxis>
        <Box>
          <Subtitle4 color={ColorPalette["gray-300"]}>
            <FormattedMessage id="page.earn.overview.tutorial-modal.claim.pending-reward" />
          </Subtitle4>
          <Gutter size="0.5rem" />
          <Subtitle4 color={ColorPalette["gray-200"]}>$200,000</Subtitle4>
        </Box>
        <Box
          paddingX="1rem"
          paddingY="0.5rem"
          style={{
            marginLeft: "auto",
            borderRadius: "0.5rem",
            border: `5px solid ${isLightMode ? "#E1E5FB" : "#23242D"}`,
            background: ColorPalette["blue-400"],
            boxSizing: "border-box",
            maxHeight: "max-content",
          }}
        >
          <Button2 color={ColorPalette.white}>
            <FormattedMessage id="page.earn.overview.tutorial-modal.claim.claim-all-button-in-card" />
          </Button2>
        </Box>
      </XAxis>
    </Box>
    <Image
      width="28px"
      height="29px"
      src={require("../../../../public/assets/img/icon-click-pointer.png")}
      alt="click-pointer"
      style={{
        zIndex: 2,
        position: "absolute",
        bottom: 5,
        right: 5,
      }}
    />
  </Box>
);
