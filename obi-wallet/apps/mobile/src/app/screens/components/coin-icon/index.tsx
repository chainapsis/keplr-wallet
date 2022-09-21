import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";
import SvgImage from "react-native-svg/lib/typescript/elements/Image";
function DefaultView() {
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    />
  );
}

export function CoinIcon({
  imageIcon,
  SVGIcon,
}: {
  imageIcon?: number;
  SVGIcon?: React.FC<SvgProps>;
}) {
  if (!imageIcon && !SVGIcon) return <DefaultView />;

  if (imageIcon)
    return (
      <Image
        source={imageIcon}
        style={{ flex: 1, width: "100%", height: "100%" }}
      />
    );
  if (SVGIcon) return <SVGIcon width={36} height={36} />;

  return <DefaultView />;
}
