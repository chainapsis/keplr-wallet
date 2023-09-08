import React, { FunctionComponent, useMemo, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "../../components/page";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LabelSelector } from "./components/label-selector";
import {
  DaoDaoItem,
  InjectiveItem,
  Item,
  MarsItem,
  OsmosisItem,
  RegenItem,
  StargazeItem,
  StrideItem,
  UmeeItem,
  WYNDDaoItem,
  PStakeItem,
  StreamSwapItem,
  IBCXItem,
  IONDaoItem,
  CalcFiItem,
  DexterItem,
  LevanaItem,
} from "./constants";
import { WebpageImageButton } from "./common";
import { TextInput } from "../../components/input";
import { useSmartNavigation } from "../../navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { GlobeIcon, TrashCanIcon } from "../../components/icon";
import { TouchableOpacity } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { RectButton } from "../../components/rect-button";

const WebpagesPerLabel: {
  label: string;
  items: Item[];
}[] = [
  {
    label: "All",
    items: [
      OsmosisItem,
      StargazeItem,
      WYNDDaoItem,
      DaoDaoItem,
      InjectiveItem,
      MarsItem,
      UmeeItem,
      StrideItem,
      PStakeItem,
      RegenItem,
      StreamSwapItem,
      IBCXItem,
      IONDaoItem,
      CalcFiItem,
      DexterItem,
      LevanaItem,
    ],
  },
  {
    label: "Defi",
    items: [
      OsmosisItem,
      WYNDDaoItem,
      InjectiveItem,
      MarsItem,
      UmeeItem,
      StrideItem,
      PStakeItem,
      StreamSwapItem,
      IBCXItem,
      CalcFiItem,
      DexterItem,
      LevanaItem,
    ],
  },
  {
    label: "NFT",
    items: [StargazeItem],
  },
  {
    label: "DAO",
    items: [DaoDaoItem, IONDaoItem],
  },
  {
    label: "Refi",
    items: [RegenItem],
  },
];

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

const ArrowDownIcon: FunctionComponent<{ size: number; color: string }> = ({
  size = 20,
  color,
}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 20 20">
      <Path
        d="M10.7894 13.9851C10.389 14.4999 9.61101 14.4999 9.21065 13.9851L4.25529 7.61394C3.7444 6.95708 4.21249 6 5.04464 6H14.9554C15.7875 6 16.2556 6.95708 15.7447 7.61394L10.7894 13.9851Z"
        fill={color}
      />
    </Svg>
  );
};

const ArrowUpIcon: FunctionComponent<{ size: number; color: string }> = ({
  size = 20,
  color,
}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 20 20">
      <Path
        d="M9.21065 6.01488C9.61101 5.50013 10.389 5.50014 10.7894 6.01488L15.7447 12.3861C16.2556 13.0429 15.7875 14 14.9554 14L5.04464 14C4.21249 14 3.7444 13.0429 4.25529 12.3861L9.21065 6.01488Z"
        fill={color}
      />
    </Svg>
  );
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

  const safeAreaInsets = useSafeAreaInsets();

  const [selectedLabelKey, setSelectedLabelKey] = useState(
    WebpagesPerLabel[0].label
  );

  const smartNavigation = useSmartNavigation();

  const webpages = useMemo(() => {
    return WebpagesPerLabel.find((label) => label.label === selectedLabelKey)!;
  }, [selectedLabelKey]);

  const [uri, setURI] = useState("");
  const [uriError, setURIError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

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

      <React.Fragment>
        <RectButton
          style={style.flatten(["flex-row", "items-center"])}
          onPress={() => {
            if (favoriteWebpageStore.urls.length > 2) {
              setIsFavorite(!isFavorite);
            }
          }}
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
            {favoriteWebpageStore.urls.length > 0
              ? favoriteWebpageStore.urls.length
              : ""}
          </Text>

          <View>
            {isFavorite ? (
              <ArrowUpIcon
                size={20}
                color={
                  style.flatten([
                    "color-platinum-300",
                    "dark:color-platinum-200",
                  ]).color
                }
              />
            ) : (
              <ArrowDownIcon
                size={20}
                color={
                  style.flatten([
                    "color-platinum-300",
                    "dark:color-platinum-200",
                  ]).color
                }
              />
            )}
          </View>
        </RectButton>

        {favoriteWebpageStore.urls.length > 0 ? (
          favoriteWebpageStore.urls
            .filter((_, index) => (isFavorite ? true : index < 2))
            .map((url) => {
              return (
                <RectButton
                  key={url}
                  style={style.flatten([
                    "flex-row",
                    "items-center",
                    "padding-x-20",
                    "padding-top-16",
                    "padding-bottom-20",
                    "margin-top-12",
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
      </React.Fragment>

      {Platform.OS === "android" ? (
        <React.Fragment>
          <Text
            style={style.flatten([
              "h1",
              "color-text-high",
              "margin-top-38",
              "margin-bottom-20",
            ])}
          >
            Discover Apps
          </Text>
          <LabelSelector
            selectedKey={selectedLabelKey}
            labels={WebpagesPerLabel.map((label) => {
              return {
                key: label.label,
                label: label.label,
              };
            })}
            onLabelSelect={setSelectedLabelKey}
          />
          {webpages.items.map((item) => {
            return <item.component key={item.key} />;
          })}
          <WebpageImageButton
            overrideInner={
              <View style={style.flatten(["flex-1", "items-center"])}>
                <Text
                  style={style.flatten([
                    "h4",
                    "color-gray-200",
                    "dark:color-platinum-300",
                  ])}
                >
                  Coming soon
                </Text>
              </View>
            }
          />
        </React.Fragment>
      ) : null}
    </PageWithScrollViewInBottomTabView>
  );
});
