import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { MainHeaderLayout } from "../main/layouts/header";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import { Box } from "../../components/box";
import { Gutter } from "../../components/gutter";
import { Subtitle2 } from "../../components/typography";
import { useStore } from "../../stores";
import { TokenItem } from "../main/components";
import { Dec } from "@keplr-wallet/unit";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { TextButton } from "../../components/button-text";
import { useNavigate } from "react-router";
import { ChevronIcon } from ".";
import { FormattedMessage, useIntl } from "react-intl";

const zeroDec = new Dec(0);

export const StakeEmptyPage: FunctionComponent = observer(() => {
  const theme = useTheme();
  const navigate = useNavigate();
  const intl = useIntl();
  const { hugeQueriesStore, priceStore, queriesStore, starknetQueriesStore } =
    useStore();

  const stakableTokens = hugeQueriesStore.stakables
    .filter((token) => token.token.toDec().gt(zeroDec))
    .sort((a, b) => {
      const aPrice = priceStore.calculatePrice(a.token)?.toDec() ?? zeroDec;
      const bPrice = priceStore.calculatePrice(b.token)?.toDec() ?? zeroDec;

      if (aPrice.equals(bPrice)) {
        return 0;
      }
      return aPrice.gt(bPrice) ? -1 : 1;
    })
    .slice(0, 4);

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
        <Box paddingX="0.25rem">
          <span
            style={{
              color:
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette.white,
              fontFeatureSettings: "'liga' off, 'clig' off",
              fontSize: "1.75rem",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "115.008%",
            }}
          >
            <FormattedMessage
              id="page.stake.empty.title"
              values={{
                br: <br />,
              }}
            />
          </span>
        </Box>

        <Gutter size="1rem" />

        <Box paddingX="0.25rem">
          <Subtitle2 color={ColorPalette["gray-200"]}>
            {intl.formatMessage({
              id: "page.stake.empty.subtitle",
            })}
          </Subtitle2>
        </Box>

        <Gutter size="1rem" />

        {stakableTokens.map((viewToken) => {
          const isStarknet = "starknet" in viewToken.chainInfo;
          const stakingUrl = isStarknet
            ? "https://dashboard.endur.fi/stake"
            : "walletUrlForStaking" in viewToken.chainInfo
            ? viewToken.chainInfo.walletUrlForStaking
            : undefined;

          const stakingApr = (() => {
            if (isStarknet) {
              const queryApr = starknetQueriesStore.get(
                viewToken.chainInfo.chainId
              ).queryStakingApr;

              return queryApr.apr
                ? `${queryApr.apr.toString(2)}% APR`
                : undefined;
            }

            const chainIdentifier = ChainIdHelper.parse(
              viewToken.chainInfo.chainId
            ).identifier;

            const queryApr = queriesStore.simpleQuery.queryGet<{
              overview: {
                apr: number;
              };
              lastUpdated: number;
            }>(
              "https://pjld2aanw3elvteui4gwyxgx4m0ceweg.lambda-url.us-west-2.on.aws",
              `/apr/${chainIdentifier}`
            );

            if (
              queryApr.response &&
              "apr" in queryApr.response.data &&
              typeof queryApr.response.data.apr === "number" &&
              queryApr.response.data.apr > 0
            ) {
              return `${new Dec(queryApr.response.data.apr)
                .mul(new Dec(100))
                .toString(2)}% APR`;
            }

            return undefined;
          })();

          return (
            <Box
              key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
            >
              <TokenItem
                viewToken={viewToken}
                stakingApr={stakingApr}
                onClick={() => {
                  if (stakingUrl) {
                    browser.tabs.create({
                      url: stakingUrl,
                    });
                  }
                }}
              />
              <Gutter size="0.5rem" />
            </Box>
          );
        })}

        <Gutter size="1.25rem" />

        <TextButton
          text={intl.formatMessage({
            id: "page.stake.empty.link",
          })}
          color="blue"
          onClick={() => {
            navigate("/stake/explore");
          }}
          right={<ChevronIcon width="1rem" height="1rem" />}
          style={{
            margin: "-0.25rem -1rem",
          }}
        />
      </Box>
    </MainHeaderLayout>
  );
});
