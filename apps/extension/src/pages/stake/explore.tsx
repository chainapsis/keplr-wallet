import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { MainHeaderLayout } from "../main/layouts/header";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { MainH1 } from "../../components/typography/main-h1";
import { useIntl } from "react-intl";
import { Gutter } from "../../components/gutter";
import {
  Subtitle3,
  Button2,
  Subtitle2,
  Body3,
} from "../../components/typography";
import { XAxis } from "../../components/axis";
import { VerticalCollapseTransition } from "../../components/transition/vertical-collapse";
import { ArrowDownIcon, ArrowUpIcon } from "../../components/icon";
import {
  BuyButtonWhenFirstTime,
  BuyCryptoModal,
  ReceiveButtonWhenFirstTime,
} from "../main/components";
import { Modal } from "../../components/modal";
import { DepositModal } from "../main/components/deposit-modal";
import { useBuySupportServiceInfos } from "../../hooks/use-buy-support-service-infos";
import { useStore } from "../../stores";
import { ViewToken } from "../main";
import { CurrencyImageFallback } from "../../components/image";
import { useGetStakingApr } from "../../hooks/use-get-staking-apr";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconProps } from "../../components/icon/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";

export const StakeExplorePage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const intl = useIntl();

  const [searchParams, _] = useSearchParams();

  const { hugeQueriesStore } = useStore();

  const [isOpenDepositModal, setIsOpenDepositModal] = React.useState(false);
  const [isOpenBuy, setIsOpenBuy] = React.useState(false);

  const buySupportServiceInfos = useBuySupportServiceInfos();

  const showBackButton = searchParams.get("showBackButton") === "true";

  const priority = (chainId: string) => {
    const id = ChainIdHelper.parse(chainId).identifier;
    if (id === "cosmoshub") return 0;
    if (id === "osmosis") return 1;
    if (id === "injective") return 2;
    if (id === "starknet:SN_MAIN") return 3;
    return 4;
  };

  const stakables = [...hugeQueriesStore.stakables].sort(
    (a, b) => priority(a.chainInfo.chainId) - priority(b.chainInfo.chainId)
  );

  return (
    <MainHeaderLayout
      headerContainerStyle={{
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor:
          theme.mode === "light"
            ? ColorPalette["gray-100"]
            : ColorPalette["gray-500"],
      }}
    >
      <Box paddingX="1rem" paddingY="1.25rem">
        {showBackButton ? <BackButton /> : null}

        <Gutter size="1.25rem" />

        <Box paddingX="0.25rem">
          <MainH1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["white"]
            }
          >
            {intl.formatMessage({ id: "page.stake.explore.title" })}
          </MainH1>
        </Box>

        <Gutter size="0.75rem" />

        <Subtitle3 color={ColorPalette["blue-300"]}>
          {intl.formatMessage({ id: "page.stake.explore.subtitle" })}
        </Subtitle3>

        <Gutter size="1.25rem" />

        <XAxis>
          <ReceiveButtonWhenFirstTime
            onClick={() => setIsOpenDepositModal(true)}
          />
          <Gutter size="0.75rem" />
          <BuyButtonWhenFirstTime onClick={() => setIsOpenBuy(true)} />
        </XAxis>

        <Gutter size="1.25rem" />

        <CollapsibleGrid
          items={stakables.map((stakable) => (
            <AssetCard
              key={`${stakable.chainInfo.chainId}-${stakable.token.currency.coinMinimalDenom}`}
              viewToken={stakable}
            />
          ))}
        />
      </Box>

      <Modal
        isOpen={isOpenDepositModal}
        align="bottom"
        close={() => setIsOpenDepositModal(false)}
        /* Simplebar를 사용하면 트랜지션이 덜덜 떨리는 문제가 있다... */
        forceNotUseSimplebar={true}
      >
        <DepositModal close={() => setIsOpenDepositModal(false)} />
      </Modal>

      <Modal
        isOpen={isOpenBuy}
        align="bottom"
        close={() => setIsOpenBuy(false)}
      >
        <BuyCryptoModal
          close={() => setIsOpenBuy(false)}
          buySupportServiceInfos={buySupportServiceInfos}
        />
      </Modal>
    </MainHeaderLayout>
  );
});

