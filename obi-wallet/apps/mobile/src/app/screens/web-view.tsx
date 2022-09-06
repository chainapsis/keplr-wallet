import { faBookmark } from "@fortawesome/free-solid-svg-icons/faBookmark";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons/faEllipsis";
import { faHeart } from "@fortawesome/free-solid-svg-icons/faHeart";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { App, Text, fetchMeta } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { ConnectedWebView } from "./components/connected-web-view";

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

    const safeArea = useSafeAreaInsets();

    useEffect(() => {
      const fetchMetadata = async () => {
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

          const normalizedIcon = icon.endsWith("/")
            ? icon.substr(0, icon.length - 1)
            : icon;

          setCurrentAppMetadata({ ...app, icon: normalizedIcon, label: title });
        } catch (e) {
          console.log(e);
        }
      };
      if (loaded) {
        fetchMetadata();
      }
    }, [app, currentUrl, loaded]);

    const refBottomSheet = useRef<BottomSheet>(null);
    const triggerBottomSheet = (index) => {
      if (index === -1) {
        refBottomSheet.current.close();
      } else {
        refBottomSheet.current.snapToIndex(index);
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
            {/* <FavButton app={currentAppMetadata} /> */}
            <TouchableOpacity onPress={() => triggerBottomSheet(0)}>
              <FontAwesomeIcon
                icon={faEllipsis}
                style={{
                  color: "white",
                  transform: [{ rotate: "90deg" }],
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ConnectedWebView
          url={currentUrl}
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
          snapPoints={["40%", "80%"]}
          enablePanDownToClose={true}
          ref={refBottomSheet}
          index={-1}
        >
          <BottomSheetView style={{ flex: 1, backgroundColor: "transparent" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <FavButton app={currentAppMetadata} />
              <TouchableOpacity onPress={() => triggerBottomSheet(-1)}>
                <FontAwesomeIcon icon={faTimes} style={{ color: "white" }} />
              </TouchableOpacity>
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
    <TouchableOpacity
      onPress={() => {
        if (isFavorite) {
          appsStore.removeFavoriteByUrl(app.url);
        } else {
          appsStore.addFavorite(app);
        }
      }}
      style={{
        height: 36,
        width: 36,
        backgroundColor: "gray",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
      }}
    >
      <FontAwesomeIcon
        icon={isFavorite ? faHeart : faBookmark}
        style={{ color: "black" }}
      />
    </TouchableOpacity>
  );
});
