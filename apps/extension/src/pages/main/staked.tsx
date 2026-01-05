import React, { FunctionComponent } from "react";
import { CollapsibleList } from "../../components/collapsible-list";
import { TokenItem, TokenTitleView } from "./components";
import { observer } from "mobx-react-lite";
import { Stack } from "../../components/stack";
import { useStore } from "../../stores";
import { useIntl } from "react-intl";
import { ViewStakedToken, ViewUnbondingToken } from "../../stores/huge-queries";
import { useViewStakingTokens } from "../../hooks/use-view-staking-tokens";

export const StakedTabView: FunctionComponent<{
  onMoreTokensClosed: () => void;
}> = observer(({ onMoreTokensClosed }) => {
  const { uiConfigStore } = useStore();
  const intl = useIntl();

  const { delegations, unbondings } = useViewStakingTokens();

  const TokenViewData: {
    title: string;
    balance:
      | ViewStakedToken[]
      | {
          unbonding: ViewUnbondingToken;
          altSentence: string;
        }[];
    lenAlwaysShown: number;
    tooltip?: string | React.ReactElement;
  }[] = [
    {
      title: intl.formatMessage({
        id: "page.main.staked.staked-balance-title",
      }),
      balance: delegations,
      lenAlwaysShown: 5,
      tooltip: intl.formatMessage({
        id: "page.main.staked.staked-balance-tooltip",
      }),
    },
    {
      title: intl.formatMessage({
        id: "page.main.staked.unstaking-balance-title",
      }),
      balance: unbondings,
      lenAlwaysShown: 3,
      tooltip: intl.formatMessage({
        id: "page.main.staked.unstaking-balance-tooltip",
      }),
    },
  ];

  return (
    <React.Fragment>
      <Stack gutter="0.5rem">
        {TokenViewData.map(({ title, balance, lenAlwaysShown, tooltip }) => {
          if (balance.length === 0) {
            return null;
          }

          return (
            <CollapsibleList
              key={title}
              hideNumInTitle={uiConfigStore.isPrivacyMode}
              onCollapse={(isCollapsed) => {
                if (isCollapsed) {
                  onMoreTokensClosed();
                }
              }}
              title={<TokenTitleView title={title} tooltip={tooltip} />}
              lenAlwaysShown={lenAlwaysShown}
              items={balance.map((viewToken) => {
                if ("altSentence" in viewToken) {
                  return (
                    <TokenItem
                      viewToken={viewToken.unbonding}
                      key={`${viewToken.unbonding.chainInfo.chainId}-${viewToken.unbonding.token.currency.coinMinimalDenom}`}
                      disabled={!viewToken.unbonding.stakingUrl}
                      onClick={() => {
                        if (viewToken.unbonding.stakingUrl) {
                          browser.tabs.create({
                            url: viewToken.unbonding.stakingUrl,
                          });
                        }
                      }}
                      altSentence={viewToken.altSentence}
                    />
                  );
                }

                return (
                  <TokenItem
                    viewToken={viewToken}
                    key={`${viewToken.chainInfo.chainId}-${viewToken.token.currency.coinMinimalDenom}`}
                    disabled={!viewToken.stakingUrl}
                    onClick={() => {
                      if (viewToken.stakingUrl) {
                        browser.tabs.create({
                          url: viewToken.stakingUrl,
                        });
                      }
                    }}
                  />
                );
              })}
            />
          );
        })}
      </Stack>

      {/* FIXME - @kws1207 MainEmptyView가 메인에서 수정이 되고 더 이상 필요 없기 때문에 여기서 주석 처리함
       staked 페이지 구현 할때 삭제 필요
      */}
      {/* {delegations.length === 0 && unbondings.length === 0 ? (
        <MainEmptyView
          image={
            <img
              src={require("../../public/assets/img/main-empty-staking.png")}
              style={{
                width: "6.25rem",
                height: "6.25rem",
              }}
              alt="empty staking image"
            />
          }
          title={intl.formatMessage({
            id: "page.main.staked.empty-view-title",
          })}
          paragraph={intl.formatMessage({
            id: "page.main.staked.empty-view-paragraph",
          })}
          button={
            <TextButton
              text={intl.formatMessage({
                id: "page.main.staked.go-to-dashboard-button",
              })}
              size="small"
              right={
                <ArrowRightSolidIcon
                  width="1.125rem"
                  height="1.125rem"
                  color={ColorPalette["gray-10"]}
                />
              }
              onClick={async () => {
                await browser.tabs.create({
                  url: "https://wallet.keplr.app/?modal=staking&utm_source=keplrextension&utm_medium=button&utm_campaign=permanent&utm_content=manage_stake",
                });

                close();
              }}
            />
          }
        />
      ) : null} */}
    </React.Fragment>
  );
});
