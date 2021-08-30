import React, { FunctionComponent, useEffect } from "react";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithView } from "../../components/staging/page";
import { Text, View } from "react-native";
import { Button } from "../../components/staging/button";
import { useStyle } from "../../styles";
import Svg, { Circle, Rect } from "react-native-svg";
import { useSmartNavigation } from "../../navigation";
import { RightArrowIcon } from "../../components/staging/icon";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";

export const TxPendingResultScreen: FunctionComponent = observer(() => {
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

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const isFocused = useIsFocused();

  useEffect(() => {
    const txHash = route.params.txHash;
    const chainInfo = chainStore.getChain(chainId);
    let txTracer: TendermintTxTracer | undefined;

    if (isFocused) {
      txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer
        .traceTx(Buffer.from(txHash, "hex"))
        .then((tx) => {
          if (tx.code == null || tx.code === 0) {
            smartNavigation.pushSmart("TxSuccessResult", {
              chainId,
              txHash,
            });
          } else {
            smartNavigation.pushSmart("TxFailedResult", {
              chainId,
              txHash,
            });
          }
        })
        .catch((e) => {
          console.log(`Failed to trace the tx (${txHash})`, e);
        });
    }

    return () => {
      if (txTracer) {
        txTracer.close();
      }
    };
  }, [chainId, chainStore, isFocused, route.params.txHash, smartNavigation]);

  return (
    <PageWithView
      style={style.flatten(["padding-x-42", "items-center", "justify-center"])}
    >
      <Svg width="122" height="122" fill="none" viewBox="0 0 122 122">
        <Circle
          cx="61"
          cy="61"
          r="57"
          stroke={style.get("color-primary").color}
          strokeWidth="8"
        />
        <Rect
          width="12"
          height="12"
          x="55"
          y="56"
          fill={style.get("color-primary").color}
          rx="6"
        />
        <Rect
          width="12"
          height="12"
          x="35"
          y="56"
          fill={style.get("color-primary").color}
          rx="6"
        />
        <Rect
          width="12"
          height="12"
          x="74"
          y="56"
          fill={style.get("color-primary").color}
          rx="6"
        />
      </Svg>
      <Text style={style.flatten(["h2", "margin-top-87", "margin-bottom-32"])}>
        Pending
      </Text>
      <Text style={style.flatten(["body1", "text-center"])}>
        Just wait a minute.
      </Text>
      <Text style={style.flatten(["body1", "text-center"])}>
        Transaction will be committed.
      </Text>
      <Button
        containerStyle={style.flatten(["margin-top-92"])}
        size="small"
        text="Go To Home"
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
          smartNavigation.navigateSmart("Home", {});
        }}
      />
    </PageWithView>
  );
});
