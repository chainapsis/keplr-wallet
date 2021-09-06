import React, { FunctionComponent, useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithView } from "../../components/page";
import { Linking, Text, View, Dimensions, Animated } from "react-native";
import { Button } from "../../components/button";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";
import { RightArrowIcon } from "../../components/icon";
import LottieView from "lottie-react-native";

export const TxSuccessResultScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const [successAnimProgress] = React.useState(new Animated.Value(0));
  const [pangpareAnimProgress] = React.useState(new Animated.Value(0));

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;
  const txHash = route.params.txHash;

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const chainInfo = chainStore.getChain(chainId);

  useEffect(() => {
    const animateLottie = () => {
      Animated.timing(successAnimProgress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
      Animated.timing(pangpareAnimProgress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();
    };

    const timeoutId = setTimeout(animateLottie, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWithView
      style={{
        paddingTop: Dimensions.get("window").height * 0.2,
        paddingBottom: Dimensions.get("window").height * 0.2,
        ...style.flatten(["padding-x-42", "items-center"]),
      }}
    >
      <View
        style={{
          left: 10,
          right: 0,
          top: 0,
          bottom: 460,
          ...style.flatten(["absolute", "justify-center", "items-center"]),
        }}
      >
        <LottieView
          source={require("../../assets/lottie/pangpare.json")}
          progress={pangpareAnimProgress}
          style={style.flatten(["width-full", "height-400"])}
        />
      </View>
      <View style={style.flatten(["width-122", "height-122"])}>
        <View
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 10,
            backgroundColor: "#FBF8FF",
            ...style.flatten(["absolute", "justify-center", "items-center"]),
          }}
        >
          <LottieView
            source={require("../../assets/lottie/success.json")}
            progress={successAnimProgress}
            style={style.flatten(["width-160"])}
          />
        </View>
      </View>
      <Text style={style.flatten(["h2", "margin-top-87", "margin-bottom-32"])}>
        Success
      </Text>
      <Text style={style.flatten(["body1", "text-center"])}>
        Congratuations !!
      </Text>
      <View style={style.flatten(["flex-row"])}>
        <Button
          containerStyle={style.flatten(["margin-top-88", "flex-1"])}
          size="large"
          text="Confirm"
          onPress={() => {
            smartNavigation.navigateSmart("Home", {});
          }}
        />
      </View>
      {chainInfo.raw.txExplorer ? (
        <Button
          containerStyle={style.flatten(["margin-top-30"])}
          size="small"
          text={`View on ${chainInfo.raw.txExplorer.name}`}
          mode="text"
          rightIcon={
            <View style={style.flatten(["margin-left-8"])}>
              <RightArrowIcon
                color={style.get("color-primary").color}
                height={12}
              />
            </View>
          }
          onPress={() => {
            if (chainInfo.raw.txExplorer) {
              Linking.openURL(
                chainInfo.raw.txExplorer.txUrl.replace(
                  "{txHash}",
                  txHash.toUpperCase()
                )
              );
            }
          }}
        />
      ) : null}
    </PageWithView>
  );
});
