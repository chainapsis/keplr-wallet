import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Subtitle1 } from "../../../../components/typography";
import { FiatOnRampServiceInfo } from "../../../../config.ui";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { FormattedMessage } from "react-intl";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem 0.75rem 0.75rem 0.75rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["white"]
        : ColorPalette["gray-600"]};

    gap: 0.75rem;

    overflow-y: auto;
  `,
  ItemContainer: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    padding: 0.75rem 0;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-50"]
        : ColorPalette["gray-500"]};

    :hover {
      background-color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-100"]
          : ColorPalette["gray-450"]};
    }

    gap: 0.25rem;

    cursor: pointer;

    border-radius: 0.25rem;
  `,
  ItemName: styled(Subtitle1)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-10"]};
  `,
};

export const BuyCryptoModal: FunctionComponent<{
  close: () => void;
  buySupportServiceInfos: (FiatOnRampServiceInfo & { buyUrl?: string })[];
}> = observer(({ close, buySupportServiceInfos }) => {
  const theme = useTheme();

  return (
    <Styles.Container>
      <Subtitle1
        style={{
          color:
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["white"],
          textAlign: "center",
        }}
      >
        <FormattedMessage id="page.main.components.buy-crypto-modal.title" />
      </Subtitle1>

      {buySupportServiceInfos.map((serviceInfo) => {
        return (
          <ServiceItem
            key={serviceInfo.serviceId}
            serviceInfo={serviceInfo}
            close={close}
          />
        );
      })}
    </Styles.Container>
  );
});

const ServiceItem: FunctionComponent<{
  serviceInfo: FiatOnRampServiceInfo & { buyUrl?: string };
  close: () => void;
}> = ({ serviceInfo, close }) => {
  const { analyticsStore } = useStore();

  if (serviceInfo.buyUrl === undefined) {
    return null;
  }

  return (
    <Styles.ItemContainer
      onClick={async () => {
        analyticsStore.logEvent("click_buy_onrampProvider", {
          onRampProvider: serviceInfo.serviceName,
        });

        await browser.tabs.create({
          url: serviceInfo.buyUrl,
        });

        close();
      }}
    >
      <Box>
        <img
          src={require(`../../../../public/assets/img/fiat-on-ramp/${serviceInfo.serviceId}.svg`)}
          alt={`buy ${serviceInfo.serviceId} button`}
        />
      </Box>

      <Styles.ItemName>{serviceInfo.serviceName}</Styles.ItemName>
    </Styles.ItemContainer>
  );
};
