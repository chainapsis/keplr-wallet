import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Button } from "react-native";
import { WebView } from "react-native-webview";
import { observer } from "mobx-react-lite";

import { StackParamList } from "../stack";
import { useStore } from "../stores";
import { App } from "@obi-wallet/common";

export type WebViewScreenProps = NativeStackScreenProps<
  StackParamList,
  "web-view"
>;

export const WebViewScreen = observer<WebViewScreenProps>(
  ({ navigation, route }) => {
    const { app } = route.params;

    React.useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => {
          return <FavButton app={app} />;
        },
      });
    }, [app, navigation]);

    return (
      <WebView source={{ uri: app.url }} originWhitelist={[`${app.url}*`]} />
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
