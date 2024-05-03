import React, { FunctionComponent, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import WebView from "react-native-webview";
import { PageWithView } from "components/page";
import { ActivityIndicator } from "react-native";
import { useStyle } from "styles/index";

export const WebViewScreen: FunctionComponent = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          url: string;
        }
      >,
      any
    >
  >();

  const url = route.params.url;
  const style = useStyle();
  const [isLoading, setLoading] = useState<boolean>(true);

  return (
    <PageWithView backgroundMode={"image"}>
      <WebView
        source={{ uri: url }}
        onLoadEnd={(syntheticEvent) => {
          // update component to be aware of loading status
          const { nativeEvent } = syntheticEvent;
          if (!nativeEvent.loading) {
            setLoading(false);
          }
        }}
      />
      {isLoading && (
        <ActivityIndicator
          size="large"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
          color={style.get("color-indigo-900").color}
        />
      )}
    </PageWithView>
  );
};
