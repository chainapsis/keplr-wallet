import { App, AppsStore } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { Button, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../card";
import { Tile, Tiles } from "../../tiles";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    height: "100%",
  },
});

export interface HomeProps {
  appsStore: AppsStore;
  onAppPress: (app: App) => void;
  onAppStorePress: () => void;
}

export const Home: FunctionComponent<HomeProps> = observer(
  ({ appsStore, onAppPress, onAppStorePress }) => {
    const [editMode, setEditMode] = React.useState(false);
    const intl = useIntl();

    return (
      <SafeAreaView>
        <TouchableWithoutFeedback
          onLongPress={() => {
            setEditMode(true);
          }}
        >
          <Card style={styles.card}>
            {editMode ? (
              <Button
                onPress={() => {
                  setEditMode(false);
                }}
                title="Done"
              />
            ) : null}
            <Tiles>
              {appsStore.getFavorites().map((app) => {
                return (
                  <Tile
                    key={app.url}
                    img={app.icon}
                    label={app.label}
                    onRemove={
                      editMode
                        ? () => {
                            appsStore.removeFavoriteByUrl(app.url);
                          }
                        : undefined
                    }
                    onPress={() => {
                      onAppPress(app);
                    }}
                  />
                );
              })}
              <Tile
                img={"https://place-hold.it/180x180"}
                label={intl.formatMessage({ id: "home.appStoreLabel" })}
                onPress={() => {
                  onAppStorePress();
                }}
              />
            </Tiles>
          </Card>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }
);
