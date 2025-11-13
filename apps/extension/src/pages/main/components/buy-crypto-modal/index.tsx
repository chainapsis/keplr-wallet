import React, { FunctionComponent, useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Subtitle1 } from "../../../../components/typography";
import { Box } from "../../../../components/box";
import { useStore } from "../../../../stores";
import { FormattedMessage } from "react-intl";
import { BuySupportServiceInfo } from "../../../../hooks/use-buy-support-service-infos";
import { ArrowLeftIcon, LoadingIcon } from "../../../../components/icon";
import { Column, Columns } from "../../../../components/column";
import { SceneTransitionContextBase } from "../../../../components/transition/scene/internal";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";

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
  BackButtonContainer: styled.div`
    padding: 0.25rem;
    cursor: pointer;
    &:hover {
      opacity: ${COMMON_HOVER_OPACITY};
    }
  `,
};

export const BuyCryptoModal: FunctionComponent<{
  close: () => void;
  buySupportServiceInfos: BuySupportServiceInfo[];
  showBackButton?: boolean;
}> = observer(({ close, buySupportServiceInfos, showBackButton }) => {
  const theme = useTheme();
  const sceneTransition = useContext(SceneTransitionContextBase);

  return (
    <Styles.Container>
      {showBackButton ? (
        <Columns sum={1} alignY="center">
          <Styles.BackButtonContainer
            onClick={() => {
              if (sceneTransition) {
                sceneTransition.pop();
              } else {
                close();
              }
            }}
          >
            <ArrowLeftIcon
              width="1.5rem"
              height="1.5rem"
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            />
          </Styles.BackButtonContainer>

          <Column weight={1} />

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
          <Column weight={1} />
          {/* 제목을 중앙 정렬시키기 위해서 뒤로가기 버튼과 맞춰야한다. 이를 위한 mock임 */}
          <Box width="2rem" height="2rem" />
        </Columns>
      ) : (
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
      )}

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
  serviceInfo: BuySupportServiceInfo;
  close: () => void;
}> = ({ serviceInfo, close }) => {
  const { analyticsStore } = useStore();

  const [isLoading, setIsLoading] = useState(false);

  if (serviceInfo.getBuyUrl === undefined) {
    return null;
  }

  return (
    <Styles.ItemContainer
      onClick={async () => {
        analyticsStore.logEvent("click_buy_onrampProvider", {
          onRampProvider: serviceInfo.serviceName,
        });

        setIsLoading(true);

        try {
          if (!serviceInfo.getBuyUrl) {
            throw new Error("Buy URL is missing");
          }

          const url = await serviceInfo.getBuyUrl();

          await browser.tabs.create({
            url,
          });
        } catch (e) {
          console.log(e);
        } finally {
          setIsLoading(false);
        }

        close();
      }}
    >
      {!isLoading ? (
        <React.Fragment>
          <Box>
            <img
              src={require(`../../../../public/assets/img/fiat-on-ramp/${serviceInfo.serviceId}.svg`)}
              alt={`buy ${serviceInfo.serviceId} button`}
            />
          </Box>
          <Styles.ItemName>{serviceInfo.serviceName}</Styles.ItemName>
        </React.Fragment>
      ) : (
        <LoadingIcon width="1.75rem" height="1.75rem" />
      )}
    </Styles.ItemContainer>
  );
};
