import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useIntl } from "react-intl";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Card } from "../../card";
import { FontAwesomeIcon } from "../../font-awesome-icon";
import { App, AppsStore, MultisigStore } from "../../stores";
import { Tile, Tiles } from "../../tiles";
import { Text } from "../../typography";

const styles = StyleSheet.create({
  card: {
    height: "100%",
    justifyContent: "space-between",
  },
});

export interface HomeProps {
  appsStore: AppsStore;
  multisigStore: MultisigStore;
  onAppPress: (app: App) => void;
  marginBottom?: number;
}

export const Home = observer<HomeProps>(
  ({ appsStore, onAppPress, marginBottom, multisigStore }) => {
    const [editMode, setEditMode] = useState(false);
    const [url, setUrl] = useState("www.keplr_wallet.com");
    const intl = useIntl();

    const proxy = multisigStore.proxyAddress;

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
                img="https://uploads-ssl.webflow.com/61b136082f7fe2121ad5766b/61b2808127b5c10c60f0cbb2_kado1%404x.png"
                label="Fund Wallet"
                onPress={() => {
                  onAppPress({
                    label: "Fund Wallet",
                    url: `https://app.kado.money?address=${proxy?.address}`,
                    icon: "https://place-hold.it/180x180",
                  });
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
                  onChangeText={(text) => {
                    const newText = text.includes("https://")
                      ? text
                      : `https://${text}`;
                    setUrl(newText.toLocaleLowerCase());
                  }}
                  autoCapitalize="none"
                />
                <TouchableHighlight
                  style={{
                    width: 56,
                    height: 56,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    //check if url is a valid url with protocol and domain
                    try {
                      const validURL = new URL(url.trim());
                      //if validURL text has space
                      console.log(validURL, "validURL");
                      if (
                        validURL.toString().includes(" ") ||
                        !validURL.toString().includes(".")
                      ) {
                        throw new Error("Invalid URL");
                      }

                      onAppPress({
                        url: validURL.href,
                        icon: "https://place-hold.it/180x180",
                        label: url,
                      });
                    } catch (error) {
                      console.log(error);
                      //check if it has http:// or https:// and if so remove it
                      const newUrl = url.includes("https://")
                        ? url.replace("https://", "")
                        : url.includes("http://")
                        ? url.replace("http://", "")
                        : url;

                      const searchParam = newUrl.split(" ").join("+");
                      const newSearchUrl = `https://www.google.com/search?q=${searchParam}`;
                      console.log({ newUrl });
                      onAppPress({
                        url: newSearchUrl,
                        label: newUrl,
                        icon: "https://place-hold.it/180x180",
                      });
                    }
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
