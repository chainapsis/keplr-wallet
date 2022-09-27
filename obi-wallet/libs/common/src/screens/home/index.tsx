import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons/faPaperclip";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";
import { useIntl } from "react-intl";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import { SvgProps } from "react-native-svg";

import { Card } from "../../card";
import { FontAwesomeIcon } from "../../font-awesome-icon";
import { App, AppsStore, WalletStore, WalletType } from "../../stores";
import { Tile, Tiles } from "../../tiles";
import { Text } from "../../typography";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: "space-between",
  },
});

export interface HomeProps {
  appsStore: AppsStore;
  walletStore: WalletStore;
  onAppPress: (app: App) => void;
  marginBottom?: number;
  icons: FC<SvgProps>[];
}

export const Home = observer<HomeProps>(
  ({ appsStore, onAppPress, marginBottom, walletStore, icons }) => {
    const [
      BuyCryptoIcon,
      CosmicPartyIcon,
      GetTicketsIcon,
      MyTicketsIcon,
      HistoryIcon,
    ] = icons;
    const [editMode, setEditMode] = useState(false);
    const [url, setUrl] = useState("Enter URL (some dapps not yet supported)");
    const intl = useIntl();

    return (
      <SafeAreaView
        style={{
          flex: 1,
          marginBottom,
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

          <ScrollView style={{ flex: 1 }}>
            <Tiles>
              {appsStore.favorites.map((app) => {
                return (
                  <Tile
                    onLongPress={() => {
                      setEditMode(true);
                    }}
                    key={app.url}
                    imgURL={app.icon}
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
                onLongPress={() => {
                  setEditMode(true);
                }}
                ImgComponent={BuyCryptoIcon}
                label={intl.formatMessage({
                  id: "apps.kado",
                  defaultMessage: "Buy with Card",
                })}
                onPress={() => {
                  onAppPress({
                    label: "Buy with Card",
                    url: `https://app.kado.money?network=JUNO&onToAddress=${walletStore.address}&apiKey=0a5fc82b-be15-4059-8edf-9ff9c54186ce`,
                    icon: "https://place-hold.it/180x180",
                  });
                }}
              />
              <Tile
                onLongPress={() => {
                  setEditMode(true);
                }}
                ImgComponent={CosmicPartyIcon}
                label="Cosmic 5 Party"
                onPress={() => {
                  onAppPress({
                    label: "Cosmic 5 Party",
                    url: `https://events.loop.markets`,
                    icon: "https://place-hold.it/180x180",
                  });
                }}
              />
              <Tile
                onLongPress={() => {
                  setEditMode(true);
                }}
                ImgComponent={GetTicketsIcon}
                label={intl.formatMessage({
                  id: "apps.gettickets",
                  defaultMessage: "Get Tickets",
                })}
                onPress={() => {
                  onAppPress({
                    label: "Get Tickets",
                    url: `https://nft-juno-dev.loop.do/webapp/tickets`,
                    icon: "https://place-hold.it/180x180",
                  });
                }}
              />
              <Tile
                onLongPress={() => {
                  setEditMode(true);
                }}
                ImgComponent={MyTicketsIcon}
                label={intl.formatMessage({
                  id: "apps.mytickets",
                  defaultMessage: "My Tickets",
                })}
                onPress={() => {
                  onAppPress({
                    label: "My Tickets",
                    url: `https://nft-juno-dev.loop.do/webapp/mytickets`,
                    icon: "https://place-hold.it/180x180",
                  });
                }}
              />
              <Tile
                onLongPress={() => {
                  setEditMode(true);
                }}
                ImgComponent={HistoryIcon}
                label={intl.formatMessage({
                  id: "apps.myhistory",
                  defaultMessage: "History",
                })}
                onPress={() => {
                  onAppPress({
                    label: "History",
                    url:
                      walletStore.type === WalletType.SINGLESIG
                        ? `https://mintscan.io/juno/account/${walletStore.address}`
                        : `https://mintscan.io/juno/wasm/contract/${walletStore.address}`,
                    icon: "https://place-hold.it/180x180",
                  });
                }}
              />
            </Tiles>
          </ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ paddingVertical: 10 }}
            keyboardVerticalOffset={100}
          >
            <View
              style={{
                marginHorizontal: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 28,
                  alignItems: "center",
                  position: "relative",
                  paddingVertical: 2,
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
                  defaultValue="Enter URL (some dapps not yet supported)"
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
          </KeyboardAvoidingView>
        </Card>
      </SafeAreaView>
    );
  }
);
