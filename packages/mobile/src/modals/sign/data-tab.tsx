import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { SignDocHelper } from "@keplr-wallet/hooks";

import { EthSignType } from "@keplr-wallet/types";
import { TextDecoder } from "text-encoding";
import { ScrollView, Text, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { BlurBackground } from "components/new/blur-background/blur-background";

export const DataTab: FunctionComponent<{
  signDocHelper: SignDocHelper;
  ethSignType?: EthSignType;
}> = observer(({ signDocHelper, ethSignType }) => {
  const style = useStyle();
  const content = useMemo(() => {
    if (
      ethSignType !== EthSignType.TRANSACTION ||
      !signDocHelper.signDocWrapper ||
      signDocHelper.signDocWrapper.aminoSignDoc.msgs.length !== 1 ||
      signDocHelper.signDocWrapper.aminoSignDoc.msgs[0].type !==
        "sign/MsgSignData"
    ) {
      return JSON.stringify(signDocHelper.signDocJson, undefined, 2);
    }

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(
      Buffer.from(
        signDocHelper.signDocWrapper.aminoSignDoc.msgs[0].value.data,
        "base64"
      )
    );
    return JSON.stringify(JSON.parse(jsonStr), undefined, 2);
  }, [signDocHelper.signDocWrapper?.aminoSignDoc.msgs, ethSignType]);

  return (
    <BlurBackground
      borderRadius={12}
      blurIntensity={16}
      containerStyle={
        [
          style.flatten(["border-radius-8", "overflow-hidden", "margin-y-16"]),
        ] as ViewStyle
      }
    >
      <ScrollView
        indicatorStyle={"white"}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        style={[
          style.flatten(["max-height-400"]) as ViewStyle,
          { overflow: "scroll" },
        ]}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={style.flatten(["color-gray-200", "padding-12"]) as ViewStyle}
        >
          {content}
        </Text>
      </ScrollView>
    </BlurBackground>
  );
});
