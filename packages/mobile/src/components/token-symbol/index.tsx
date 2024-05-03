import React, { FunctionComponent } from "react";
import FastImage from "react-native-fast-image";
import { VectorCharacter } from "components/vector-character";
import { IconButton } from "components/new/button/icon";
import { ViewStyle } from "react-native";
import { useStyle } from "styles/index";

export const TokenSymbol: FunctionComponent<{
  image: string;
  size: number;
  imageScale?: number;
}> = ({ size, image, imageScale = 32 / 44 }) => {
  const style = useStyle();

  return (
    <React.Fragment>
      {image.length > 1 ? (
        <FastImage
          style={{
            width: size * imageScale,
            height: size * imageScale,
          }}
          resizeMode={FastImage.resizeMode.contain}
          source={{
            uri: image,
          }}
        />
      ) : (
        <IconButton
          icon={
            <VectorCharacter
              char={image}
              height={Math.floor(size * 0.35)}
              color="white"
            />
          }
          iconStyle={style.flatten(["padding-10", "items-center"]) as ViewStyle}
          containerStyle={{ width: size, height: size }}
        />
      )}
    </React.Fragment>
  );
};
