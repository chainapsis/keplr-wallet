import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { XAxis, YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { Body3, Subtitle1, Subtitle3 } from "../../../components/typography";
import { useStore } from "../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { useTheme } from "styled-components";
import {
  ChainInfo,
  ModularChainInfo,
  StarknetChainInfo,
} from "@keplr-wallet/types";
import { ThemeOption } from "../../../theme";

export const StakedBalance: FunctionComponent<{
  modularChainInfo: ModularChainInfo;
}> = observer(({ modularChainInfo }) => {
  if ("starknet" in modularChainInfo) {
    return (
      <StarknetStakedBalance starknetChainInfo={modularChainInfo.starknet} />
    );
  }

  // modularChainInfo가 추가됨에 따라 새로운 분기 처리가 필요할 수 있음

  return <CosmosStakedBalance chainInfo={modularChainInfo.cosmos} />;
});

const CosmosStakedBalance: FunctionComponent<{
  chainInfo: ChainInfo;
}> = observer(({ chainInfo }) => {
  const theme = useTheme();

  const { queriesStore, accountStore, chainStore, uiConfigStore } = useStore();

  const [isHover, setIsHover] = useState(false);

  const chainId = chainInfo.chainId;
  const chain = chainStore.getChain(chainId);

  const queryAPR = queriesStore.simpleQuery.queryGet<{
    overview: {
      apr: number;
    };
    lastUpdated: number;
  }>(
    "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws",
    `/apr/${chain.chainIdentifier}`
  );

  const cosmosAPR =
    queryAPR.response &&
    "apr" in queryAPR.response.data &&
    typeof queryAPR.response.data.apr === "number" &&
    queryAPR.response.data.apr > 0
      ? new Dec(queryAPR.response.data.apr).mul(new Dec(100)).toString(2)
      : null;

  const queryDelegation = queriesStore
    .get(chainId)
    .cosmos.queryDelegations.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address
    );

  const stakeBalanceIsZero =
    !queryDelegation.total || queryDelegation.total.toDec().equals(new Dec(0));

  return (
    <StakedBalanceLayout
      stakingUrl={chain.walletUrlForStaking}
      isHover={isHover}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        {theme.mode === "light" ? (
          <StakingGradientLightIcon />
        ) : (
          <StakingGradientDarkIcon />
        )}
        <Gutter size="0.75rem" />
        <YAxis>
          {(() => {
            if (stakeBalanceIsZero && chain.walletUrlForStaking) {
              return (
                <React.Fragment>
                  <Subtitle1
                    color={
                      theme.mode === "light"
                        ? ColorPalette["black"]
                        : ColorPalette["white"]
                    }
                  >
                    Start Staking
                  </Subtitle1>
                  <Gutter size="0.25rem" />
                  {cosmosAPR && (
                    <Body3
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-300"]
                          : ColorPalette["gray-200"]
                      }
                    >
                      {`${cosmosAPR}% APR`}
                    </Body3>
                  )}
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment>
                  <Body3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                    }
                  >
                    Staked Balance
                  </Body3>
                  <Gutter size="0.25rem" />
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["black"]
                        : ColorPalette["white"]
                    }
                  >
                    {queryDelegation.total
                      ? uiConfigStore.hideStringIfPrivacyMode(
                          queryDelegation.total
                            .maxDecimals(6)
                            .shrink(true)
                            .inequalitySymbol(true)
                            .trim(true)
                            .toString(),
                          2
                        )
                      : "-"}
                  </Subtitle3>
                </React.Fragment>
              );
            }
          })()}
        </YAxis>
        <div
          style={{
            flex: 1,
          }}
        />
        <XAxis alignY="center">
          {!stakeBalanceIsZero && cosmosAPR && typeof cosmosAPR === "string" ? (
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
            >
              {`${cosmosAPR}% APR`}
            </Subtitle3>
          ) : null}

          {chain.walletUrlForStaking ? (
            stakeBalanceIsZero ? (
              <React.Fragment>
                <Gutter size="0.25rem" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke={getStrokeColor(isHover, theme.mode)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    d="M11.25 5H4.375C3.339 5 2.5 5.84 2.5 6.875v8.75c0 1.035.84 1.875 1.875 1.875h8.75c1.036 0 1.875-.84 1.875-1.875V8.75m-8.75 5L17.5 2.5m0 0h-4.375m4.375 0v4.375"
                  />
                </svg>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Gutter size="0.25rem" />
                <Box marginBottom="2px">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <path
                      stroke={getStrokeColor(isHover, theme.mode)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 4.5H3.5A1.5 1.5 0 002 6v7a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0012 13V7.5m-7 4l9-9m0 0h-3.5m3.5 0V6"
                    />
                  </svg>
                </Box>
              </React.Fragment>
            )
          ) : null}
        </XAxis>
      </XAxis>
    </StakedBalanceLayout>
  );
});

