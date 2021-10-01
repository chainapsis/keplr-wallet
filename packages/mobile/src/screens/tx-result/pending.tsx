import React, { FunctionComponent, useEffect } from "react";
import { RouteProp, useIsFocused, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithView } from "../../components/page";
import { Text, View, StyleSheet } from "react-native";
import { Button } from "../../components/button";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";
import { RightArrowIcon } from "../../components/icon";
import { TendermintTxTracer } from "@keplr-wallet/cosmos";
import { Buffer } from "buffer/";
import LottieView from "lottie-react-native";

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
            smartNavigation.replaceSmart("TxSuccessResult", {
              chainId,
              txHash,
            });
          } else {
            smartNavigation.replaceSmart("TxFailedResult", {
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
      disableSafeArea
      style={style.flatten([
        "flex-grow-1",
        "items-center",
        "background-color-white",
      ])}
    >
      <View style={style.flatten(["flex-3"])} />
      <View
        style={style.flatten([
          "width-122",
          "height-122",
          "border-width-8",
          "border-color-primary",
          "border-radius-64",
        ])}
      >
        <View
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 10,
            ...style.flatten(["absolute", "justify-center", "items-center"]),
          }}
        >
          <LottieView
            source={require("../../assets/lottie/pending.json")}
            colorFilters={[
              {
                keypath: "#dot01",
                color: style.get("color-primary").color,
              },
              {
                keypath: "#dot02",
                color: style.get("color-primary").color,
              },
              {
                keypath: "#dot03",
                color: style.get("color-primary").color,
              },
            ]}
            autoPlay
            loop
            style={style.flatten(["width-160"])}
          />
        </View>
      </View>

      <Text
        style={style.flatten([
          "h2",
          "color-text-black-medium",
          "margin-top-82",
          "margin-bottom-32",
        ])}
      >
        Transaction pending
      </Text>

      {/* To match the height of text with other tx result screens,
         set the explicit height to upper view*/}
      <View
        style={StyleSheet.flatten([
          style.flatten(["padding-x-66"]),
          {
            height: style.get("body2").lineHeight * 3,
            overflow: "visible",
          },
        ])}
      >
        <Text
          style={style.flatten([
            "body2",
            "text-center",
            "color-text-black-low",
          ])}
        >
          Transaction has been broadcasted to the blockchain and pending
          confirmation.
        </Text>
      </View>

      <View
        style={style.flatten([
          "padding-x-48",
          "height-116",
          "margin-top-58",
          "justify-center",
        ])}
      >
        <View style={style.flatten(["flex-row", "width-full"])}>
          <Button
            containerStyle={style.flatten(["flex-1"])}
            size="default"
            text="Go to homescreen"
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
        </View>
      </View>
      <View style={style.flatten(["flex-2"])} />
    </PageWithView>
  );
});
