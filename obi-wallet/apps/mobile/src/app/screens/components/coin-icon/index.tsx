import React from "react";
import { Image, View } from "react-native";
import { SvgProps } from "react-native-svg";

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
