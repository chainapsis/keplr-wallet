import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { AccountCard } from "./account-card";
import {
  AppState,
  AppStateStatus,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useStore } from "../../stores";
import { StakingInfoCard } from "./staking-info-card";
import { useStyle } from "../../styles";
import { GovernanceCard } from "./governance-card";
import { observer } from "mobx-react-lite";
import { MyRewardCard } from "./my-reward-card";
import { TokensCard } from "./tokens-card";
import { usePrevious } from "../../hooks";
import { BIP44Selectable } from "./bip44-selectable";
import { useFocusEffect } from "@react-navigation/native";
import { ChainUpdaterService } from "@keplr-wallet/background";

export const HomeScreen: FunctionComponent = observer(() => {
  const [refreshing, setRefreshing] = React.useState(false);

  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const style = useStyle();

  const scrollViewRef = useRef<ScrollView | null>(null);

  const currentChain = chainStore.current;
  const currentChainId = currentChain.chainId;
  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  const checkAndUpdateChainInfo = useCallback(() => {
    if (!chainStoreIsInitializing) {
      (async () => {
        const result = await ChainUpdaterService.checkChainUpdate(currentChain);

        // TODO: Add the modal for explicit chain update.
        if (result.slient) {
          chainStore.tryUpdateChain(currentChainId);
        }
      })();
    }
  }, [chainStore, chainStoreIsInitializing, currentChain, currentChainId]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state === "active") {
        checkAndUpdateChainInfo();
      }
    };

    AppState.addEventListener("change", appStateHandler);

    return () => {
      AppState.removeEventListener("change", appStateHandler);
    };
  }, [checkAndUpdateChainInfo]);

  useFocusEffect(
    useCallback(() => {
      if (
        (chainStoreIsInitializing !== previousChainStoreIsInitializing &&
          !chainStoreIsInitializing) ||
        currentChainId !== previousChainId
      ) {
        checkAndUpdateChainInfo();
      }
    }, [
      chainStoreIsInitializing,
      previousChainStoreIsInitializing,
      currentChainId,
      previousChainId,
      checkAndUpdateChainInfo,
    ])
  );

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0 });
    }
  }, [chainStore.current.chainId]);

  const onRefresh = React.useCallback(async () => {
    const account = accountStore.getAccount(chainStore.current.chainId);
    const queries = queriesStore.get(chainStore.current.chainId);

    // Because the components share the states related to the queries,
    // fetching new query responses here would make query responses on all other components also refresh.

    await Promise.all([
      priceStore.waitFreshResponse(),
      ...queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
        .balances.map((bal) => {
          return bal.waitFreshResponse();
        }),
      queries.cosmos.queryRewards
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
      queries.cosmos.queryUnbondingDelegations
        .getQueryBech32Address(account.bech32Address)
        .waitFreshResponse(),
    ]);

    setRefreshing(false);
  }, [accountStore, chainStore, priceStore, queriesStore]);

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode="gradient"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ref={scrollViewRef}
    >
      <BIP44Selectable />
      <AccountCard containerStyle={style.flatten(["margin-y-card-gap"])} />
      {/* There is a reason to use TokensCardRenderIfTokenExists. Check the comments on TokensCardRenderIfTokenExists */}
      <TokensCardRenderIfTokenExists />
      <MyRewardCard
        containerStyle={style.flatten(["margin-bottom-card-gap"])}
      />
      <StakingInfoCard
        containerStyle={style.flatten(["margin-bottom-card-gap"])}
      />
      <GovernanceCard
        containerStyle={style.flatten(["margin-bottom-card-gap"])}
      />
    </PageWithScrollViewInBottomTabView>
  );
});

/**
 * TokensCardRenderIfTokenExists is used to reduce the re-rendering of HomeScreen component.
 * Because HomeScreen is screen of the app, if it is re-rendered, all children component will be re-rendered.
 * If all components on screen are re-rendered, performance problems may occur and users may feel delay.
 * Therefore, the screen should not have state as much as possible.
 *
 * In fact, re-rendering took place because home screen had to check the user's balances
 * when deciding whether to render the tokens card on the screen and this makes some delay.
 * To solve this problem, this component has been separated.
 */
const TokensCardRenderIfTokenExists: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();

  const queryBalances = queriesStore
    .get(chainStore.current.chainId)
    .queryBalances.getQueryBech32Address(
      accountStore.getAccount(chainStore.current.chainId).bech32Address
    );

  const tokens = queryBalances.positiveNativeUnstakables.concat(
    queryBalances.nonNativeBalances
  );

  return (
    <React.Fragment>
      {tokens.length > 0 ? (
        <TokensCard
          containerStyle={style.flatten(["margin-bottom-card-gap"])}
        />
      ) : null}
    </React.Fragment>
  );
});
