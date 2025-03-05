import Color from "color";
import React, { FunctionComponent, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { XAxis } from "../../../../components/axis";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { Gutter } from "../../../../components/gutter";
import { H4, Body3, Subtitle4 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { Image } from "../../../../components/image";

export const ManageEarnContent: FunctionComponent<{
  denom: string;
  coinImageUrl: string;
  onNext: () => void;
  isLightMode: boolean;
}> = ({ denom, coinImageUrl, onNext, isLightMode }) => (
  <Fragment>
    <Box paddingY="1.25rem">
      <H4
        color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}
        style={{ textAlign: "center" }}
      >
        <FormattedMessage
          id="page.earn.overview.tutorial-modal.manage-earn.title"
          values={{ tokenName: denom }}
        />
      </H4>
    </Box>
    <Body3
      color={isLightMode ? ColorPalette["gray-400"] : ColorPalette["gray-200"]}
      style={{ textAlign: "center" }}
    >
      <FormattedMessage
        id="page.earn.overview.tutorial-modal.manage-earn.paragraph"
        values={{ tokenName: denom }}
      />
    </Body3>
    <Gutter size="1.125rem" />

    <SampleTokenItemCard
      denom={denom}
      coinImageUrl={coinImageUrl}
      isLightMode={isLightMode}
    />
    <Gutter size="1.625rem" />

    <Button
      size="medium"
      color="primary"
      text={
        <FormattedMessage id="page.earn.overview.tutorial-modal.manage-earn.next-button" />
      }
      onClick={onNext}
    />
  </Fragment>
);

const SampleTokenItemCard: FunctionComponent<{
  denom: string;
  coinImageUrl: string;
  isLightMode: boolean;
}> = ({ denom, coinImageUrl, isLightMode }) => {
  return (
    <Box position="relative" style={{ cursor: "default" }}>
      <Box
        zIndex={2}
        paddingX="1rem"
        paddingY="0.75rem"
        backgroundColor={
          isLightMode ? ColorPalette.white : ColorPalette["gray-650"]
        }
        borderRadius="0.5rem"
        style={
          isLightMode
            ? { boxShadow: "0px 1px 4px 0px rgba(43, 39, 55, 0.10)" }
            : {}
        }
      >
        <XAxis alignY="center">
          <Image src={coinImageUrl} width="24px" height="24px" alt={denom} />
          <Gutter size="0.75rem" />
          <Subtitle4
            color={isLightMode ? ColorPalette["gray-700"] : ColorPalette.white}
          >
            {denom}
          </Subtitle4>
        </XAxis>
      </Box>
      <Box
        zIndex={1}
        position="relative"
        style={{
          top: "-0.5rem",
          left: 0,
        }}
        paddingTop="0.875rem"
        paddingBottom="0.375rem"
        backgroundColor={
          isLightMode
            ? ColorPalette["green-100"]
            : Color(ColorPalette["green-700"]).alpha(0.2).toString()
        }
        borderRadius="0 0 0.5rem 0.5rem"
      >
        <Body3
          color={
            isLightMode ? ColorPalette["green-600"] : ColorPalette["green-400"]
          }
          style={{ textAlign: "center" }}
        >
          <FormattedMessage
            id="page.main.components.token-item.earn-savings-button"
            values={{ balance: "$100" }}
          />
        </Body3>
      </Box>
      <Image
        src={require("../../../../public/assets/img/circle-wave.png")}
        style={{
          zIndex: 3,
          position: "absolute",
          bottom: "0.125rem",
          right: 63,
        }}
        alt=""
      />
      <Image
        width="28px"
        height="29px"
        src={require("../../../../public/assets/img/icon-click-pointer.png")}
        alt="click-pointer"
        style={{
          zIndex: 4,
          position: "absolute",
          bottom: "-0.5rem",
          right: 53,
        }}
      />
    </Box>
  );
};
