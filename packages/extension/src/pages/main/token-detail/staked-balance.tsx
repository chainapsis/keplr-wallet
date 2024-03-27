import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../components/box";
import { ColorPalette } from "../../../styles";
import { XAxis, YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import { Body3, Subtitle3 } from "../../../components/typography";
import { useStore } from "../../../stores";
import { Dec } from "@keplr-wallet/unit";

export const StakedBalance: FunctionComponent<{
  chainId: string;
}> = observer(({ chainId }) => {
  const { queriesStore, accountStore, chainStore } = useStore();

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

  return (
    <Box
      paddingX="0.75rem"
      cursor={
        chainStore.getChain(chainId).walletUrlForStaking ? "pointer" : undefined
      }
      onClick={(e) => {
        e.preventDefault();

        if (chainStore.getChain(chainId).walletUrlForStaking) {
          browser.tabs.create({
            url: chainStore.getChain(chainId).walletUrlForStaking,
          });
        }
      }}
    >
      <Box
        backgroundColor={ColorPalette["gray-550"]}
        borderRadius="0.375rem"
        padding="1rem"
      >
        <XAxis alignY="center">
          <Box
            width="2rem"
            height="2rem"
            borderRadius="999999px"
            backgroundColor={ColorPalette["white"]}
          />
          <Gutter size="0.75rem" />
          <YAxis>
            <Body3 color={ColorPalette["gray-200"]}>Staked Balance</Body3>
            <Gutter size="0.25rem" />
            <Subtitle3 color={ColorPalette["white"]}>
              {queryDelegation.total
                ? queryDelegation.total
                    .maxDecimals(6)
                    .shrink(true)
                    .inequalitySymbol(true)
                    .trim(true)
                    .toString()
                : "-"}
            </Subtitle3>
          </YAxis>
          <div
            style={{
              flex: 1,
            }}
          />
          <XAxis alignY="center">
            {queryAPR.response &&
            "apr" in queryAPR.response.data &&
            typeof queryAPR.response.data.apr === "number" &&
            queryAPR.response.data.apr > 0 ? (
              <Subtitle3 color={ColorPalette["gray-300"]}>
                {`${new Dec(queryAPR.response.data.apr)
                  .mul(new Dec(100))
                  .toString(2)}% APY`}
              </Subtitle3>
            ) : null}

            {chainStore.getChain(chainId).walletUrlForStaking ? (
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
                      stroke={ColorPalette["gray-300"]}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 4.5H3.5A1.5 1.5 0 002 6v7a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0012 13V7.5m-7 4l9-9m0 0h-3.5m3.5 0V6"
                    />
                  </svg>
                </Box>
              </React.Fragment>
            ) : null}
          </XAxis>
        </XAxis>
      </Box>
    </Box>
  );
});
