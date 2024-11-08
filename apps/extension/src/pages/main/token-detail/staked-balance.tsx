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

export const StakedBalance: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { queriesStore, accountStore, chainStore, uiConfigStore } = useStore();

  const theme = useTheme();

  const queryAPR = queriesStore.simpleQuery.queryGet<{
    apr: number;
  }>(
    "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws",
    `/apr/${chainStore.getChain(chainId).chainIdentifier}`
  );

  const queryDelegation = queriesStore
    .get(chainId)
    .cosmos.queryDelegations.getQueryBech32Address(
      accountStore.getAccount(chainId).bech32Address
    );

  const [isHover, setIsHover] = useState(false);

  const stakeBalanceIsZero =
    !queryDelegation.total || queryDelegation.total.toDec().equals(new Dec(0));

  return (
    <Box paddingX="0.75rem">
      <Box
        backgroundColor={
          isHover
            ? theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-500"]
            : theme.mode === "light"
            ? ColorPalette["white"]
            : ColorPalette["gray-550"]
        }
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0 1px 4px 0 rgba(43,39,55,0.1)"
              : undefined,
        }}
        cursor={
          chainStore.getChain(chainId).walletUrlForStaking
            ? "pointer"
            : undefined
        }
        onClick={(e) => {
          e.preventDefault();

          if (chainStore.getChain(chainId).walletUrlForStaking) {
            browser.tabs.create({
              url: chainStore.getChain(chainId).walletUrlForStaking,
            });
          }
        }}
        onHoverStateChange={setIsHover}
        borderRadius="0.375rem"
        padding="1rem"
      >
        <XAxis alignY="center">
          {theme.mode === "light" ? (
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
          ) : (
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
          )}
          <Gutter size="0.75rem" />
          <YAxis>
            {(() => {
              if (
                stakeBalanceIsZero &&
                chainStore.getChain(chainId).walletUrlForStaking
              ) {
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
                    {queryAPR.response &&
                    "apr" in queryAPR.response.data &&
                    typeof queryAPR.response.data.apr === "number" &&
                    queryAPR.response.data.apr > 0 ? (
                      <Body3
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-300"]
                            : ColorPalette["gray-200"]
                        }
                      >
                        {`${new Dec(queryAPR.response.data.apr)
                          .mul(new Dec(100))
                          .toString(2)}% APY`}
                      </Body3>
                    ) : null}
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
            {!stakeBalanceIsZero &&
            queryAPR.response &&
            "apr" in queryAPR.response.data &&
            typeof queryAPR.response.data.apr === "number" &&
            queryAPR.response.data.apr > 0 ? (
              <Subtitle3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-200"]
                    : ColorPalette["gray-300"]
                }
              >
                {`${new Dec(queryAPR.response.data.apr)
                  .mul(new Dec(100))
                  .toString(2)}% APY`}
              </Subtitle3>
            ) : null}

            {chainStore.getChain(chainId).walletUrlForStaking ? (
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
                      stroke={
                        theme.mode === "light"
                          ? ColorPalette["gray-200"]
                          : ColorPalette["gray-300"]
                      }
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
                        stroke={
                          theme.mode === "light"
                            ? ColorPalette["gray-200"]
                            : ColorPalette["gray-300"]
                        }
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
      </Box>
    </Box>
  );
});
