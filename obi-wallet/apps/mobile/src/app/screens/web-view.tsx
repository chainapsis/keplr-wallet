import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { App, Text } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useLayoutEffect } from "react";
import { Button, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { StackParamList } from "../stack";
import { useStore } from "../stores";

export type WebViewScreenProps = NativeStackScreenProps<
  StackParamList,
  "web-view"
>;

export const WebViewScreen = observer<WebViewScreenProps>(
  ({ navigation, route }) => {
    const { app } = route.params;
    const safeArea = useSafeAreaInsets();

    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => {
          return <FavButton app={app} />;
        },
      });
    }, [app, navigation]);

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
            {app.label}
          </Text>
        </View>
        <WebView
          source={{ uri: app.url }}
          originWhitelist={[`${app.url}*`]}
          style={{ flex: 1, width: "100%", height: "100%" }}
        />
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
