import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, View } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import { AlertIcon, RefreshIcon } from "../../components/icon";
import { useStyle } from "../../styles";
import { useNetInfo } from "@react-native-community/netinfo";
import { TouchableOpacity } from "react-native-gesture-handler";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSpinAnimated } from "../../components/spinner";
import { ObservableQuery } from "@keplr-wallet/stores";

export const NetworkErrorView: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const queryStakable = queries.queryBalances.getQueryBech32Address(
    account.bech32Address
  ).stakable;
  const queryDelegated = queries.cosmos.queryDelegations.getQueryBech32Address(
    account.bech32Address
  );
  const queryUnbonding = queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
    account.bech32Address
  );

  const style = useStyle();

  const extraHeight = 32;

  const netInfo = useNetInfo();
  const networkIsConnected =
    typeof netInfo.isConnected !== "boolean" || netInfo.isConnected;

  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshable, setIsRefreshable] = useState(true);
  const [message, setMessage] = useState("");

  const prevNetworkIsConnected = useRef(true);
  useEffect(() => {
    if (!networkIsConnected) {
      setIsOpen(true);
      setMessage("No internet connection");
      setIsRefreshable(false);
    } else {
      setIsOpen(false);

      // If the network is recovered.
      if (!prevNetworkIsConnected.current) {
        ObservableQuery.refreshAllObserved();
      }
    }

    return () => {
      prevNetworkIsConnected.current = networkIsConnected;
    };
  }, [networkIsConnected]);

  useEffect(() => {
    if (networkIsConnected) {
      const error =
        queryStakable.error || queryDelegated.error || queryUnbonding.error;

      if (error) {
        const errorData = error.data as { error?: string } | undefined;
        const message = (() => {
          if (errorData?.error) {
            return "Failed to get response\n" + errorData.error;
          }

          return error.message || "Unknown error";
        })();

        setIsOpen(true);
        setMessage(message);
        setIsRefreshable(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [
    queryStakable.error,
    queryDelegated.error,
    queryUnbonding.error,
    networkIsConnected,
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const spinAnimated = useSpinAnimated(isRefreshing);

  useEffect(() => {
    if (isRefreshing) {
      if (
        !queryStakable.isFetching &&
        !queryDelegated.isFetching &&
        !queryUnbonding.isFetching
      ) {
        setIsRefreshing(false);
      }
    }
  }, [
    isRefreshing,
    queryDelegated.isFetching,
    queryStakable.isFetching,
    queryUnbonding.isFetching,
  ]);

  const [childLayout, setChildLayout] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const [animatedValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (isOpen) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 330,
        easing: Easing.out(Easing.sin),
      }).start();
    }
  }, [animatedValue, isOpen]);

  const animatedHeight = useMemo(() => {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, childLayout.height + extraHeight],
    });
  }, [animatedValue, childLayout.height]);

  return (
    <Animated.View
      style={{
        overflow: "hidden",
        height: animatedHeight,
        justifyContent: "center",
      }}
    >
      <View
        style={style.flatten([
          "flex-row",
          "items-center",
          "background-color-danger-10",
          "padding-left-26",
          "padding-right-24",
          "height-80",
        ])}
        onLayout={(e) => {
          setChildLayout(e.nativeEvent.layout);
        }}
      >
        <View style={style.flatten(["margin-right-16"])}>
          <AlertIcon color={style.get("color-danger").color} size={24} />
        </View>
        <View style={style.flatten(["flex-1", "overflow-visible"])}>
          <Text
            style={style.flatten([
              "subtitle2",
              "color-danger",
              "overflow-visible",
            ])}
          >
            {message}
          </Text>
        </View>
        {isRefreshable ? (
          <TouchableOpacity
            disabled={isRefreshing}
            onPress={() => {
              setIsRefreshing(true);
              ObservableQuery.refreshAllObservedIfError();
            }}
            style={style.flatten([
              "background-color-danger-50",
              "justify-center",
              "items-center",
              "width-32",
              "height-32",
              "border-radius-64",
              "margin-left-16",
            ])}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: spinAnimated,
                  },
                ],
              }}
            >
              <RefreshIcon color={style.get("color-danger").color} size={24} />
            </Animated.View>
          </TouchableOpacity>
        ) : null}
      </View>
    </Animated.View>
  );
});