const StarknetStakedBalance: FunctionComponent<{
  starknetChainInfo: StarknetChainInfo;
}> = observer(({ starknetChainInfo }) => {
  const { accountStore, starknetQueriesStore, uiConfigStore } = useStore();

  const theme = useTheme();

  const [isHover, setIsHover] = useState(false);

  const chainId = starknetChainInfo.chainId;
  const account = accountStore.getAccount(chainId);

  const queryApr = starknetQueriesStore.get(chainId).queryStakingApr;

  const stakingApr = queryApr.apr ? queryApr.apr.toString(2) : null;

  const queryStakingInfo = starknetQueriesStore
    .get(chainId)
    .stakingInfoManager.getStakingInfo(account.starknetHexAddress);

  const totalStakedAmount = queryStakingInfo?.totalStakedAmount;

  const stakeBalanceIsZero =
    !totalStakedAmount || totalStakedAmount.toDec().equals(new Dec(0));

  return (
    <StakedBalanceLayout
      stakingUrl={"https://dashboard.endur.fi/stake"}
      isHover={isHover}
      onHoverStateChange={setIsHover}
    >
      <XAxis alignY="center">
        {theme.mode === "light" ? (
          stakeBalanceIsZero ? (
            <EndurFiLightIcon />
          ) : (
            <StakingGradientLightIcon />
          )
        ) : stakeBalanceIsZero ? (
          <EndurFiDarkIcon />
        ) : (
          <StakingGradientDarkIcon />
        )}
        <Gutter size="0.75rem" />
        <YAxis>
          {(() => {
            if (stakeBalanceIsZero) {
              return (
                <React.Fragment>
                  <Subtitle1
                    color={
                      theme.mode === "light"
                        ? ColorPalette["black"]
                        : ColorPalette["white"]
                    }
                  >
                    Start Staking
                  </Subtitle1>
                  {stakingApr && (
                    <React.Fragment>
                      <Gutter size="0.25rem" />
                      <Body3
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-300"]
                            : ColorPalette["gray-200"]
                        }
                        style={{
                          lineHeight: "140%",
                        }}
                      >
                        {`${stakingApr}% APR`}
                      </Body3>
                    </React.Fragment>
                  )}
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment>
                  <Body3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                    }
                    style={{
                      lineHeight: "140%",
                    }}
                  >
                    Staked Balance
                  </Body3>
                  <Gutter size="0.25rem" />
                  <Subtitle3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["black"]
                        : ColorPalette["white"]
                    }
                    style={{}}
                  >
                    {totalStakedAmount
                      ? uiConfigStore.hideStringIfPrivacyMode(
                          totalStakedAmount
                            .maxDecimals(6)
                            .shrink(true)
                            .inequalitySymbol(true)
                            .trim(true)
                            .toString(),
                          2
                        )
                      : "-"}
                  </Subtitle3>
                </React.Fragment>
              );
            }
          })()}
        </YAxis>
        <div
          style={{
            flex: 1,
          }}
        />
        <YAxis alignX="right">
          <XAxis alignY="center">
            {stakeBalanceIsZero ? (
              <React.Fragment>
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? isHover
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                      : isHover
                      ? ColorPalette["gray-100"]
                      : ColorPalette["gray-300"]
                  }
                >
                  Endur.fi
                </Subtitle3>
                <Gutter size="0.25rem" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                >
                  <path
                    d="M11.25 5.5H4.375C3.33947 5.5 2.5 6.33947 2.5 7.375V16.125C2.5 17.1605 3.33947 18 4.375 18H13.125C14.1605 18 15 17.1605 15 16.125V9.25M6.25 14.25L17.5 3M17.5 3L13.125 3M17.5 3V7.375"
                    stroke={getStrokeColor(isHover, theme.mode)}
                    strokeWidth="1.875"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Body3
                  color={
                    theme.mode === "light"
                      ? isHover
                        ? ColorPalette["gray-300"]
                        : ColorPalette["gray-200"]
                      : isHover
                      ? ColorPalette["gray-100"]
                      : ColorPalette["gray-300"]
                  }
                  style={{
                    lineHeight: "140%",
                  }}
                >
                  Endur.fi
                </Body3>
                <Gutter size="0.25rem" />
                <Box marginBottom="2px">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M9 4H3.5C2.67157 4 2 4.67157 2 5.5V12.5C2 13.3284 2.67157 14 3.5 14H10.5C11.3284 14 12 13.3284 12 12.5V7M5 11L14 2M14 2L10.5 2M14 2V5.5"
                      stroke={getStrokeColor(isHover, theme.mode)}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Box>
              </React.Fragment>
            )}
          </XAxis>
          {!stakeBalanceIsZero && stakingApr && (
            <React.Fragment>
              <Gutter size="0.25rem" />
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
                style={{
                  lineHeight: "140%",
                }}
              >
                {`${stakingApr}% APR`}
              </Body3>
            </React.Fragment>
          )}
        </YAxis>
      </XAxis>
    </StakedBalanceLayout>
  );
});

