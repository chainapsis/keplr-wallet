import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { isMultisigDemoWallet, Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

import { Button, IconButton } from "../button";
import { useStore } from "../stores";
import { Modal, MODAL_TIMING } from "./components/modal";

export interface AccountPickerModalProps {
  visible: boolean;
  open(): void;
  close(): void;
}

export function useAccountPickerModalProps() {
  const [visible, setVisible] = useState(false);
  return {
    visible,
    open() {
      setVisible(true);
    },
    close() {
      setVisible(false);
    },
  };
}

export const AccountPickerModal = observer<AccountPickerModalProps>(
  ({ visible, open, close }) => {
    const { walletsStore } = useStore();

    return (
      <Modal isVisible={visible} onClose={close}>
        <View style={{ flexShrink: 1 }}>
          <View>
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 24,
                fontWeight: "600",
              }}
            >
              <FormattedMessage id="login.title" defaultMessage="Login" />
            </Text>
            <Text
              style={{
                color: "#999CB6",
                fontSize: 14,
                marginTop: 10,
              }}
            >
              <FormattedMessage
                id="login.subtext"
                defaultMessage="We found various wallets on-device. You can log back in or add a new one."
              />
            </Text>
          </View>
          <ScrollView>
            {walletsStore.readyWallets.map((wallet) => {
              return (
                <TouchableOpacity
                  key={wallet.id}
                  style={{
                    height: 79,
                    width: "100%",
                    backgroundColor: "#111023",
                    marginBottom: 20,
                    flexDirection: "row",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                  }}
                  onPress={() => {
                    close();
                    setTimeout(() => {
                      void walletsStore.setCurrentWallet(wallet.id);
                    }, MODAL_TIMING);
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#F6F5FF",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {wallet.shortenedAddress}
                    </Text>
                    <Text
                      style={{
                        color: "#787B9C",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {wallet.type}
                      {isMultisigDemoWallet(wallet) ? " (Demo Mode)" : ""}
                    </Text>
                  </View>
                  <IconButton
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                    onPress={() => {
                      Alert.alert(
                        "Are you sure?",
                        "This will remove the wallet from device.",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Confirm",
                            onPress: async () => {
                              await walletsStore.removeWallet(wallet.id);
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      style={{ color: "#7B87A8" }}
                    />
                  </IconButton>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View
          style={{
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => close()}
            style={{ paddingVertical: 15 }}
          >
            <Text style={{ color: "#787B9C" }}>
              <FormattedMessage
                id="accountpickermodal.close"
                defaultMessage="Close"
              />
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
);
