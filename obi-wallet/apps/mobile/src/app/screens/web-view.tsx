import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons/faRotateRight";
import { faShare } from "@fortawesome/free-solid-svg-icons/faShare";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { App, fetchMeta, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Share, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { ConnectedWebView } from "./components/connected-web-view";
import Fav from "./webview-assets/favorite-24px.svg";
import UnFav from "./webview-assets/unfavorite-24px.svg";

export type WebViewScreenProps = NativeStackScreenProps<
  StackParamList,
  "web-view"
>;

export const WebViewScreen = observer<WebViewScreenProps>(
  ({ navigation, route }) => {
    const { app } = route.params;
    const [currentAppMetadata, setCurrentAppMetadata] = useState(app);
    const [currentUrl, setCurrentUrl] = useState(app.url);
    const [loaded, setLoaded] = useState(false);
    const [title, setTitle] = useState(app.label);
    const webViewRef = useRef<WebView>(null);

    const safeArea = useSafeAreaInsets();

    useEffect(() => {
      if (loaded) {
        void (async () => {
          //fetch title from app url html
          try {
            const { title, icon } = await fetchMeta(app.url);
            //
            // const res = await axios.get(app.url);
            // const html = res.data;
            // const root = await parse(html);
            // // get the page manifest
            // const manifest = root.querySelector('link[rel="manifest"]');
            // const manifestUrl = manifest?.attributes.href;
            // console.log({ manifestUrl });
            // //get host from currentUrl
            // const host = currentUrl.split("/")[2];
            // console.log({ host }, host + manifestUrl);
            // const manifestRes = await axios.get("https://" + host + manifestUrl);
            // console.log(manifestRes.data.icons);
            // //get the largest icon from manifestres.data.icons
            // const largestIcon = manifestRes.data.icons.sort(
            //   (a, b) => b.sizes.length - a.sizes.length
            // )[0];
            // // if largestIcon is a url keep it else compose it from host and largestIcon.src
            // const icon = largestIcon.src.startsWith("http")
            //   ? largestIcon.src
            //   : "https://" + host + largestIcon.src;

            const normalizedIcon = icon?.endsWith("/")
              ? icon.substr(0, icon.length - 1)
              : icon;

            setCurrentAppMetadata({
              ...app,
              icon: normalizedIcon,
              label: title ?? app.url,
            });
          } catch (e) {
            console.log(e);
          }
        })();
      }
    }, [app, currentUrl, loaded]);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const triggerBottomSheet = (index: number) => {
      if (index === -1) {
        bottomSheetRef.current?.close();
      } else {
        bottomSheetRef.current?.snapToIndex(index);
      }
    };
    return (
      <View style={{ flex: 1, backgroundColor: "#090817" }}>
        <View
          style={{
            marginTop: safeArea.top,
            height: 40,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("state-renderer")}
            style={{ paddingLeft: 10 }}
          >
            <FontAwesomeIcon icon={faTimes} style={{ color: "white" }} />
          </TouchableOpacity>
          <View
            style={{
              paddingLeft: 20,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: "white", fontWeight: "bold" }}
            >
              {title}
            </Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => triggerBottomSheet(0)}>
              <FontAwesomeIcon
                icon={faEllipsis}
                style={{
                  color: "white",
                  margin: 5,
                  transform: [{ rotate: "90deg" }],
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ConnectedWebView
          url={currentUrl}
          webViewRef={webViewRef}
          onLoadEnd={() => {
            setLoaded(true);
          }}
          style={{ flex: 1, width: "100%", height: "100%" }}
          onNavigationStateChange={(e) => {
            setCurrentUrl(e.url);
            setTitle(e.title);
          }}
        />
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: "white" }}
          backgroundStyle={{ backgroundColor: "#24243C" }}
          handleStyle={{ backgroundColor: "transparent" }}
          snapPoints={["25%"]}
          enablePanDownToClose={true}
          ref={bottomSheetRef}
          index={-1}
        >
          <BottomSheetView style={{ flex: 1, backgroundColor: "transparent" }}>
            <TouchableOpacity
              onPress={() => triggerBottomSheet(-1)}
              style={{
                alignSelf: "flex-end",
                marginRight: 10,
                marginBottom: 10,
              }}
            >
              <FontAwesomeIcon icon={faTimes} style={{ color: "white" }} />
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <FavButton app={currentAppMetadata} />
              <RefreshButton onPress={() => webViewRef.current?.reload()} />
              <ShareButton url={currentUrl} />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    );
  }
);

const FavButton = observer<{ app: App }>(({ app }) => {
  const { appsStore } = useStore();
  const isFavorite = appsStore.hasFavorite(app.url);

  return (
    <SheetButton
      onPress={() => {
        if (isFavorite) {
          appsStore.removeFavoriteByUrl(app.url);
        } else {
          appsStore.addFavorite(app);
        }
      }}
      IconComponent={
        isFavorite ? (
          <UnFav width={24} height={24} fill="black" />
        ) : (
          <Fav width={24} height={24} fill="black" />
        )
      }
      label={isFavorite ? "Remove" : "Add"}
    />
  );
});

export function RefreshButton({ onPress }: { onPress: () => void }) {
  return (
    <SheetButton
      onPress={() => onPress()}
      IconComponent={
        <FontAwesomeIcon icon={faRotateRight} style={{ color: "black" }} />
      }
      label="Refresh"
    />
  );
}
export function ShareButton({ url }: { url: string }) {
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: url,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (e) {
      const error = e as Error;
      alert(error.message);
    }
  };

  return (
    <SheetButton
      onPress={() => onShare()}
      IconComponent={
        <FontAwesomeIcon icon={faShare} style={{ color: "black" }} />
      }
      label="Share"
    />
  );
}

export function SheetButton({
  onPress,
  IconComponent,
  label,
}: {
  onPress: () => void;
  IconComponent: JSX.Element;
  label: string;
}) {
  return (
    <View style={{ justifyContent: "center", alignItems: "center", width: 60 }}>
      <TouchableOpacity
        onPress={() => onPress()}
        style={{
          height: 50,
          width: 50,
          backgroundColor: "gray",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
        }}
      >
        {IconComponent}
      </TouchableOpacity>
      <Text style={{ marginTop: 5, color: "white", opacity: 0.6 }}>
        {label}
      </Text>
    </View>
  );
}
