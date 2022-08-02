import { observer } from "mobx-react-lite";
import React from "react";
import { useIntl } from "react-intl";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";
import { Card } from "../../card";
import { FontAwesomeIcon } from "../../font-awesome-icon";
import { App, AppsStore } from "../../stores";
import { Tile, Tiles } from "../../tiles";

const styles = StyleSheet.create({
  card: {
    height: "100%",
    justifyContent: "space-between",
  },
});

export interface HomeProps {
  appsStore: AppsStore;
  onAppPress: (app: App) => void;
  onAppStorePress: () => void;
  marginBottom?: number;
}

export const Home = observer<HomeProps>(
  ({ appsStore, onAppPress, onAppStorePress, marginBottom }) => {
    const [editMode, setEditMode] = React.useState(false);
    const intl = useIntl();

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
            <View
              style={{
                marginBottom,
                height: 50,
                marginHorizontal: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 28,
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <View
                  style={{ flex: 1, height: 1, backgroundColor: "#16152B" }}
                />
                <View
                  style={{
                    position: "absolute",
                    margin: "auto",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#090817",
                      alignSelf: "center",
                      alignItems: "center",
                      paddingHorizontal: 20,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPaperclip}
                      // @ts-expect-error
                      size={Platform.OS === "web" ? "1x" : 24}
                      style={{ color: "#393853", marginRight: 6 }}
                    />
                    <Text style={{ color: "#787B9C" }}>
                      GO TO SPECIFIC LINK
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "#16152B",
                    zIndex: -1,
                  }}
                />
              </View>
              <View
                style={{
                  backgroundColor: "#6959E6",
                  padding: 1,
                  borderRadius: 12,
                  flexDirection: "row",
                }}
              >
                <TextInput
                  defaultValue="www.keplr_wallet.com"
                  style={{
                    flex: 1,
                    backgroundColor: "#090817",
                    fontSize: 14,
                    fontWeight: "500",
                    borderRadius: 12,
                    paddingLeft: 20,
                    color: "#F6F5FF",
                  }}
                  placeholder="Search"
                />
                <TouchableHighlight
                  style={{
                    width: 56,
                    height: 56,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      // @ts-expect-error
                      size={Platform.OS === "web" ? "1x" : 24}
                      color="#fff"
                    />
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          </Card>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
);
