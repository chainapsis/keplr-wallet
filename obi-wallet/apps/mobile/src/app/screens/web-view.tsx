import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { App, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useLayoutEffect } from "react";
import React, { useEffect } from "react";

import { parse } from 'node-html-parser'
import { Button, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import axios from "axios";
import BottomSheet from "./components/bottom-sheet";

export type WebViewScreenProps = NativeStackScreenProps<
  StackParamList,
  "web-view"
>;

export const WebViewScreen = observer<WebViewScreenProps>(
  ({ navigation, route }) => {
    const { app } = route.params;
    const [currentAppMetadata, setCurrentAppMetadata] = React.useState<App>(app);
    const [currentUrl, setCurrentUrl] = React.useState<string>(app.url);
    const [loaded, setLoaded] = React.useState<boolean>(false);
    const [title, setTitle] = React.useState<string>(app.label);
    const [visible, setVisible] = React.useState<boolean>(false);

    const safeArea = useSafeAreaInsets();

    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => {
          return <FavButton app={app} />;
        },
      });
    }, [app, navigation]);

    useEffect(() => {
      const fetchMetadata = async () => {
        //fetch title from app url html
        try {
          const res = await axios.get(app.url)
          const html = res.data
          const root = await parse(html)
          // get the page manifest
          const manifest = root.querySelector('link[rel="manifest"]')
          const manifestUrl = manifest?.attributes.href
          console.log({ manifestUrl })
          //get host from currentUrl
          const host = currentUrl.split('/')[2]
          console.log({ host }, host + manifestUrl)
          const manifestRes = await axios.get('https://' + host + manifestUrl)
          console.log(manifestRes.data.icons)
          //get the largest icon from manifestres.data.icons
          const largestIcon = manifestRes.data.icons.sort((a, b) => b.sizes.length - a.sizes.length)[0]
          // if largestIcon is a url keep it else compose it from host and largestIcon.src
          const icon = largestIcon.src.startsWith('http') ? largestIcon.src : 'https://' + host + largestIcon.src

          setCurrentAppMetadata({ ...app, icon, label: manifestRes.data.name })
        } catch (e) {
          console.log(e)
        }

      }
      if (loaded) {
        fetchMetadata()
      }


    }, [app, currentUrl, loaded]);


    return (
      <View style={{ flex: 1, backgroundColor: "#090817" }}>
        <View
          style={{
            marginTop: safeArea.top,
            height: 40,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("state-renderer")}
            style={{ position: "absolute", left: 10 }}
          >
            <FontAwesomeIcon icon={faTimes} style={{ color: "white" }} />
          </TouchableOpacity>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {title}
          </Text>
          <FavButton app={currentAppMetadata} />
          <TouchableOpacity onPress={() => setVisible(true)}>
            <Text style={{ color: 'blue' }}>
              open
            </Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: currentUrl }}
          // originWhitelist={[`${app.url}*`]}
          onLoadEnd={() => {
            console.log("onLoadEnd");
            setLoaded(true);
          }
          }


          style={{ flex: 1, width: "100%", height: "100%" }}
          onNavigationStateChange={(e) => {
            console.log({ e })
            setCurrentUrl(e.url);
            setTitle(e.title)
          }
          }
        />
        <BottomSheet visible={visible} onClose={() => setVisible(false)} >
          <View style={{ backgroundColor: "blue" }}>

            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                margin: 10,

              }}
            >
              aaa
            </Text>
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                margin: 10,
              }}
            >
              aaa
            </Text>
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                margin: 10,
              }}
            >
              aaa
            </Text>
          </View>

        </BottomSheet>

      </View>
    );
  }
);

const FavButton = observer<{ app: App }>(({ app }) => {
  const { appsStore } = useStore();
  const isFavorite = appsStore.hasFavorite(app.url);

  return (
    <Button
      onPress={() => {
        if (isFavorite) {
          appsStore.removeFavoriteByUrl(app.url);
        } else {
          appsStore.addFavorite(app);
        }
      }}
      title={isFavorite ? "Unfav" : "Fav"}
    />
  );
});
