import React, { FunctionComponent, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useStyle } from "../../styles";
import { RectButton } from "../../components/rect-button";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";

const imageSizeCache: Map<
  any,
  {
    width: number;
    height: number;
  }
> = new Map();

export const WebpageImageButton: FunctionComponent<{
  name?: string;
  source?: ImageSourcePropType;
  onPress?: () => void;

  nameContainerStyle?: ViewStyle;
  overlayStyle?: ViewStyle;
  nameAppend?: React.ReactElement;
  overrideInner?: React.ReactElement;

  imageAlignCenter?: boolean;
}> = ({
  name,
  source,
  onPress,
  nameContainerStyle,
  overlayStyle,
  nameAppend,
  overrideInner,
  imageAlignCenter,
}) => {
  const style = useStyle();

  const height = 104;

  const sourceId = (() => {
    if (source) {
      if (typeof source === "number") {
        return source;
      } else if (Array.isArray(source)) {
        return source.map((source) => source.uri).join(",");
      } else {
        return source.uri;
      }
    }
  })();

  /*
    Adjust the size of image view manually because react native's resize mode doesn't provide the flexible API.
    First load the image view with invisible,
    after it is loaded, obtain the image view's size and the appropriate size is set accordingly to it.
   */
  const [imageSize, setImageSize] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(() => {
    if (sourceId != null) {
      return imageSizeCache.get(sourceId);
    }
  });

  const imageRef = useRef<Image | null>(null);
  const onImageLoaded = () => {
    if (imageRef.current) {
      imageRef.current.measure((_x, _y, measureWidth, measureHeight) => {
        const size = {
          width: (measureWidth / measureHeight) * height,
          height,
        };

        if (sourceId != null) {
          imageSizeCache.set(sourceId, size);
        }

        setImageSize(size);
      });
    }
  };

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          "flex-row",
          "items-center",
          "overflow-hidden",
          "border-radius-8",
          "background-color-gray-100@50%",
          "dark:background-color-platinum-500@50%",
          "margin-bottom-16",
        ]),
        {
          height,
        },
      ])}
    >
      {source ? (
        <View
          style={style.flatten(
            ["absolute-fill", "items-end"],
            [imageAlignCenter && "items-center"]
          )}
        >
          <Image
            ref={imageRef}
            style={
              imageSize
                ? {
                    width: imageSize.width,
                    height: imageSize.height,
                  }
                : {
                    opacity: 0,
                  }
            }
            onLoadEnd={onImageLoaded}
            source={source}
            fadeDuration={0}
          />
          {!imageSize ? (
            /* Temporal view for avoid flicker during image size loading */
            <View
              style={style.flatten([
                "absolute-fill",
                "background-color-black",
                "opacity-70",
              ])}
            />
          ) : null}
          {imageSize ? (
            <View
              style={StyleSheet.flatten([
                style.flatten([
                  "absolute-fill",
                  "background-color-black",
                  "opacity-40",
                ]),
                overlayStyle,
              ])}
            />
          ) : null}
        </View>
      ) : null}
      <View style={style.flatten(["absolute-fill"])}>
        <RectButton
          style={StyleSheet.flatten([
            style.flatten(["flex-row", "items-center", "padding-x-38"]),
            { height },
          ])}
          activeOpacity={0.2}
          underlayColor={style.get("color-white").color}
          enabled={onPress != null}
          onPress={onPress}
        >
          {overrideInner ? (
            overrideInner
          ) : (
            <React.Fragment>
              <View style={nameContainerStyle}>
                <Text style={style.flatten(["h2", "color-white"])}>{name}</Text>
                {nameAppend}
              </View>
              <View style={style.get("flex-1")} />
              <GoIcon
                width={34.7}
                height={21}
                color={style.get("color-white").color}
              />
            </React.Fragment>
          )}
        </RectButton>
      </View>
    </View>
  );
};

const GoIcon: FunctionComponent<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 38, height = 23, color = "white" }) => {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 38 23">
      <G clipPath="url(#clip0_4026_25847)">
        <Path
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          d="M25.91 2.125l9.362 9.375-9.363 9.375m8.063-9.375H2.5"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_4026_25847">
          <Path
            fill={color}
            d="M0 0H38V23H0z"
            transform="rotate(-180 19 11.5)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
