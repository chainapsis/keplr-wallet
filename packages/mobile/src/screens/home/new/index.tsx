import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PageWithScrollViewInBottomTabView } from "components/page";
import {
  AppState,
  AppStateStatus,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useStore } from "stores/index";
import { observer } from "mobx-react-lite";
import { useFocusEffect } from "@react-navigation/native";
import { AccountSection } from "./v2/account-section";
import { BIP44Selectable } from "../bip44-selectable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePrevious } from "hooks/use-previous";
import { LineGraphView } from "components/new/line-graph";
import { useStyle } from "styles/index";

export const NewHomeScreen: FunctionComponent = observer(() => {
  const safeAreaInsets = useSafeAreaInsets();
  const style = useStyle();
  const windowHeight = Dimensions.get("window").height;

  const [refreshing, setRefreshing] = React.useState(false);
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const [tokenState, setTokenState] = useState({
    diff: 0,
    time: "TODAY",
    type: "positive",
  });

  const scrollViewRef = useRef<ScrollView | null>(null);

  const currentChain = chainStore.current;
  const currentChainId = currentChain.chainId;
  const previousChainId = usePrevious(currentChainId);
  const chainStoreIsInitializing = chainStore.isInitializing;
  const previousChainStoreIsInitializing = usePrevious(
    chainStoreIsInitializing,
    true
  );

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const checkAndUpdateChainInfo = useCallback(() => {
    if (!chainStoreIsInitializing) {
      (async () => {
        try {
          await chainStore.tryUpdateChain(currentChainId);
        } catch (e) {
          console.log(e);
        }
      })();
    }
  }, [chainStore, chainStoreIsInitializing, currentChainId]);

  useEffect(() => {
    const appStateHandler = (state: AppStateStatus) => {
      if (state === "active") {
        checkAndUpdateChainInfo();
      }
    };

    const callback = AppState.addEventListener("change", appStateHandler);

    return () => {
      callback.remove();
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
      backgroundMode={"image"}
      isTransparentHeader={true}
      refreshControl={
        <RefreshControl
          tintColor={"white"}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      contentContainerStyle={[
        style.get("flex-grow-1"),
        {
          paddingTop: Platform.OS === "ios" ? safeAreaInsets.top + 10 : 48,
        },
      ]}
      ref={scrollViewRef}
    >
      <BIP44Selectable />
      <AccountSection tokenState={tokenState} />
      <View style={style.flatten(["flex-2"])} />
      <LineGraphView
        setTokenState={setTokenState}
        tokenName={chainStore.current.feeCurrencies[0].coinGeckoId}
        height={windowHeight / 4}
      />
    </PageWithScrollViewInBottomTabView>
  );
});
