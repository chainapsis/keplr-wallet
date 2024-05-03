import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { CardModal } from "modals/card";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Image, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";

enum ImgStatus {
  First,
  Second,
  Third,
}

interface ImgNavigateMode {
  status: ImgStatus;
  img: NodeRequire;
}

export const LedgerTransectionGuideModel: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = observer(({ isOpen, close }) => {
  const style = useStyle();

  const [navigateImg, setNavigateImg] = useState<ImgNavigateMode>({
    status: ImgStatus.First,
    img: require("assets/image/ledger/confirm-ledger-1.png"),
  });

  useEffect(() => {
    setNavigateImg({
      status: ImgStatus.First,
      img: require("assets/image/ledger/confirm-ledger-1.png"),
    });
    setTimeout(function () {
      setNavigateImg({
        status: ImgStatus.Second,
        img: require(`assets/image/ledger/confirm-ledger-2.png`),
      });
    }, 6000);
    setTimeout(function () {
      setNavigateImg({
        status: ImgStatus.Third,
        img: require(`assets/image/ledger/confirm-ledger-3.png`),
      });
    }, 12000);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <CardModal
      isOpen={isOpen}
      title="Confirm transaction"
      close={() => close()}
    >
      <View style={style.flatten(["items-center", "margin-y-16"]) as ViewStyle}>
        <Image
          source={navigateImg.img}
          style={{
            height: 52,
            width: 292,
            position: "absolute",
          }}
          resizeMode="contain"
          fadeDuration={0}
        />
        <View style={{ width: 290 }}>
          {navigateImg.status == ImgStatus.Second ||
          navigateImg.status == ImgStatus.Third ? (
            <LottieView
              source={require("assets/lottie/single_button.json")}
              autoPlay
              speed={2}
              loop={true}
              style={
                [
                  style.flatten(["height-44"]),
                  { marginLeft: 60, marginTop: 2 },
                ] as ViewStyle
              }
            />
          ) : (
            <View
              style={
                [
                  style.flatten(["height-44"]),
                  { marginLeft: 60, marginTop: 2 },
                ] as ViewStyle
              }
            />
          )}
        </View>
      </View>
      <Text
        style={
          style.flatten([
            "subtitle3",
            "color-white",
            "text-center",
            "margin-y-28",
          ]) as ViewStyle
        }
      >
        Using your Ledger device, navigate through transaction details, then
        approve or reject the transaction.
      </Text>
    </CardModal>
  );
});
