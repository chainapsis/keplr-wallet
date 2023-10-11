import React, { FunctionComponent, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "../../components/input";
import { useSmartNavigation } from "../../navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { GlobeIcon, TrashCanIcon } from "../../components/icon";
import { TouchableOpacity } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { RectButton } from "../../components/rect-button";
import { RectButton as NativeRectButton } from "react-native-gesture-handler";

const validURL = (uri: string) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return pattern.test(uri);
};

const EmptyIcon: FunctionComponent<{ size: number; color: string }> = ({
  size = 72,
  color,
}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 72 72">
      <Path
        d="M45 40.5H27M39.182 18.932L32.818 12.568C31.9741 11.7241 30.8295 11.25 29.636 11.25H13.5C9.77208 11.25 6.75 14.2721 6.75 18V54C6.75 57.7279 9.77208 60.75 13.5 60.75H58.5C62.2279 60.75 65.25 57.7279 65.25 54V27C65.25 23.2721 62.2279 20.25 58.5 20.25H42.364C41.1705 20.25 40.0259 19.7759 39.182 18.932Z"
        stroke={color}
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const WebScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const { favoriteWebpageStore } = useStore();

  const dAppPageUrl = "https://explore.keplr.app";
  const safeAreaInsets = useSafeAreaInsets();

  const smartNavigation = useSmartNavigation();

  const [uri, setURI] = useState("");
  const [uriError, setURIError] = useState("");

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode="gradient"
      contentContainerStyle={style.get("flex-grow-1")}
      style={StyleSheet.flatten([
        style.flatten(["padding-x-20"]),
        {
          marginTop: safeAreaInsets.top,
        },
      ])}
    >
      <Text style={style.flatten(["h1", "color-text-high", "margin-top-44"])}>
        Explore Apps
      </Text>
      <TextInput
        returnKeyType="go"
        value={uri}
        error={uriError}
        placeholder="Search or type URL"
        placeholderTextColor={
          style.flatten(["color-gray-200", "dark:color-platinum-300"]).color
        }
        onChangeText={(text) => {
          setURI(text);
          setURIError("");
        }}
        onSubmitEditing={() => {
          if (validURL(uri) || uri.includes("localhost")) {
            setURIError("");
            smartNavigation.pushSmart("Web.Custom", { url: uri });
            setURI("");
          } else {
            setURIError("Invalid URL");
          }
        }}
        autoCorrect={false}
        autoCapitalize="none"
        autoCompleteType="off"
      />

      <View
        style={style.flatten([
          "relative",
          "margin-bottom-12",
          "border-radius-8",
          "overflow-hidden",
        ])}
      >
        <Image
          source={require("../../assets/image/webpage/dapp-banner.png")}
          style={{
            width: Dimensions.get("screen").width - 40,
            height: (Dimensions.get("screen").width - 40) / 4.7925,
          }}
          fadeDuration={0}
        />
        <View style={style.flatten(["absolute-fill", "flex"])}>
          <NativeRectButton
            style={style.flatten(["flex-1"])}
            rippleColor={style.get("color-rect-button-default-ripple").color}
            underlayColor={
              style.get("color-rect-button-default-underlay").color
            }
            activeOpacity={0.2}
            onPress={() => {
              smartNavigation.pushSmart("Web.Custom", { url: dAppPageUrl });
            }}
          />
        </View>
      </View>

      <View
        style={style.flatten(["flex-row", "items-center", "margin-bottom-12"])}
      >
        <Text
          style={style.flatten([
            "body3",
            "margin-right-4",
            "color-platinum-300",
            "dark:color-platinum-200",
          ])}
        >
          Favorite
        </Text>

        <Text
          style={style.flatten([
            "subtitle2",
            "margin-right-4",
            "color-blue-400",
          ])}
        >
          {favoriteWebpageStore.urls.length}
        </Text>
      </View>

      {favoriteWebpageStore.urls.length > 0 ? (
        favoriteWebpageStore.urls.map((url) => {
          return (
            <RectButton
              key={url}
              style={style.flatten([
                "flex-row",
                "items-center",
                "padding-x-16",
                "padding-y-20",
                "margin-bottom-12",
                "border-radius-8",
                "background-color-white",
                "dark:background-color-platinum-600",
              ])}
              onPress={() => {
                smartNavigation.pushSmart("Web.Custom", { url });
              }}
            >
              <View style={style.flatten(["margin-right-16"])}>
                <GlobeIcon
                  size={24}
                  color={style.flatten(["color-blue-400"]).color}
                />
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={style.flatten([
                  "subtitle3",
                  "color-platinum-400",
                  "dark:color-platinum-50",
                  "flex-1",
                ])}
              >
                {url
                  .replace("https://", "")
                  .replace("http://", "")
                  .replace("www.", "")}
              </Text>
              <TouchableOpacity
                style={style.flatten(["padding-12"])}
                onPress={() => {
                  favoriteWebpageStore.removeUrl(url);
                }}
              >
                <TrashCanIcon
                  color={
                    style.flatten(["color-gray-100", "dark:color-gray-200"])
                      .color
                  }
                  size={24}
                />
              </TouchableOpacity>
            </RectButton>
          );
        })
      ) : (
        <View
          style={style.flatten([
            "flex-column",
            "items-center",
            "margin-top-16",
            "padding-20",
          ])}
        >
          <EmptyIcon
            size={72}
            color={
              style.flatten(["color-gray-200", "dark:color-gray-400"]).color
            }
          />

          <Text
            style={style.flatten([
              "subtitle3",
              "color-gray-200",
              "dark:color-gray-400",
              "margin-top-12",
            ])}
          >
            No Favorites Yet
          </Text>
        </View>
      )}
    </PageWithScrollViewInBottomTabView>
  );
});
