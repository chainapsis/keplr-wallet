import React, { FunctionComponent } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithView } from "../../components/staging/page";
import { Linking, Text, View } from "react-native";
import { Button } from "../../components/staging/button";
import { useStyle } from "../../styles";
import Svg, { Circle, Path } from "react-native-svg";
import { useSmartNavigation } from "../../navigation";
import { RightArrowIcon } from "../../components/staging/icon";

export const TxFailedResultScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

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

  return (
    <PageWithView
      style={style.flatten(["padding-x-42", "items-center", "justify-center"])}
    >
      <Svg width="122" height="122" fill="none" viewBox="0 0 122 122">
        <Circle
          cx="61"
          cy="61"
          r="57"
          stroke={style.get("color-danger").color}
          strokeWidth="8"
        />
        <Path
          stroke={style.get("color-danger").color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
          d="M43.5 43l35 35M78.5 43l-35 35"
        />
      </Svg>
      <Text style={style.flatten(["h2", "margin-top-87", "margin-bottom-32"])}>
        Failed
      </Text>
      <Text style={style.flatten(["body1", "text-center"])}>Oops !</Text>
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
      <Button
        containerStyle={style.flatten(["margin-top-30"])}
        size="small"
        text="View on mintscan"
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
          Linking.openURL(
            `https://www.mintscan.io/cosmos/txs/${txHash.toUpperCase()}`
          );
        }}
      />
    </PageWithView>
  );
});
