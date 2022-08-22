import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDebounce } from "rooks";

import { AppsStore } from "../../stores";
import { Tile, Tiles } from "../../tiles";
import { Text } from "../../typography";
import { fetchMeta } from "./fetch-meta";

const appStoreStyles = StyleSheet.create({
  appIcon: {
    width: 90,
    height: 90,
  },
});

export interface AppStoreProps {
  appsStore: AppsStore;
  onAfterAppAdded: () => void;
}

export const AppStore: FunctionComponent<AppStoreProps> = observer(
  ({ appsStore, onAfterAppAdded }) => {
    const knownApps = appsStore.getKnownApps();

    const [url, setUrl] = React.useState("");

    function setUrlWithProtocol(url: string) {
      setUrl(`https://${url}`);
    }

    // @ts-ignore Some type issues with rooks
    const setUrlDebounce = useDebounce(setUrlWithProtocol, 500);

    const [title, setTitle] = React.useState("");
    const [icon, setIcon] = React.useState("");

    React.useEffect(() => {
      fetchMeta(url)
        .then((meta) => {
          setTitle(meta.title ?? "");
          setIcon(meta.icon ?? "");
        })
        .catch(() => {
          setTitle("");
          setIcon("");
        });
    }, [url]);

    return (
      <View>
        <Text>Add your own</Text>
        <TextInput
          placeholder="URL"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          onChangeText={(text) => {
            setUrlDebounce(text);
          }}
          keyboardType="url"
        />
        <TextInput
          placeholder="Title"
          onChangeText={(text) => {
            setTitle(text);
          }}
          value={title}
        />
        <Image
          style={appStoreStyles.appIcon}
          source={{
            uri: icon,
          }}
        />
        <TouchableOpacity
          onPress={() => {
            appsStore.addFavorite({
              label: title,
              url,
              icon,
            });
            onAfterAppAdded();
          }}
        >
          <Text>Add</Text>
        </TouchableOpacity>
        <Text>Suggestions</Text>
        <Tiles>
          {knownApps.map((app) => {
            const included = appsStore.hasFavorite(app.url);
            return (
              <Tile
                key={app.url}
                img={app.icon}
                label={app.label}
                disabled={!included}
                onPress={() => {
                  if (included) {
                    appsStore.removeFavoriteByUrl(app.url);
                  } else {
                    appsStore.addFavorite(app);
                  }
                }}
              />
            );
          })}
        </Tiles>
      </View>
    );
  }
);