const StakedBalanceLayout: FunctionComponent<{
  stakingUrl?: string;
  isHover: boolean;
  onHoverStateChange: (isHover: boolean) => void;
  children: React.ReactNode;
}> = observer(({ stakingUrl, isHover, onHoverStateChange, children }) => {
  const theme = useTheme();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stakingUrl) {
      browser.tabs.create({ url: stakingUrl });
    }
  };

  return (
    <Box paddingX="0.75rem">
      <Box
        backgroundColor={getBackgroundColor(isHover, theme.mode)}
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0 1px 4px 0 rgba(43,39,55,0.1)"
              : undefined,
        }}
        cursor={stakingUrl ? "pointer" : undefined}
        onClick={handleClick}
        onHoverStateChange={onHoverStateChange}
        borderRadius="0.375rem"
        padding="1rem"
      >
        {children}
      </Box>
    </Box>
  );
});

const StakingGradientLightIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="33"
      fill="none"
      viewBox="0 0 32 33"
    >
      <circle
        cx="16"
        cy="16.5"
        r="16"
        fill="url(#paint0_linear_9517_5789)"
        opacity="0.4"
      />
      <path
        fill="#fff"
        d="M16 9.299a1.25 1.25 0 00-.566.14h-.011L9.46 12.5a.628.628 0 00-.005 1.164v.012l5.972 3.05.004-.003c.172.087.362.14.568.14.206 0 .396-.053.567-.14l.005.003 5.972-3.05v-.012a.628.628 0 00-.005-1.165L16.577 9.44h-.01A1.25 1.25 0 0016 9.3zm-5.372 6.383l-1.167.598a.628.628 0 00-.005 1.165v.012l5.972 3.05.004-.003c.172.087.362.14.568.14.206 0 .396-.053.567-.14l.005.002 5.972-3.049v-.012a.628.628 0 00-.005-1.165l-1.167-.598c-1.83.937-4.33 2.213-4.359 2.223a2.468 2.468 0 01-2.03-.001c-.028-.01-2.524-1.284-4.355-2.222zm0 3.782l-1.167.598a.628.628 0 00-.005 1.165v.012l5.972 3.05.004-.003c.172.087.362.14.568.14.206 0 .396-.053.567-.14l.005.002 5.972-3.05v-.011a.628.628 0 00-.005-1.165l-1.167-.598c-1.83.937-4.33 2.212-4.359 2.223a2.466 2.466 0 01-2.03-.001c-.028-.01-2.524-1.284-4.355-2.222z"
      />
      <defs>
        <linearGradient
          id="paint0_linear_9517_5789"
          x1="32"
          x2="0"
          y1="16.5"
          y2="16.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#48A2E1" />
          <stop offset="1" stopColor="#B04AE0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const StakingGradientDarkIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="33"
      fill="none"
      viewBox="0 0 32 33"
    >
      <circle
        cx="16"
        cy="16.5"
        r="16"
        fill="url(#paint0_linear_9027_4987)"
        opacity="0.4"
      />
      <path
        fill="#fff"
        d="M16 9.299a1.25 1.25 0 00-.566.14h-.011L9.46 12.5a.628.628 0 00-.005 1.164v.012l5.972 3.05.004-.003c.172.087.363.14.568.14.206 0 .396-.053.568-.14l.005.003 5.971-3.05v-.012a.628.628 0 00-.005-1.165L16.577 9.44h-.01A1.25 1.25 0 0016 9.3zm-5.372 6.383l-1.167.598a.628.628 0 00-.005 1.165v.012l5.972 3.05.004-.003c.172.087.363.14.568.14.206 0 .396-.053.568-.14l.005.002 5.971-3.049v-.012a.628.628 0 00-.005-1.165l-1.167-.598c-1.83.937-4.33 2.213-4.359 2.223a2.468 2.468 0 01-2.03-.001c-.027-.01-2.524-1.284-4.355-2.222zm0 3.782l-1.167.598a.628.628 0 00-.005 1.165v.012l5.972 3.05.004-.003c.172.087.363.14.568.14.206 0 .396-.053.568-.14l.005.002 5.971-3.05v-.011a.628.628 0 00-.005-1.165l-1.167-.598c-1.83.937-4.33 2.212-4.359 2.223a2.466 2.466 0 01-2.03-.001c-.027-.01-2.524-1.284-4.355-2.222z"
      />
      <defs>
        <linearGradient
          id="paint0_linear_9027_4987"
          x1="32"
          x2="0"
          y1="16.5"
          y2="16.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#71C4FF" />
          <stop offset="1" stopColor="#D378FE" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const EndurFiLightIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="41"
      viewBox="0 0 40 41"
      fill="none"
    >
      <mask
        id="mask0_15175_110090"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="41"
      >
        <path d="M40 0.5H0V40.5H40V0.5Z" fill="white" />
      </mask>
      <g mask="url(#mask0_15175_110090)">
        <mask
          id="mask1_15175_110090"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="40"
          height="41"
        >
          <path d="M40 0.5H0V40.5H40V0.5Z" fill="white" />
        </mask>
        <g mask="url(#mask1_15175_110090)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 20.5C0 31.538 8.96202 40.5 20 40.5C31.038 40.5 40 31.538 40 20.5C40 9.46202 31.038 0.5 20 0.5C8.96202 0.5 0 9.46202 0 20.5Z"
            fill="url(#paint0_linear_15175_110090)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.1899 15.7912L11.6962 14.2722C11.7975 13.9684 12.0507 13.7152 12.3545 13.6139L13.8988 13.1329C14.1013 13.057 14.1013 12.7785 13.8988 12.7025L12.3798 12.1962C12.076 12.095 11.8228 11.8418 11.7216 11.538L11.2406 9.9937C11.1646 9.79116 10.8861 9.79116 10.8102 9.9937L10.3038 11.5127C10.2026 11.8165 9.9494 12.0696 9.64561 12.1709L8.1013 12.6772C7.89877 12.7532 7.89877 13.0317 8.1013 13.1076L9.62029 13.6139C9.92409 13.7152 10.1773 13.9684 10.2785 14.2722L10.7595 15.8165C10.8102 15.9937 11.114 15.9937 11.1899 15.7912Z"
            fill="#FAFAFA"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M35.9494 15.5635C35.3164 14.9812 34.329 14.652 33.3671 14.5002C32.4051 14.3736 31.3924 14.3736 30.4304 14.5255C28.5063 14.8039 26.7341 15.4621 25.2152 16.2724C24.4304 16.6774 23.7469 17.1331 23.0379 17.6141C22.7088 17.8419 22.3796 18.1204 22.0759 18.3736L21.1899 19.1078C20.2278 19.9432 19.2911 20.7027 18.3796 21.3103C17.4683 21.9432 16.6076 22.3989 15.7722 22.728C14.9366 23.0572 14.0253 23.2596 12.8607 23.285C11.6962 23.3103 10.3291 23.1331 8.83541 22.8547C7.34173 22.5761 5.79743 22.171 4.0506 21.8166C4.65819 23.209 5.56959 24.4495 6.73414 25.5888C7.92401 26.7027 9.39237 27.7154 11.3164 28.3736C13.1899 29.0572 15.5442 29.285 17.7469 28.9306C19.9494 28.5761 21.8987 27.7154 23.4683 26.7533C25.0379 25.766 26.3037 24.6267 27.3924 23.4621C27.6961 23.1331 27.8481 22.9559 28.0506 22.7027L28.6329 21.9685C29.0379 21.5129 29.4177 21.0065 29.8228 20.5508C30.6329 19.6141 31.4177 18.6774 32.329 17.8166C32.7848 17.3862 33.2658 16.9559 33.8481 16.5508C34.1265 16.3483 34.4304 16.1711 34.7848 15.9938C35.1393 15.8166 35.4936 15.6901 35.9494 15.5635Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M35.9494 15.6658C35.2658 14.3493 34 13.21 32.3037 12.3999C30.6076 11.5898 28.2784 11.1594 25.9494 11.5139C24.8101 11.6911 23.6961 12.0202 22.7088 12.4506C21.7469 12.8809 20.8607 13.4126 20.1265 13.9695C19.7469 14.2481 19.4177 14.5518 19.0633 14.8557L18.1772 15.7164L16.8101 17.1088C15.1139 18.9063 13.2405 21.0075 10.1772 21.6405C7.16453 22.2481 5.87338 21.7164 4.0506 21.4886C4.37971 22.1468 4.81009 22.8049 5.36706 23.3872C5.92401 23.9695 6.58224 24.5265 7.39237 24.9822C7.79743 25.21 8.22782 25.4378 8.70883 25.6152C9.18984 25.7923 9.69617 25.9695 10.2531 26.0708C11.3417 26.2987 12.5822 26.3746 13.7722 26.2481C14.9619 26.1214 16.1012 25.843 17.1139 25.4378C18.1265 25.0582 18.9873 24.5771 19.7722 24.0961C21.3164 23.1088 22.5316 22.0201 23.5442 20.9063C24.0506 20.3493 24.5316 19.7923 24.9619 19.21L25.4683 18.5265C25.6202 18.324 25.7722 18.1214 25.9494 17.9442C26.5823 17.21 27.2152 16.6024 27.9747 16.1468C28.7341 15.6911 29.7722 15.3366 31.1899 15.2607C32.557 15.21 34.1772 15.3619 35.9494 15.6658Z"
            fill="#DCDCDC"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M27.8735 29.1319C27.8735 30.3978 28.8861 31.4104 30.1519 31.4104C31.4177 31.4104 32.4305 30.3978 32.4305 29.1319C32.4305 27.8661 31.4177 26.8535 30.1519 26.8535C28.8861 26.8535 27.8735 27.8661 27.8735 29.1319Z"
            fill="white"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_15175_110090"
          x1="-7.78481"
          y1="-7.28481"
          x2="34.6202"
          y2="35.1202"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#38EF7D" />
          <stop offset="1" stopColor="#11998E" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const EndurFiDarkIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="41"
      viewBox="0 0 40 41"
      fill="none"
    >
      <mask
        id="mask0_15175_110104"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="41"
      >
        <path d="M40 0.5H0V40.5H40V0.5Z" fill="white" />
      </mask>
      <g mask="url(#mask0_15175_110104)">
        <mask
          id="mask1_15175_110104"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="40"
          height="41"
        >
          <path d="M40 0.5H0V40.5H40V0.5Z" fill="white" />
        </mask>
        <g mask="url(#mask1_15175_110104)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 20.5C0 31.538 8.96202 40.5 20 40.5C31.038 40.5 40 31.538 40 20.5C40 9.46202 31.038 0.5 20 0.5C8.96202 0.5 0 9.46202 0 20.5Z"
            fill="url(#paint0_linear_15175_110104)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.1899 15.7912L11.6962 14.2722C11.7975 13.9684 12.0507 13.7152 12.3545 13.6139L13.8988 13.1329C14.1013 13.057 14.1013 12.7785 13.8988 12.7025L12.3798 12.1962C12.076 12.095 11.8228 11.8418 11.7216 11.538L11.2406 9.9937C11.1646 9.79116 10.8861 9.79116 10.8102 9.9937L10.3038 11.5127C10.2026 11.8165 9.9494 12.0696 9.64561 12.1709L8.1013 12.6772C7.89877 12.7532 7.89877 13.0317 8.1013 13.1076L9.62029 13.6139C9.92409 13.7152 10.1773 13.9684 10.2785 14.2722L10.7595 15.8165C10.8102 15.9937 11.114 15.9937 11.1899 15.7912Z"
            fill="#FAFAFA"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M35.9494 15.5635C35.3164 14.9812 34.329 14.652 33.3671 14.5002C32.4051 14.3736 31.3924 14.3736 30.4304 14.5255C28.5063 14.8039 26.7341 15.4621 25.2152 16.2724C24.4304 16.6774 23.7469 17.1331 23.0379 17.6141C22.7088 17.8419 22.3796 18.1204 22.0759 18.3736L21.1899 19.1078C20.2278 19.9432 19.2911 20.7027 18.3796 21.3103C17.4683 21.9432 16.6076 22.3989 15.7722 22.728C14.9366 23.0572 14.0253 23.2596 12.8607 23.285C11.6962 23.3103 10.3291 23.1331 8.83541 22.8547C7.34173 22.5761 5.79743 22.171 4.0506 21.8166C4.65819 23.209 5.56959 24.4495 6.73414 25.5888C7.92401 26.7027 9.39237 27.7154 11.3164 28.3736C13.1899 29.0572 15.5442 29.285 17.7469 28.9306C19.9494 28.5761 21.8987 27.7154 23.4683 26.7533C25.0379 25.766 26.3037 24.6267 27.3924 23.4621C27.6961 23.1331 27.8481 22.9559 28.0506 22.7027L28.6329 21.9685C29.0379 21.5129 29.4177 21.0065 29.8228 20.5508C30.6329 19.6141 31.4177 18.6774 32.329 17.8166C32.7848 17.3862 33.2658 16.9559 33.8481 16.5508C34.1265 16.3483 34.4304 16.1711 34.7848 15.9938C35.1393 15.8166 35.4936 15.6901 35.9494 15.5635Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M35.9494 15.6658C35.2658 14.3493 34 13.21 32.3037 12.3999C30.6076 11.5898 28.2784 11.1594 25.9494 11.5139C24.8101 11.6911 23.6961 12.0202 22.7088 12.4506C21.7469 12.8809 20.8607 13.4126 20.1265 13.9695C19.7469 14.2481 19.4177 14.5518 19.0633 14.8557L18.1772 15.7164L16.8101 17.1088C15.1139 18.9063 13.2405 21.0075 10.1772 21.6405C7.16453 22.2481 5.87338 21.7164 4.0506 21.4886C4.37971 22.1468 4.81009 22.8049 5.36706 23.3872C5.92401 23.9695 6.58224 24.5265 7.39237 24.9822C7.79743 25.21 8.22782 25.4378 8.70883 25.6152C9.18984 25.7923 9.69617 25.9695 10.2531 26.0708C11.3417 26.2987 12.5822 26.3746 13.7722 26.2481C14.9619 26.1214 16.1012 25.843 17.1139 25.4378C18.1265 25.0582 18.9873 24.5771 19.7722 24.0961C21.3164 23.1088 22.5316 22.0201 23.5442 20.9063C24.0506 20.3493 24.5316 19.7923 24.9619 19.21L25.4683 18.5265C25.6202 18.324 25.7722 18.1214 25.9494 17.9442C26.5823 17.21 27.2152 16.6024 27.9747 16.1468C28.7341 15.6911 29.7722 15.3366 31.1899 15.2607C32.557 15.21 34.1772 15.3619 35.9494 15.6658Z"
            fill="#DCDCDC"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M27.8735 29.1319C27.8735 30.3978 28.8861 31.4104 30.1519 31.4104C31.4177 31.4104 32.4305 30.3978 32.4305 29.1319C32.4305 27.8661 31.4177 26.8535 30.1519 26.8535C28.8861 26.8535 27.8735 27.8661 27.8735 29.1319Z"
            fill="white"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_15175_110104"
          x1="-7.78481"
          y1="-7.28481"
          x2="34.6202"
          y2="35.1202"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#38EF7D" />
          <stop offset="1" stopColor="#11998E" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const getBackgroundColor = (isHover: boolean, mode: ThemeOption) =>
  isHover
    ? mode === "light"
      ? ColorPalette["gray-10"]
      : ColorPalette["gray-500"]
    : mode === "light"
    ? ColorPalette["white"]
    : ColorPalette["gray-550"];

const getStrokeColor = (isHover: boolean, mode: ThemeOption) =>
  mode === "light"
    ? isHover
      ? ColorPalette["gray-300"]
      : ColorPalette["gray-200"]
    : isHover
    ? ColorPalette["gray-100"]
    : ColorPalette["gray-300"];
