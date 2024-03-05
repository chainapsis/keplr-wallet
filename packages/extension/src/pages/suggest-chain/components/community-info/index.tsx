import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Image } from "../../../../components/image";
import { Gutter } from "../../../../components/gutter";
import { Columns } from "../../../../components/column";
import { H1, Body2 } from "../../../../components/typography";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { observer } from "mobx-react-lite";
import { Skeleton } from "../../../../components/skeleton";
import { ChainInfo } from "@keplr-wallet/types";
import { FormattedMessage, useIntl } from "react-intl";
import { TextButton } from "../../../../components/button-text";

const Styles = {
  Chip: styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.25rem;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-400"]
        : ColorPalette["gray-100"]};
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-50"]
        : ColorPalette["gray-500"]};

    padding: 0.375rem 0.75rem;
    border-radius: 2.5rem;

    cursor: pointer;
  `,
  Paragraph: styled(Body2)`
    text-align: center;
    color: ${ColorPalette["gray-300"]};
  `,
  Bold: styled.span`
    font-weight: 600;
    font-size: 14px;
    margin-right: 0.125rem;
  `,
};

export const CommunityInfoView: FunctionComponent<{
  isNotReady?: boolean;
  communityChainInfoUrl: string;
  origin: string;
  chainInfo: ChainInfo;
  setUpdateFromRepoDisabled?: () => void;
}> = observer(
  ({
    isNotReady,
    communityChainInfoUrl,
    origin,
    chainInfo,
    setUpdateFromRepoDisabled,
  }) => {
    const intl = useIntl();

    return (
      <Box
        paddingTop="3.75rem"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
        }}
      >
        <XAxis alignY="center">
          <Skeleton isNotReady={isNotReady} type="circle">
            <Image
              width="80px"
              height="80px"
              alt="Chain Image"
              defaultSrc={require("../../../../public/assets/img/chain-icon-alt.png")}
              src={chainInfo.chainSymbolImageUrl}
              style={{ borderRadius: "50%" }}
            />
          </Skeleton>

          <Gutter size="1.25rem" />

          <Columns sum={1} gutter="0.75rem">
            <Skeleton isNotReady={isNotReady} type="circle">
              <DotIcon />
            </Skeleton>
            <Skeleton isNotReady={isNotReady} type="circle">
              <DotIcon />
            </Skeleton>
            <Skeleton isNotReady={isNotReady} type="circle">
              <DotIcon />
            </Skeleton>
          </Columns>

          <Gutter size="1.25rem" />

          <Skeleton isNotReady={isNotReady} type="circle">
            <Image
              width="80px"
              height="80px"
              alt="Chain Image"
              style={{ borderRadius: "50%" }}
              defaultSrc={require("../../../../public/assets/img/chain-icon-alt.png")}
              src={require("../../../../public/assets/logo-256.png")}
            />
          </Skeleton>
        </XAxis>

        <Gutter size="2rem" />

        <Skeleton isNotReady={isNotReady}>
          <H1 style={{ textAlign: "center" }}>
            <FormattedMessage
              id="page.suggest-chain.title"
              values={{ chainName: chainInfo.chainName }}
            />
          </H1>
        </Skeleton>

        <Gutter size="0.75rem" />

        <a
          href={communityChainInfoUrl}
          target="_blank"
          rel="noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Skeleton isNotReady={isNotReady}>
            <Styles.Chip>
              <FormattedMessage id="page.suggest-chain.community-info-view.community-driven-chip" />
              <Box>
                <GithubIcon />
              </Box>
            </Styles.Chip>
          </Skeleton>
        </a>

        <Gutter size="1.15rem" />

        <Box paddingX="2.5rem">
          <Skeleton isNotReady={isNotReady}>
            <Styles.Paragraph>
              <FormattedMessage
                id="page.suggest-chain.community-info-view.paragraph"
                values={{
                  b: (...chunks: any) => <b>{chunks}</b>,
                  origin,
                  chainId: chainInfo?.chainId,
                }}
              />
            </Styles.Paragraph>
          </Skeleton>
        </Box>

        <Box style={{ flex: 1 }} />

        <Skeleton isNotReady={isNotReady}>
          <TextButton
            text={intl.formatMessage({
              id: "page.suggest-chain.community-info-view.add-chain-as-suggested-button",
            })}
            onClick={setUpdateFromRepoDisabled}
            right={<ArrowRightIcon />}
          />
        </Skeleton>
      </Box>
    );
  }
);

const DotIcon: FunctionComponent = () => (
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="4" r="4" fill="#AFD7F3" />
  </svg>
);

const GithubIcon: FunctionComponent = () => (
  <svg
    width="14"
    height="15"
    viewBox="0 0 14 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 0.672607C3.13483 0.672607 0 3.80686 0 7.67261C0 10.7654 2.0055 13.3893 4.78742 14.315C5.13683 14.3798 5.25 14.1628 5.25 13.9784V12.6753C3.30283 13.0988 2.89742 11.8493 2.89742 11.8493C2.57892 11.0402 2.11983 10.8249 2.11983 10.8249C1.48458 10.3904 2.16825 10.3997 2.16825 10.3997C2.87117 10.4487 3.241 11.1213 3.241 11.1213C3.86517 12.1911 4.87842 11.8819 5.278 11.7029C5.34042 11.2508 5.52183 10.9416 5.7225 10.7672C4.16792 10.5893 2.53342 9.98902 2.53342 7.30744C2.53342 6.54269 2.807 5.91852 3.25442 5.42852C3.18208 5.25177 2.94233 4.53952 3.32267 3.57586C3.32267 3.57586 3.91067 3.38802 5.24825 4.29336C5.8065 4.13819 6.405 4.06061 7 4.05769C7.595 4.06061 8.19408 4.13819 8.7535 4.29336C10.0899 3.38802 10.6767 3.57586 10.6767 3.57586C11.0577 4.54011 10.8179 5.25236 10.7456 5.42852C11.1947 5.91852 11.466 6.54327 11.466 7.30744C11.466 9.99602 9.82858 10.5881 8.26992 10.7614C8.52075 10.9784 8.75 11.4042 8.75 12.0575V13.9784C8.75 14.1645 8.862 14.3833 9.21725 14.3144C11.9968 13.3875 14 10.7643 14 7.67261C14 3.80686 10.8657 0.672607 7 0.672607Z"
      fill="currentColor"
    />
  </svg>
);

const ArrowRightIcon: FunctionComponent = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path
      fill="none"
      d="M6.1875 3.375L11.8125 9L6.1875 14.625"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