const CollapsibleGrid: FunctionComponent<{
  items: React.ReactNode[];
  lenAlwaysShown?: number;
}> = ({ items, lenAlwaysShown }) => {
  if (!lenAlwaysShown || lenAlwaysShown < 0) {
    lenAlwaysShown = 4;
  }

  const intl = useIntl();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const alwaysShown = items.slice(0, lenAlwaysShown);
  const hidden = items.slice(lenAlwaysShown);

  return (
    <Box>
      <Styles.AssetCardsGrid>{alwaysShown}</Styles.AssetCardsGrid>

      <VerticalCollapseTransition collapsed={isCollapsed}>
        <React.Fragment>
          <Gutter size="0.75rem" />
          <Styles.AssetCardsGrid>{hidden}</Styles.AssetCardsGrid>
        </React.Fragment>
      </VerticalCollapseTransition>

      {hidden.length > 0 ? (
        <Styles.MoreViewContainer
          onClick={(e) => {
            e.preventDefault();
            setIsCollapsed(!isCollapsed);
          }}
        >
          <Gutter size="1.25rem" />
          <XAxis alignY="center">
            <Button2>
              {isCollapsed
                ? intl.formatMessage(
                    {
                      id: "components.collapsible-list.view-more-tokens",
                    },
                    { remain: hidden.length }
                  )
                : intl.formatMessage({
                    id: "components.collapsible-list.collapse",
                  })}
            </Button2>

            <Gutter size="0.25rem" />

            {isCollapsed ? (
              <ArrowDownIcon width="1rem" height="1rem" />
            ) : (
              <ArrowUpIcon width="1rem" height="1rem" />
            )}
          </XAxis>
        </Styles.MoreViewContainer>
      ) : null}
    </Box>
  );
};

const AssetCard: FunctionComponent<{
  viewToken: ViewToken;
}> = observer(({ viewToken }) => {
  const stakingAprDec = useGetStakingApr(viewToken.chainInfo.chainId);
  const theme = useTheme();

  return (
    <Styles.AssetCard
      onClick={() => {
        // TODO: open copy address modal
      }}
    >
      <CurrencyImageFallback
        chainInfo={viewToken.chainInfo}
        currency={viewToken.token.currency}
        size="2rem"
      />
      <Gutter size="0.75rem" />
      <XAxis alignY="bottom">
        <Subtitle2
          color={
            theme.mode === "light"
              ? ColorPalette["gray-700"]
              : ColorPalette["gray-10"]
          }
        >
          {viewToken.token.currency.coinDenom}
        </Subtitle2>
        <Gutter size="0.25rem" />
        <Subtitle3 color={ColorPalette["gray-200"]}>
          {stakingAprDec ? `APR ${stakingAprDec.toString(0)}%` : undefined}
        </Subtitle3>
      </XAxis>
      <Gutter size="0.25rem" />
      <Body3 color={ColorPalette["gray-300"]}>
        {viewToken.chainInfo.chainName}
      </Body3>
    </Styles.AssetCard>
  );
});

function BackButton() {
  const navigate = useNavigate();

  if (window.history.state && window.history.state.idx === 0) {
    return null;
  }

  return (
    <Box cursor="pointer" onClick={() => navigate(-1)}>
      <ArrowLeftIcon
        width="1.5rem"
        height="1.5rem"
        color={ColorPalette["gray-300"]}
      />
    </Box>
  );
}

const Styles = {
  AssetCardsGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  `,

  AssetCard: styled.div`
    display: flex;
    flex-direction: column;
    width: 9.875rem;
    height: 8rem;
    padding: 0.75rem 1rem;
    align-items: flex-start;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 1.25rem;
    border: 1px solid ${ColorPalette["gray-450"]};
    cursor: pointer;

    :hover {
      opacity: 0.7;
    }
  `,

  MoreViewContainer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    cursor: pointer;

    color: ${ColorPalette["gray-300"]};

    :hover {
      color: ${(props) =>
        props.theme.mode === "light"
          ? ColorPalette["gray-200"]
          : ColorPalette["gray-400"]};
    }
  `,
};

const ArrowLeftIcon: FunctionComponent<IconProps> = ({
  width,
  height,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M10.5 19.5L3 12M3 12L10.5 4.5M3 12H21"
        stroke={color || "currentColor"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
